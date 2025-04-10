import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // CSRF protection using double submit cookie pattern
  if (path.startsWith('/api/') && request.method !== 'GET') {
    const csrfToken = request.cookies.get('csrf-token');
    const csrfHeader = request.headers.get('X-CSRF-Token');

    if (!csrfToken || !csrfHeader || csrfToken.value !== csrfHeader) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Protected routes handling
  if (path.startsWith('/api/protected/')) {
    const token = await getToken({ req: request });
    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Rate limiting (basic implementation - consider using Redis for production)
  const ip = request.headers.get('x-forwarded-for') || request.ip;
  const rateLimit = await getRateLimit(ip);
  if (rateLimit.exceeded) {
    return new NextResponse(
      JSON.stringify({ message: 'Too many requests' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure which paths to run middleware on
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/admin/:path*'
  ]
};

// Rate limiting implementation
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

const rateLimits = new Map();

async function getRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE;
  
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, []);
  }
  
  const requests = rateLimits.get(ip);
  const windowRequests = requests.filter(time => time > windowStart);
  
  rateLimits.set(ip, [...windowRequests, now]);
  
  return {
    exceeded: windowRequests.length >= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - windowRequests.length),
    reset: now + WINDOW_SIZE
  };
}
