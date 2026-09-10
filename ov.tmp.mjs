import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
await p.setContent(`<body style="margin:0">${readFileSync('ov.tmp.svg','utf8')}</body>`);
const el = await p.$('svg');
await el.screenshot({ path: process.env.CLAUDE_JOB_DIR + '/tmp/overlay.png', scale: 2 });
await b.close();
