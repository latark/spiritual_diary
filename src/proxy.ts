import { NextResponse, type NextRequest } from 'next/server';

/**
 * Строгий CSP с nonce (CLAUDE.md §6). В Next 16 этот слой называется proxy.
 * Nonce пробрасывается в request-заголовок, чтобы Next подставил его в свои
 * инлайн-скрипты, и в response-заголовок CSP. style-src оставляем 'unsafe-inline'
 * — инлайн-стили Next/Framer Motion убрать нельзя, риск минимальный.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self' data:`,
    `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ]
    .join('; ')
    .concat(';');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', csp);
  return response;
}

export const config = {
  matcher: [{ source: '/((?!_next/static|_next/image|favicon.ico).*)' }],
};
