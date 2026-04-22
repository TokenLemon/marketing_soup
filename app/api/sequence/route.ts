import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { company, stakeholder, research } = await req.json()

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are Vymo's adaptive outreach AI. Design a personalised outreach sequence for this specific stakeholder. Do NOT use a fixed playbook. Reason about who this person is and what approach will work best for them.

Generate exactly 5 sequence steps. For each step use EXACTLY this format with no deviation:

STEP: [number]
CHANNEL: [Email OR LinkedIn OR LinkedIn Comment OR Call]
TIMING: [e.g. Day 1, Day 3 if opened, Day 7 if no reply]
TRIGGER: [what signal determines if this step fires]
ACTION: [brief description of what happens]
REASON: [one sentence why this specific approach for this specific person]
---

Company: ${company}
Stakeholder: ${stakeholder.name}, ${stakeholder.role}
Persona: ${stakeholder.persona}
Research summary: ${research.slice(0, 500)}

Rules:
- Senior technical people (CTO, CIO) prefer email first then call
- LinkedIn active people should get LinkedIn comment or connection early
- Economic buyers (CFO) need ROI framing from step 1
- Never put Call before at least one warm touch
- Mix channels based on persona, not habit`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    
    const blocks = text.split('---').filter((b: string) => b.trim())
    const steps = blocks.slice(0, 5).map((b: string) => {
      const get = (key: string) => {
        const match = b.match(new RegExp(key + ':\\s*(.+)', 'i'))
        return match?.[1]?.trim() || ''
      }
      return {
        step: get('STEP'),
        channel: get('CHANNEL'),
        timing: get('TIMING'),
        trigger: get('TRIGGER'),
        action: get('ACTION'),
        reason: get('REASON'),
      }
    })

    return NextResponse.json({ steps })
  } catch (error) {
    console.error('Sequence API error:', error)
    return NextResponse.json({ error: 'Failed to build sequence' }, { status: 500 })
  }
}