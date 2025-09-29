import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only run middleware on auth callback route for now
     */
    '/auth/callback',
  ],
}
