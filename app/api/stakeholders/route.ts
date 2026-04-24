import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const BANKING_TITLES = [
  'Executive Director', 'Managing Director', 'Chief Executive Officer',
  'Chief Information Officer', 'Chief Technology Officer', 'Chief Operating Officer',
  'Chief Strategy Officer', 'Chief Digital Officer', 'Chief Business Officer',
  'General Manager IT', 'General Manager', 'Head of Digital Transformation',
  'Head of Branch Banking', 'Head of Retail Assets', 'Head of Retail Banking',
  'Head of Liabilities', 'Head of Collections', 'Head of Lending', 'Head of Sales',
  'Head of IT', 'Head of Sales and Distribution', 'Head of Strategic Alliances',
  'VP Sales', 'VP Collections', 'VP Lending', 'VP IT', 'SVP Collections',
  'SVP Lending', 'SVP IT', 'Business Head', 'National Sales Head',
  'Assistant General Manager', 'President', 'Director Sales', 'DSA Head',
  'Head of Sales Enablement', 'Head of Strategic Initiatives', 'Co-founder', 'Founder',
]

const INSURANCE_TITLES = [
  'Executive Director', 'Managing Director', 'Chief Executive Officer',
  'Chief Information Officer', 'Chief Technology Officer', 'Chief Operating Officer',
  'Chief Strategy Officer', 'Chief Digital Officer', 'Chief Business Officer',
  'Head of Digital Transformation', 'General Manager', 'Head of Sales',
  'Head of IT', 'Head of Sales and Distribution', 'Head of Strategic Alliances',
  'VP Sales', 'Head of Agency', 'Head of Bancassurance', 'Head of Distribution',
  'Agency Director', 'VP IT', 'SVP IT', 'Chief Distribution Officer',
  'Head of Partnerships', 'Head of Innovation', 'Bancassurance Director',
  'VP Agency', 'VP Bancassurance', 'Head of Sales Enablement',
  'Head of Digital Enablement', 'Head of Persistency and Renewals',
  'Head of Strategic Initiatives', 'Co-founder', 'Founder',
]

const COLORS = [
  { color: '#e8f4ff', textColor: '#0066cc' },
  { color: '#f0f0ff', textColor: '#6366f1' },
  { color: '#f0faf5', textColor: '#059669' },
  { color: '#fff7ed', textColor: '#d97706' },
  { color: '#fff5f5', textColor: '#dc2626' },
  { color: '#f0fdf4', textColor: '#16a34a' },
  { color: '#fdf4ff', textColor: '#9333ea' },
  { color: '#fefce8', textColor: '#ca8a04' },
]

export async function POST(req: NextRequest) {
  try {
    const { company, industry, research, apolloOrgId, apolloDomain } = await req.json()

    const isInsurance = industry.toLowerCase().includes('insurance')
    const icpTitles = isInsurance ? INSURANCE_TITLES : BANKING_TITLES

    // ── MODE 1: Company search only (returns org options for user to pick) ──
    if (!apolloOrgId) {
      try {
        const orgRes = await fetch('https://api.apollo.io/v1/mixed_companies/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.APOLLO_API_KEY || '',
          },
          body: JSON.stringify({
            q_organization_name: company,
            page: 1,
            per_page: 8,
          }),
        })

        const orgData = await orgRes.json()
        const orgs = orgData.organizations || []

        if (orgs.length > 0) {
          return NextResponse.json({
            mode: 'confirm_company',
            companies: orgs.map((o: any) => ({
              id: o.id,
              name: o.name,
              domain: o.primary_domain,
              industry: o.industry,
              employees: o.estimated_num_employees,
              city: o.city,
              country: o.country,
            })),
          })
        }
      } catch (e) {
        console.error('Apollo org search error:', e)
      }

      // Apollo failed — go straight to AI
      return await aiOnlySearch(company, industry, research, isInsurance)
    }

    // ── MODE 2: People search with confirmed org ──────────────
    let apolloStakeholders: any[] = []

    try {
      // Search by domain which is more reliable than org ID
      const searchBody: any = {
        person_titles: icpTitles,
        page: 1,
        per_page: 25,
      }

      if (apolloDomain) {
        searchBody.q_organization_domains = [apolloDomain]
      } else {
        searchBody.organization_ids = [apolloOrgId]
      }

      const peopleRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.APOLLO_API_KEY || '',
        },
        body: JSON.stringify(searchBody),
      })

      const peopleData = await peopleRes.json()
      apolloStakeholders = peopleData.people || []
      console.log(`Apollo returned ${apolloStakeholders.length} people for ${company}`)
    } catch (e) {
      console.error('Apollo people search error:', e)
    }

    // Map Apollo results
    const apolloMapped = apolloStakeholders.map((p: any, i: number) => {
      const firstName = p.first_name || ''
      const lastName = p.last_name || ''
      const name = `${firstName} ${lastName}`.trim()
      const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
      const domain = apolloDomain || `${company.toLowerCase().replace(/\s+/g, '')}.com`
      const email = p.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
      const tags = [p.title || '']
      if (p.linkedin_url) tags.push('LinkedIn verified')
      if (p.email_status === 'verified') tags.push('Email verified')

      return {
        name,
        role: p.title || '',
        email,
        initials,
        linkedin: p.linkedin_url?.replace('https://', '') || '',
        tags,
        persona: `${p.title} at ${company} — decision maker for sales productivity initiatives.`,
        painPoint: isInsurance
          ? 'Agent adoption, distribution visibility, and persistency management'
          : 'Sales productivity, collections efficiency, and lending pipeline visibility',
        source: 'apollo',
        emailVerified: p.email_status === 'verified',
        apolloId: p.id,
        ...COLORS[i % COLORS.length],
      }
    })

    // Ask Claude to fill gaps and add missing personas
    const apolloNames = apolloMapped.map((s: any) => `${s.name} — ${s.role}`).join('\n')
    const aiMessage = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a sales intelligence expert for Vymo — an AI-powered sales productivity platform for BFSI and insurance.

