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

export async function POST(req: NextRequest) {
  try {
    const { company, industry, research } = await req.json()

    const isInsurance = industry.toLowerCase().includes('insurance')
    const icpTitles = isInsurance ? INSURANCE_TITLES : BANKING_TITLES

    const colors = [
      { color: '#e8f4ff', textColor: '#0066cc' },
      { color: '#f0f0ff', textColor: '#6366f1' },
      { color: '#f0faf5', textColor: '#059669' },
      { color: '#fff7ed', textColor: '#d97706' },
      { color: '#fff5f5', textColor: '#dc2626' },
      { color: '#f0fdf4', textColor: '#16a34a' },
      { color: '#fdf4ff', textColor: '#9333ea' },
      { color: '#fefce8', textColor: '#ca8a04' },
    ]

    let apolloStakeholders: any[] = []
    let orgInfo: any = null

    // ── Step 1: Apollo search ──────────────────────────────────
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
          per_page: 1,
        }),
      })

      const orgData = await orgRes.json()
      orgInfo = orgData.organizations?.[0]

      if (orgInfo) {
        const peopleRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.APOLLO_API_KEY || '',
          },
          body: JSON.stringify({
            q_organization_name: company,
            person_titles: icpTitles,
            page: 1,
            per_page: 25,
            organization_ids: orgInfo.id ? [orgInfo.id] : [],
          }),
        })

        const peopleData = await peopleRes.json()
        apolloStakeholders = peopleData.people || []
      }
    } catch (apolloError) {
      console.error('Apollo error:', apolloError)
      // Continue — will fall back to Claude only
    }

    // ── Step 2: Map Apollo results ─────────────────────────────
    const apolloMapped = apolloStakeholders.map((p: any, i: number) => {
      const firstName = p.first_name || ''
      const lastName = p.last_name || ''
      const name = `${firstName} ${lastName}`.trim()
      const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
      const domain = orgInfo?.primary_domain ||
        `${company.toLowerCase().replace(/\s+/g, '')}.com`
      const email = p.email ||
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
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
        persona: `${p.title} at ${company} — key decision maker for sales productivity initiatives.`,
        painPoint: isInsurance
          ? 'Agent adoption, distribution visibility, and persistency management'
          : 'Sales productivity, collections efficiency, and lending pipeline visibility',
        source: 'apollo',
        emailVerified: p.email_status === 'verified',
        apolloId: p.id,
        ...colors[i % colors.length],
      }
    })

    // ── Step 3: Ask Claude to review and add any missing personas ──
    const apolloNames = apolloMapped.map((s: any) => `${s.name} — ${s.role}`).join('\n')

    const aiMessage = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `You are a sales intelligence expert for Vymo — an AI-powered sales productivity platform for BFSI and insurance companies.

Company: ${company}
Industry: ${industry}
Research context: ${research ? research.slice(0, 400) : 'None'}

Apollo has already found these verified stakeholders:
${apolloNames || 'None found'}

Your job:
1. Review the Apollo list. Are there any critical Vymo buyer personas missing that would be highly relevant for this specific company?
2. If yes, suggest up to 3 additional realistic stakeholders with roles NOT already covered above.
3. If the Apollo list already covers the key personas well, return an empty array.

Only add stakeholders if the role is genuinely relevant for Vymo's use case at this company.

Return ONLY a valid JSON array. No markdown, no explanation. Empty array [] if nothing to add.

Each object must have:
- name: realistic full name for this company's geography/culture
- role: specific title
- email: firstname.lastname@${orgInfo?.primary_domain || company.toLowerCase().replace(/\s+/g, '') + '.com'}
- initials: 2 capital letters
- linkedin: linkedin.com/in/firstname-lastname
- tags: array of 2-3 strings
- persona: one sentence about what they care about professionally
- painPoint: specific pain Vymo solves for them
- source: "ai"`,
        },
      ],
    })

    let aiSuggested: any[] = []
    const aiText = aiMessage.content[0].type === 'text' ? aiMessage.content[0].text : '[]'
    try {
      const cleaned = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      aiSuggested = JSON.parse(cleaned)
      if (!Array.isArray(aiSuggested)) aiSuggested = []
    } catch (e) {
      const match = aiText.match(/\[[\s\S]*\]/)
      if (match) {
        try { aiSuggested = JSON.parse(match[0]) } catch { aiSuggested = [] }
      }
    }

    // Add colors to AI suggested
    const aiMapped = aiSuggested.map((sk: any, i: number) => ({
      ...sk,
      source: 'ai',
      emailVerified: false,
      ...colors[(apolloMapped.length + i) % colors.length],
    }))

    // ── Step 4: Combine and return ─────────────────────────────
    const allStakeholders = [...apolloMapped, ...aiMapped]

    if (allStakeholders.length === 0) {
      return NextResponse.json({
        error: 'No stakeholders found. Try manual entry.',
        stakeholders: [],
      })
    }

    return NextResponse.json({
      stakeholders: allStakeholders,
      company: orgInfo ? {
        name: orgInfo.name,
        domain: orgInfo.primary_domain,
        industry: orgInfo.industry,
        employees: orgInfo.estimated_num_employees,
      } : null,
      sources: {
        apollo: apolloMapped.length,
        ai: aiMapped.length,
      },
    })
  } catch (error) {
    console.error('Stakeholders API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stakeholders' }, { status: 500 })
  }
}