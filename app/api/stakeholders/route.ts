import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

const BANKING_TITLES = [
  'Executive Director','Managing Director','Chief Executive Officer',
  'Chief Information Officer','Chief Technology Officer','Chief Operating Officer',
  'Chief Strategy Officer','Chief Digital Officer','Chief Business Officer',
  'General Manager IT','General Manager','Head of Digital Transformation',
  'Head of Branch Banking','Head of Retail Assets','Head of Retail Banking',
  'Head of Liabilities','Head of Collections','Head of Lending','Head of Sales',
  'Head of IT','Head of Sales and Distribution','Head of Strategic Alliances',
  'VP Sales','VP Collections','VP Lending','VP IT','SVP Collections',
  'SVP Lending','SVP IT','Business Head','National Sales Head',
  'Assistant General Manager','President','Director Sales','DSA Head',
  'Head of Sales Enablement','Head of Strategic Initiatives','Co-founder','Founder',
]

const INSURANCE_TITLES = [
  'Executive Director','Managing Director','Chief Executive Officer',
  'Chief Information Officer','Chief Technology Officer','Chief Operating Officer',
  'Chief Strategy Officer','Chief Digital Officer','Chief Business Officer',
  'Head of Digital Transformation','General Manager','Head of Sales',
  'Head of IT','Head of Sales and Distribution','Head of Strategic Alliances',
  'VP Sales','Head of Agency','Head of Bancassurance','Head of Distribution',
  'Agency Director','VP IT','SVP IT','Chief Distribution Officer',
  'Head of Partnerships','Head of Innovation','Bancassurance Director',
  'VP Agency','VP Bancassurance','Head of Sales Enablement',
  'Head of Digital Enablement','Head of Persistency and Renewals',
  'Head of Strategic Initiatives','Co-founder','Founder',
]

