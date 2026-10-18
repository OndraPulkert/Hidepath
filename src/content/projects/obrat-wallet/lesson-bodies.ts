import { type ComponentType } from 'react';

/**
 * Dlouhý text lekcí (MDX). Klíč = slug lekce podle názvu souboru.
 * Strukturované části (kroky, kontrolní body, média) jsou v project.ts, ne v MDX.
 */
const modules = import.meta.glob<{ default: ComponentType }>('./lessons/*.mdx', { eager: true });

export const lessonBodies: Readonly<Record<string, ComponentType>> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const slug = path.replace('./lessons/', '').replace(/\.mdx$/, '');
    return [slug, mod.default];
  }),
);
