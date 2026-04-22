import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { company, stakeholder, research, steps } = await req.json()

    const content: any[] = []

    for (const step of steps) {
      const isHuman = ['LinkedIn', 'LinkedIn Comment', 'Call'].includes(step.channel)

      if (isHuman) {
        // Generate prep notes for human steps
        const message = await client.messages.create({
          model: 'claude-opus-4-6',
          max_tokens: 400,
          messages: [
            {
              role: 'user',
              content: `You are Vymo's outreach AI. Write a brief preparation note for a ${step.channel} outreach step.

Stakeholder: ${stakeholder.name}, ${stakeholder.role} at ${company}
Action: ${step.action}
Timing: ${step.timing}

For LinkedIn: write a personalised connection message (under 300 characters) they can copy-paste.
For Call: write a 3-line talk track — opening line, key point, and soft CTA.

Be specific to this person's role and company context. Do not be generic.

Research context: ${research.slice(0, 300)}`,
            },
          ],
        })

        const text = message.content[0].type === 'text' ? message.content[0].text : ''
        content.push({
          step: step.step,
          type: 'human',
          channel: step.channel,
          body: text,
        })
      } else {
        // Generate email
        const message = await client.messages.create({
          model: 'claude-opus-4-6',
          max_tokens: 600,
          messages: [
            {
              role: 'user',
              content: `You are Vymo's outreach copywriter. Write a personalised cold outreach email.

Vymo is an AI-powered sales productivity platform for BFSI and insurance companies.

Stakeholder: ${stakeholder.name}, ${stakeholder.role} at ${company}
Persona: ${stakeholder.persona}
Email purpose: ${step.action}
Timing context: ${step.timing}

Research highlights:
${research.slice(0, 400)}

Rules:
- Feel human and specific, not generic or salesy
- Reference something real about the company from research
- Connect their pain point to Vymo naturally
- Under 150 words
- End with a soft, low-friction CTA
- No subject line fluff like "Quick question" or "Following up"

Output exactly:
SUBJECT: [subject line]
BODY:
[email body]`,
            },
          ],
        })

        const text = message.content[0].type === 'text' ? message.content[0].text : ''
        const subjectMatch = text.match(/SUBJECT:\s*(.+)/i)
        const bodyMatch = text.match(/BODY:\s*([\s\S]+)/i)

        content.push({
          step: step.step,
          type: 'email',
          channel: 'Email',
          subject: subjectMatch?.[1]?.trim() || `Vymo for ${company}`,
          body: bodyMatch?.[1]?.trim() || text,
        })
      }
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}