Company: ${company}
Industry: ${industry}

Apollo verified stakeholders already found:
${apolloNames || 'None'}

Are there any critical Vymo buyer personas missing? Suggest up to 2 additional stakeholders with roles NOT already covered. If Apollo list is comprehensive, return [].

Return ONLY valid JSON array, no markdown:
[{"name":"...","role":"...","email":"firstname.lastname@${apolloDomain || company.toLowerCase().replace(/\s+/g, '') + '.com'}","initials":"..","linkedin":"linkedin.com/in/...","tags":["..."],"persona":"...","painPoint":"...","source":"ai"}]`,
      }],
    })

    let aiSuggested: any[] = []
    const aiText = aiMessage.content[0].type === 'text' ? aiMessage.content[0].text : '[]'
    try {
      const cleaned = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      aiSuggested = JSON.parse(cleaned)
      if (!Array.isArray(aiSuggested)) aiSuggested = []
    } catch {
      const match = aiText.match(/\[[\s\S]*\]/)
      if (match) { try { aiSuggested = JSON.parse(match[0]) } catch { aiSuggested = [] } }
    }

    const aiMapped = aiSuggested.map((sk: any, i: number) => ({
      ...sk,
      source: 'ai',
      emailVerified: false,
      ...COLORS[(apolloMapped.length + i) % COLORS.length],
    }))

    const allStakeholders = [...apolloMapped, ...aiMapped]

    return NextResponse.json({
      mode: 'stakeholders',
      stakeholders: allStakeholders,
      sources: { apollo: apolloMapped.length, ai: aiMapped.length },
    })

  } catch (error) {
    console.error('Stakeholders API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stakeholders' }, { status: 500 })
  }
}

async function aiOnlySearch(company: string, industry: string, research: string, isInsurance: boolean) {
  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Find 4 realistic senior stakeholders at ${company} relevant for Vymo (AI sales productivity platform for ${industry}).
Research: ${research?.slice(0, 300) || 'None'}
Return ONLY a JSON array, no markdown:
[{"name":"...","role":"...","email":"...","initials":"..","linkedin":"linkedin.com/in/...","tags":["..."],"persona":"...","painPoint":"...","source":"ai"}]`,
    }],
  })
  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  let stakeholders = []
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    stakeholders = JSON.parse(cleaned)
  } catch {
    const match = text.match(/\[[\s\S]*\]/)
    if (match) { try { stakeholders = JSON.parse(match[0]) } catch { stakeholders = [] } }
  }
  const COLORS = [
    { color: '#e8f4ff', textColor: '#0066cc' },
    { color: '#f0f0ff', textColor: '#6366f1' },
    { color: '#f0faf5', textColor: '#059669' },
    { color: '#fff7ed', textColor: '#d97706' },
  ]
  return NextResponse.json({
    mode: 'stakeholders',
    stakeholders: stakeholders.map((sk: any, i: number) => ({
      ...sk, source: 'ai', emailVerified: false, ...COLORS[i % COLORS.length],
    })),
    sources: { apollo: 0, ai: stakeholders.length },
  })
}