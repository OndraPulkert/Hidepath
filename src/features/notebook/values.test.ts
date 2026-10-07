import { type RecordField } from '@/content/schema';
import {
  evaluateTarget,
  formatDecimal,
  formatRecordValue,
  parseDecimal,
  parseRecordInput,
  recordInputText,
} from '@/features/notebook/values';

const NBSP = ' ';

const mm: RecordField = {
  kind: 'number',
  id: 'p1-thickness',
  label: 'Tloušťka P1',
  unit: 'mm',
  min: 0.3,
  max: 2,
  decimals: 2,
};
const line: RecordField = {
  kind: 'number',
  id: 'print-line',
  label: 'Úsečka',
  unit: 'mm',
  target: { min: 49.5, max: 50.5, label: 'cíl 50 mm' },
};
const pieces: RecordField = {
  kind: 'number',
  id: 'cards',
  label: 'Karty',
  unit: 'ks',
  decimals: 0,
};
const layers: RecordField = { kind: 'number', id: 'layers', label: 'Vrstvy', unit: '×' };
const k: RecordField = { kind: 'number', id: 'k', label: 'k', unit: '' };
const offset: RecordField = {
  kind: 'number',
  id: 'offset',
  label: 'Odchylka',
  unit: 'mm',
  min: -3,
};
const choice: RecordField = {
  kind: 'choice',
  id: 'glue',
  label: 'Lepidlo',
  options: [
    { value: 'better', label: 'Drží líp' },
    { value: 'same', label: 'Stejně' },
  ],
};
const text: RecordField = { kind: 'text', id: 'stiffness', label: 'Tuhost', maxLength: 5 };

describe('zápisník – čtení hodnot', () => {
  it('čte desetinnou čárku i tečku a odmítne jednotku nebo text', () => {
    expect(parseDecimal('0,85')).toBe(0.85);
    expect(parseDecimal(' 0.9 ')).toBe(0.9);
    expect(parseDecimal('-0,4')).toBe(-0.4);
    expect(parseDecimal('−0,4')).toBe(-0.4);
    expect(parseDecimal('0,8 mm')).toBeUndefined();
    expect(parseDecimal('abc')).toBeUndefined();
    expect(parseDecimal('')).toBeUndefined();
  });

  it('prázdné pole znamená vymazat', () => {
    expect(parseRecordInput(mm, '   ')).toEqual({ ok: true, value: null });
    expect(parseRecordInput(choice, '')).toEqual({ ok: true, value: null });
    expect(parseRecordInput(text, '')).toEqual({ ok: true, value: null });
  });

  it('číslo v mezích pole projde, mimo meze vrátí českou chybu', () => {
    expect(parseRecordInput(mm, '0,95')).toEqual({ ok: true, value: 0.95 });
    expect(parseRecordInput(mm, '2,5')).toEqual({
      ok: false,
      error: `Zadejte číslo od 0,3 do 2${NBSP}mm.`,
    });
    expect(parseRecordInput(mm, 'x')).toEqual({ ok: false, error: 'Zadejte číslo, např. 0,85.' });
  });

  it('bez min nepustí záporné číslo, se záporným min ano', () => {
    expect(parseRecordInput(line, '-1')).toEqual({
      ok: false,
      error: `Zadejte číslo 0${NBSP}mm nebo větší.`,
    });
    expect(parseRecordInput(offset, '-0,4')).toEqual({ ok: true, value: -0.4 });
  });

  it('pole s decimals 0 chce celé číslo', () => {
    expect(parseRecordInput(pieces, '3')).toEqual({ ok: true, value: 3 });
    expect(parseRecordInput(pieces, '2,5')).toEqual({ ok: false, error: 'Zadejte celé číslo.' });
  });

  it('volba jen z nabídky, text s limitem délky', () => {
    expect(parseRecordInput(choice, 'same')).toEqual({ ok: true, value: 'same' });
    expect(parseRecordInput(choice, 'worse')).toMatchObject({ ok: false });
    expect(parseRecordInput(text, ' tuhý ')).toEqual({ ok: true, value: 'tuhý' });
    expect(parseRecordInput(text, 'příliš dlouhé')).toEqual({
      ok: false,
      error: 'Nejvýš 5 znaků.',
    });
  });
});

