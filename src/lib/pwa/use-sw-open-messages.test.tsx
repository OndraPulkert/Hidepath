import { act, screen } from '@testing-library/react';

import { renderApp } from '@/test/render';

describe('zpráva hidepath-open ze service workeru', () => {
  let container: EventTarget;
  beforeEach(() => {
    container = new EventTarget();
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: container });
  });
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  const send = (data: unknown) =>
    act(() => {
      container.dispatchEvent(new MessageEvent('message', { data }));
    });

  it('otevře krok, na který vede kliknutí na notifikaci (okno bez řízení SW)', async () => {
    const { router } = renderApp('/dashboard');
    await screen.findByRole('main');
    send({
      type: 'hidepath-open',
      url: '/projects/card-holder/lessons/04-saddle-stitch/focus?krok=2',
    });
    expect(router.state.location.pathname).toBe(
      '/projects/card-holder/lessons/04-saddle-stitch/focus',
    );
    expect(router.state.location.search).toBe('?krok=2');
  });

  it('adresu mimo aplikaci ani jiné zprávy nepřevezme', async () => {
    const { router } = renderApp('/dashboard');
    await screen.findByRole('main');
    send({ type: 'hidepath-open', url: '//evil.example/x' });
    send({ type: 'jina', url: '/shopping' });
    expect(router.state.location.pathname).toBe('/dashboard');
  });
});
