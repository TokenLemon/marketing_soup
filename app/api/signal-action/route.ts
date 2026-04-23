import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { signal } = await req.json()

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `You are Vymo's AI sales assistant. Based on this engagement signal, generate the specific action content requested.

Signal: ${signal.title}
Context: ${signal.desc}
Recommended action: ${signal.aiAction}
Action requested: ${signal.actionLabel}

Generate the specific content for this action:
- If LinkedIn message: write a personalised connection note under 300 characters
- If call script: write opening line, key point, and soft CTA — 3 lines total
- If email: write subject line and short email body under 100 words
- If reminder: write a brief re-engagement strategy for 30 days later
- If booking: write a short calendar invite message

Be specific, human, and relevant to the signal context. No generic templates.`,
        },
      ],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Signal action API error:', error)
    return NextResponse.json({ error: 'Failed to generate action' }, { status: 500 })
  }
}