describe('zápisník – zobrazení', () => {
  it('formátuje číslo česky podle decimals a s jednotkou', () => {
    expect(formatDecimal(0.9, 2)).toBe('0,90');
    expect(formatDecimal(1.23456)).toBe('1,235');
    expect(formatDecimal(50)).toBe('50');
    expect(formatRecordValue(mm, 0.9)).toBe(`0,90${NBSP}mm`);
    expect(formatRecordValue(pieces, 3)).toBe(`3${NBSP}ks`);
    expect(formatRecordValue(layers, 2)).toBe('2×');
    expect(formatRecordValue(k, 1.3)).toBe('1,3');
  });

  it('volba se zobrazí popiskem, neznámá hodnota sama sebou', () => {
    expect(formatRecordValue(choice, 'better')).toBe('Drží líp');
    expect(formatRecordValue(choice, 'old-option')).toBe('old-option');
  });

  it('nic nezobrazí pro vymazaný zápis nebo hodnotu, která k poli nepasuje', () => {
    expect(formatRecordValue(mm, null)).toBeNull();
    expect(formatRecordValue(mm, undefined)).toBeNull();
    expect(formatRecordValue(mm, 'text')).toBeNull();
    expect(formatRecordValue(choice, 3)).toBeNull();
    expect(formatRecordValue(text, '   ')).toBeNull();
  });

  it('do pole formuláře vrací číslo bez jednotky s čárkou', () => {
    expect(recordInputText(mm, 0.95)).toBe('0,95');
    expect(recordInputText(mm, null)).toBe('');
    expect(recordInputText(text, 'abc')).toBe('abc');
    expect(recordInputText(mm, 'abc')).toBe('');
  });
});

describe('zápisník – cíl z lekce', () => {
  it('ok v rozmezí včetně mezí, warn mimo, unknown bez cíle nebo čísla', () => {
    expect(evaluateTarget(line, 50)).toBe('ok');
    expect(evaluateTarget(line, 49.5)).toBe('ok');
    expect(evaluateTarget(line, 50.5)).toBe('ok');
    expect(evaluateTarget(line, 51)).toBe('warn');
    expect(evaluateTarget(line, 49)).toBe('warn');
    expect(evaluateTarget(line, null)).toBe('unknown');
    expect(evaluateTarget(mm, 0.9)).toBe('unknown');
    expect(evaluateTarget(choice, 'same')).toBe('unknown');
  });

  it('jednostranný cíl (jen max)', () => {
    const offsetMax: RecordField = {
      kind: 'number',
      id: 'v12',
      label: 'V12',
      unit: 'mm',
      target: { max: 0.3, label: 'do 0,3 mm' },
    };
    expect(evaluateTarget(offsetMax, 0.3)).toBe('ok');
    expect(evaluateTarget(offsetMax, 0.31)).toBe('warn');
  });
});

describe('zápisník – přesnost podle decimals', () => {
  const divider: RecordField = {
    kind: 'number',
    id: 'd1-thickness',
    label: 'D1',
    unit: 'mm',
    decimals: 2,
    target: { max: 0.92, label: 'nejvýš 0,92 mm' },
  };
  const calibration: RecordField = {
    kind: 'number',
    id: 'print-line',
    label: 'Úsečka',
    unit: 'mm',
    decimals: 1,
    target: { min: 50, max: 50, label: 'cíl přesně 50 mm' },
  };

  it('uloží číslo zaokrouhlené na decimals – zobrazení, pole i cíl se shodnou', () => {
    const parsed = parseRecordInput(divider, '0,921');
    expect(parsed).toEqual({ ok: true, value: 0.92 });
    const value = parsed.ok ? parsed.value : null;
    expect(formatRecordValue(divider, value)).toBe(`0,92${NBSP}mm`);
    expect(recordInputText(divider, value)).toBe('0,92');
    expect(evaluateTarget(divider, value)).toBe('ok');
  });

  it('kalibrační úsečka 50,04 s decimals 1 je 50,0 a v cíli', () => {
    const parsed = parseRecordInput(calibration, '50,04');
    expect(parsed).toEqual({ ok: true, value: 50 });
    expect(evaluateTarget(calibration, parsed.ok ? parsed.value : null)).toBe('ok');
  });

  it('meze pole se kontrolují na zaokrouhlené hodnotě', () => {
    expect(parseRecordInput(mm, '2,004')).toEqual({ ok: true, value: 2 });
  });
});
