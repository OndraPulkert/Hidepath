import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { appContentSecurityPolicy } from './content-security-policy';

describe('bezpečnostní hlavičky nasazeného webu', () => {
  it('public/_headers posílá nosniff, referrer, zákaz rámců a základní CSP pro všechny cesty', () => {
    const headers = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8');
    const all = headers.split(/\n(?=\/)/).find((block) => block.startsWith('/*\n'))!;
    expect(all).toMatch(/^\s+X-Content-Type-Options: nosniff$/m);
    expect(all).toMatch(/^\s+Referrer-Policy: strict-origin-when-cross-origin$/m);
    expect(all).toMatch(/^\s+X-Frame-Options: DENY$/m);
    expect(all).toMatch(/^\s+Content-Security-Policy: .*frame-ancestors 'none'/m);
    // Animace (public/animace) mají inline skripty – CSP pro všechny cesty je nesmí blokovat.
    expect(all).not.toMatch(/script-src/);
  });

  it('CSP aplikace: skripty jen z vlastního původu, spojení jen na vlastní Supabase', () => {
    const csp = appContentSecurityPolicy('https://abc.supabase.co');
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe/);
    expect(csp).toContain("connect-src 'self' https://abc.supabase.co wss://abc.supabase.co");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(appContentSecurityPolicy('')).toContain("connect-src 'self';");
  });
});
