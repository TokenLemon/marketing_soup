import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { name, company, role, context } = await req.json()

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are Vymo's AI sales enablement agent. Vymo is an AI-powered sales productivity platform for BFSI and insurance companies — covering agent performance management, distribution management, sales coaching, and gamification.

Create a crisp meeting prep brief an AE can read in 90 seconds. Use these exact sections:

## Company Snapshot
2 lines on what the company does and their current strategic direction.

## Prospect Intel
Their likely priorities and pain points given their specific role. What keeps them up at night.

## Vymo Angle
Top 2 Vymo capabilities to lead with for this specific person and company. Be specific — not generic.

## Likely Objections
2 objections they might raise and exactly how to handle each one.

## Opening Question
One great question to start the meeting with. Should feel natural, not scripted.

## Things to Avoid
1-2 things not to say or do in this specific meeting.

Prospect: ${name}, ${role} at ${company}
Meeting context: ${context}

Be specific to this person's role and company. Not generic sales advice.`,
        },
      ],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Meeting prep API error:', error)
    return NextResponse.json({ error: 'Failed to generate prep brief' }, { status: 500 })
  }
}