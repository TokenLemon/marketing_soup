import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

function makeEmail(to: string, subject: string, body: string, from: string): string {
  const emailLines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    body,
  ]
  const email = emailLines.join('\r\n')
  return Buffer.from(email).toString('base64url')
}

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, fromName } = await req.json()

    // Get tokens from cookies
    const accessToken = req.cookies.get('gmail_access_token')?.value
    const refreshToken = req.cookies.get('gmail_refresh_token')?.value

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: 'Gmail not connected. Please connect your Gmail account first.' },
        { status: 401 }
      )
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Get sender email
    const profile = await gmail.users.getProfile({ userId: 'me' })
    const fromEmail = profile.data.emailAddress || ''
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail

    const rawEmail = makeEmail(to, subject, body, from)

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: rawEmail },
    })

    return NextResponse.json({
      success: true,
      message: `Email sent to ${to}`,
      from: fromEmail,
    })
  } catch (error: any) {
    console.error('Send email error:', error)
    if (error?.status === 401 || error?.code === 401) {
      return NextResponse.json(
        { error: 'Gmail session expired. Please reconnect your Gmail account.' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to send email. ' + (error?.message || '') },
      { status: 500 }
    )
  }
}