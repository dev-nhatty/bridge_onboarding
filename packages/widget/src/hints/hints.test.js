import { describe, expect, it, vi } from 'vitest';
import { detectHints, shouldOffer, dispatchOffer } from './hints.js';

function env({ languages = ['en'], language = 'en', saveData = false, effectiveType = '4g', media = {}, fontSize = '16px' } = {}) {
  const probe = { style: {}, setAttribute: vi.fn(), remove: vi.fn() };
  const body = { appendChild: vi.fn(), contains: () => true };
  const doc = { body, createElement: vi.fn(() => probe) };
  return {
    navigator: { languages, language, connection: { saveData, effectiveType } },
    matchMedia: (query) => ({ matches: Boolean(media[query]) }), document: doc,
    getComputedStyle: () => ({ fontSize }), probe, body,
  };
}

describe('detectHints', () => {
  it('detects each strong and weak browser hint', () => {
    const e = env({ languages: ['am-ET'], saveData: true, effectiveType: '2g', media: {
      '(prefers-contrast: more)': true, '(forced-colors: active)': true, '(prefers-reduced-motion: reduce)': true,
    }, fontSize: '20px' });
    expect(detectHints(e)).toEqual([
      { id: 'lang-am', strength: 'strong' }, { id: 'save-data', strength: 'strong' },
      { id: 'high-contrast', strength: 'weak' }, { id: 'forced-colors', strength: 'weak' },
      { id: 'reduced-motion', strength: 'weak' }, { id: 'slow-network', strength: 'weak' },
      { id: 'large-font', strength: 'weak' },
    ]);
    expect(e.body.appendChild).toHaveBeenCalledWith(e.probe);
    expect(e.probe.remove).toHaveBeenCalledOnce();
  });
  it('uses reduced-data media when saveData is not set', () => {
    const e = env({ saveData: false, media: { '(prefers-reduced-data: reduce)': true } });
    e.navigator.connection.saveData = undefined;
    expect(detectHints(e)).toContainEqual({ id: 'save-data', strength: 'strong' });
  });
  it('does not throw when browser APIs are absent', () => { expect(detectHints({})).toEqual([]); });
});

describe('shouldOffer', () => {
  it('offers for one strong reason or two weak reasons', () => {
    expect(shouldOffer([{ id: 'save-data', strength: 'strong' }])).toBe(true);
    expect(shouldOffer([{ id: 'forced-colors', strength: 'weak' }, { id: 'reduced-motion', strength: 'weak' }])).toBe(true);
    expect(shouldOffer([{ id: 'reduced-motion', strength: 'weak' }])).toBe(false);
    expect(shouldOffer([])).toBe(false);
  });
});


describe('dispatchOffer', () => {
  it('emits exactly the reasons detail and bubbles through composed trees', () => {
    const target = new EventTarget();
    let event;
    target.addEventListener('bridge:offer', (received) => { event = received; });
    expect(dispatchOffer(target, [{ id: 'save-data', strength: 'strong' }])).toBe(true);
    expect(Object.keys(event.detail)).toEqual(['reasons']);
    expect(event.detail.reasons).toEqual([{ id: 'save-data', strength: 'strong' }]);
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });
});
