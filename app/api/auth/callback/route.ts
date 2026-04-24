import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const redirectUri = state || `${protocol}://${host}/api/auth/callback`

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)

    const response = NextResponse.redirect(
      new URL('/?gmail=connected', `${protocol}://${host}`)
    )

    response.cookies.set('gmail_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: protocol === 'https',
      maxAge: 60 * 60,
      path: '/',
    })

    if (tokens.refresh_token) {
      response.cookies.set('gmail_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: protocol === 'https',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Gmail auth error:', error)
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
  }
}
