import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { company, industry, size, context } = await req.json()

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are Vymo's AI account intelligence agent. Vymo is an AI-powered sales productivity and distribution management platform used by insurance, BFSI and financial services companies.

Research this company and produce a sharp intelligence brief with these exact sections:

COMPANY SNAPSHOT
2-3 lines: what they do, scale, market position, recent direction.

RECENT SIGNALS
3-4 bullet points: notable news, leadership changes, digital initiatives, funding, expansion moves. Be specific and plausible for this type of company.

KEY PAIN POINTS
3-4 bullet points: specific operational and strategic challenges this company faces that Vymo directly solves.

VYMO FIT
Which 2-3 Vymo capabilities are most relevant and exactly why for this company.

BEST OUTREACH ANGLE
The single strongest hook — what makes Vymo timely and relevant for this company right now.

Company: ${company}
Industry: ${industry}
Size: ${size}
Additional context: ${context || 'None provided'}

Be sharp, specific, and sales-ready. Max 300 words.`,
        },
      ],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json({ error: 'Failed to run research' }, { status: 500 })
  }
}