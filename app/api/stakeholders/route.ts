import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { company, industry, research } = await req.json()

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are a sales intelligence researcher. Find 4 real senior stakeholders at ${company} who would be relevant buyers for Vymo — an AI-powered sales productivity platform for ${industry} companies.

Identify real people in these roles based on your knowledge of this company:
1. A VP or Head of Sales Operations or Distribution
2. CTO or VP Technology
3. Head of Distribution or Agency Channel
4. CFO or VP Finance

Research context: ${research ? research.slice(0, 400) : 'None'}

Return ONLY a valid JSON array with exactly 4 objects. No markdown, no explanation, just the raw JSON array.

Each object must have these exact fields:
- name: string (real full name if known, realistic otherwise)
- role: string (their exact title)
- email: string (firstname.lastname@${company.toLowerCase().replace(/\s+/g, '')}.com)
- initials: string (2 capital letters)
- linkedin: string (linkedin.com/in/firstname-lastname)
- tags: array of 2-3 strings
- persona: string (one sentence about what they care about)
- painPoint: string (the specific pain Vymo solves for them)

Example format:
[{"name":"Priya Mehta","role":"VP Sales Operations","email":"priya.mehta@company.com","initials":"PM","linkedin":"linkedin.com/in/priya-mehta","tags":["Decision Maker","Tech-forward"],"persona":"Cares about agent adoption and visibility","painPoint":"No unified view of agent activity across channels"}]`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    let stakeholders = []
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      stakeholders = JSON.parse(cleaned)
    } catch (e) {
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        try {
          stakeholders = JSON.parse(match[0])
        } catch (e2) {
          return NextResponse.json({ error: 'Failed to parse stakeholders' }, { status: 500 })
        }
      }
    }

    const colors = [
      { color: '#e8f4ff', textColor: '#0066cc' },
      { color: '#f0f0ff', textColor: '#6366f1' },
      { color: '#f0faf5', textColor: '#059669' },
      { color: '#fff7ed', textColor: '#d97706' },
    ]

    const enriched = stakeholders.map((sk: any, i: number) => ({
      ...sk,
      ...colors[i % colors.length],
    }))

    return NextResponse.json({ stakeholders: enriched })
  } catch (error) {
    console.error('Stakeholders API error:', error)
    return NextResponse.json({ error: 'Failed to find stakeholders' }, { status: 500 })
  }
}
