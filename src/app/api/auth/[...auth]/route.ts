import { auth } from '@/server/lib/auth'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  return handleAuthRequest(request)
}

export async function POST(request: NextRequest) {
  return handleAuthRequest(request)
}

async function handleAuthRequest(request: NextRequest) {
  try {
    // Convert NextRequest to standard Request for better-auth compatibility
    const url = new URL(request.url)
    
    const req = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    })

    // Use the auth handler directly - it returns a proper Response object
    const response = await auth.handler(req)
    
    return response
  } catch (error) {
    console.error('Auth handler error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}