async function aiOnlySearch(
  company: string,
  industry: string,
  research: string,
) {
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
  return NextResponse.json({
    mode: 'stakeholders',
    stakeholders: stakeholders.map((sk: any, i: number) => ({
      ...sk, source: 'ai', emailVerified: false, ...COLORS[i % COLORS.length],
    })),
    sources: { lusha: 0, ai: stakeholders.length },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { company, industry, research, lushaCompanyId, companyDomain } = await req.json()

    const isInsurance = industry.toLowerCase().includes('insurance')
    const icpTitles = isInsurance ? INSURANCE_TITLES : BANKING_TITLES

    // ── STEP 1: No company confirmed yet — search Lusha ───────
    if (!lushaCompanyId && !companyDomain) {
      try {
        const companySearchRes = await fetch(
          'https://api.lusha.com/prospecting/filters/companies/names',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api_key': process.env.LUSHA_API_KEY || '',
            },
            body: JSON.stringify({ text: company.split(' ')[0] }),
          }
        )
        const rawText = await companySearchRes.text()
        console.log('Lusha company search status:', companySearchRes.status)
        console.log('Lusha company search response:', rawText.slice(0, 500))

        const companyData = JSON.parse(rawText)
        const companies = Array.isArray(companyData) ? companyData : []
        // If rate limited, go straight to AI
if (companyData.statusCode === 429) {
  console.log('Lusha rate limited — falling back to AI')
  // Pass dummy org to trigger AI path directly
  return await POST(new NextRequest(req.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company,
      industry,
      research,
      lushaCompanyId: 'ai-fallback',
      companyDomain: company.toLowerCase().replace(/\s+/g, '') + '.com',
    }),
  }))
}

        if (companies.length > 0) {
          return NextResponse.json({
            mode: 'confirm_company',
            companies: companies.slice(0, 8).map((c: any) => ({
              id: c.companyId?.toString() || '',
              name: c.name || company,
              domain: c.fqdn || c.domain || '',
              industry: c.industry || industry,
              employees: c.employeeCount || null,
              city: c.city || '',
              country: c.country || 'India',
            })),
          })
        }
      } catch (e) {
        console.error('Lusha company search error:', e)
      }
      return await aiOnlySearch(company, industry, research)
    }

    // ── STEP 2: People search with confirmed company ──────────
    let lushaMapped: any[] = []

    try {
      const prospectBody: any = {
        filter: {
          jobTitles: icpTitles.slice(0, 20),
          countries: ['India'],
        },
        size: 25,
        from: 0,
      }

      if (companyDomain) {
        prospectBody.filter.companyDomains = [companyDomain.replace('www.', '')]
      } else if (lushaCompanyId) {
        prospectBody.filter.companyIds = [parseInt(lushaCompanyId)]
      }

     const prospectRes = await fetch('https://api.lusha.com/v2/prospecting/contacts/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api_key': process.env.LUSHA_API_KEY || '',
  },
  body: JSON.stringify(prospectBody),
})

      const prospectRaw = await prospectRes.text()
      console.log('Lusha prospecting status:', prospectRes.status)
      console.log('Lusha prospecting response:', prospectRaw.slice(0, 500))

      const prospectData = JSON.parse(prospectRaw)
      const people = prospectData.data || prospectData.contacts || prospectData.results || []

      lushaMapped = people.map((p: any, i: number) => {
        const firstName = p.firstName || p.first_name || ''
        const lastName = p.lastName || p.last_name || ''
        const name = `${firstName} ${lastName}`.trim()
        const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
        const email = p.email || p.workEmail ||
          `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyDomain || company.toLowerCase().replace(/\s+/g, '') + '.com'}`
        const title = p.jobTitle || p.title || p.job_title || ''
        const tags = [title]
        if (p.linkedInUrl || p.linkedin_url) tags.push('LinkedIn verified')
        if (p.email || p.workEmail) tags.push('Email verified')
        return {
          name, role: title, email, initials,
          linkedin: (p.linkedInUrl || p.linkedin_url || '').replace('https://', ''),
          tags, persona: `${title} at ${company}.`,
          painPoint: isInsurance
            ? 'Agent adoption, distribution visibility, and persistency management'
            : 'Sales productivity, collections efficiency, and lending pipeline visibility',
          source: 'lusha', emailVerified: !!(p.email || p.workEmail),
          lushaId: p.id, ...COLORS[i % COLORS.length],
        }
      })
    } catch (e) {
      console.error('Lusha prospecting error:', e)
    }

    // Ask Claude to fill gaps
    let aiMapped: any[] = []
    if (lushaMapped.length < 8) {
      try {
        const lushaNames = lushaMapped.map((s: any) => `${s.name} — ${s.role}`).join('\n')
        const aiMessage = await client.messages.create({
          model: 'claude-opus-4-6',
          max_tokens: 600,
          messages: [{
            role: 'user',
            content: `You are a sales intelligence expert for Vymo — AI-powered sales productivity platform for BFSI and insurance.
Company: ${company}, Industry: ${industry}
Lusha verified stakeholders already found:
${lushaNames || 'None'}
Suggest up to ${Math.max(2, 4 - lushaMapped.length)} additional stakeholders with roles NOT already covered. If list is comprehensive, return [].
Return ONLY valid JSON array, no markdown:
[{"name":"...","role":"...","email":"firstname.lastname@${companyDomain || company.toLowerCase().replace(/\s+/g, '') + '.com'}","initials":"..","linkedin":"linkedin.com/in/...","tags":["..."],"persona":"...","painPoint":"...","source":"ai"}]`,
          }],
        })
        const aiText = aiMessage.content[0].type === 'text' ? aiMessage.content[0].text : '[]'
        const cleaned = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        try {
          aiMapped = JSON.parse(cleaned)
          if (!Array.isArray(aiMapped)) aiMapped = []
        } catch {
          const match = aiText.match(/\[[\s\S]*\]/)
          if (match) { try { aiMapped = JSON.parse(match[0]) } catch { aiMapped = [] } }
        }
        aiMapped = aiMapped.map((sk: any, i: number) => ({
          ...sk, source: 'ai', emailVerified: false,
          ...COLORS[(lushaMapped.length + i) % COLORS.length],
        }))
      } catch (e) {
        console.error('AI suggestions error:', e)
      }
    }

    const allStakeholders = [...lushaMapped, ...aiMapped]
    if (allStakeholders.length === 0) {
      return await aiOnlySearch(company, industry, research)
    }

    return NextResponse.json({
      mode: 'stakeholders',
      stakeholders: allStakeholders,
      sources: { lusha: lushaMapped.length, ai: aiMapped.length },
    })

  } catch (error) {
    console.error('Stakeholders API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stakeholders' }, { status: 500 })
  }
}