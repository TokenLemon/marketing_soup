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
    const domain = company.toLowerCase().replace(/\s+/g, '') + '.com'

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `You are a B2B sales intelligence expert for Vymo — an AI-powered sales productivity platform for BFSI and insurance companies in India.

Find real senior stakeholders at ${company} who match these ICP roles:
${icpTitles.slice(0, 15).join(', ')}

Research context: ${research?.slice(0, 400) || 'None'}

Use your knowledge of this specific company to identify real people in relevant roles. For well-known Indian BFSI companies like HDFC Life, Max Life, SBI Life, Bajaj Allianz, ICICI Prudential etc — you know the actual leadership. Use real names where you know them.

Return ONLY a valid JSON array of 4-6 stakeholders. No markdown, no explanation, just the raw JSON array.

Each object must have exactly these fields:
- name: real full name (use actual person if known, realistic otherwise)
- role: their exact title
- email: firstname.lastname@${domain}
- initials: first 2 capital letters of name
- linkedin: linkedin.com/in/firstname-lastname (realistic URL)
- tags: array of 2-3 relevant strings
- persona: one sentence about their professional priorities
- painPoint: specific pain point Vymo solves for them
- source: "ai"

Example:
[{"name":"Vibha Padalkar","role":"MD & CEO","email":"vibha.padalkar@hdfclife.com","initials":"VP","linkedin":"linkedin.com/in/vibhapadalkar","tags":["C-Suite","Strategy","Insurance"],"persona":"Drives overall business growth and digital transformation","painPoint":"Scaling agent productivity across distribution channels","source":"ai"}]`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    let stakeholders = []

    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      stakeholders = JSON.parse(cleaned)
      if (!Array.isArray(stakeholders)) stakeholders = []
    } catch {
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        try { stakeholders = JSON.parse(match[0]) } catch { stakeholders = [] }
      }
    }

    const enriched = stakeholders.map((sk: any, i: number) => ({
      ...sk,
      source: 'ai',
      emailVerified: false,
      ...COLORS[i % COLORS.length],
    }))

    return NextResponse.json({
      mode: 'stakeholders',
      stakeholders: enriched,
      sources: { lusha: 0, ai: enriched.length },
    })

  } catch (error) {
    console.error('Stakeholders API error:', error)
    return NextResponse.json({ error: 'Failed to find stakeholders' }, { status: 500 })
  }
}