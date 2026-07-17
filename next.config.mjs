/**
 * Cabeçalhos de segurança aplicados a todas as respostas.
 *
 * Obs.: não incluímos Content-Security-Policy estrita aqui de propósito — uma
 * CSP baseada em nonce exige middleware e teste contra o app rodando (o Next
 * injeta scripts inline de hidratação). Fica como próximo passo; ver
 * MELHORIAS-SEGURANCA.md itens 8 e 10.
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
