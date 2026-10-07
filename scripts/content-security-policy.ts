/**
 * Content Security Policy aplikace (SPA). Vkládá se při buildu jako <meta> do index.html
 * (vite.config.ts), protože hlavička CSP z public/_headers platí i pro statické animace
 * v public/animace, které mají inline skripty. Zákaz rámců (frame-ancestors) v <meta>
 * nefunguje – ten posílá public/_headers spolu s X-Frame-Options.
 *
 * `style-src 'unsafe-inline'`: React `style={…}` a <style> na tiskových stránkách.
 */
export function appContentSecurityPolicy(supabaseUrl: string): string {
  const supabase: string[] = [];
  if (supabaseUrl) {
    const { origin, host, protocol } = new URL(supabaseUrl);
    supabase.push(origin, `${protocol === 'http:' ? 'ws' : 'wss'}://${host}`);
  }
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "media-src 'self' blob:",
    ["connect-src 'self'", ...supabase].join(' '),
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}
