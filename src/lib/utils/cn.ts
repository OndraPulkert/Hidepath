import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Spojí třídy a vyřeší konflikty Tailwind utilit (shadcn konvence). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
