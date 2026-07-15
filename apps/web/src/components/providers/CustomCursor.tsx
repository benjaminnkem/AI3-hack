'use client';

import { useEffect, useRef } from 'react';

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-cursor], input[type="checkbox"], input[type="radio"]';
const NATIVE_CURSOR_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const label = labelRef.current;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!cursor || !label || !finePointer || reducedMotion) return;

    const root = document.documentElement;
    root.classList.add('mesh-custom-cursor');

    let frame = 0;
    let visible = false;
    let x = -100;
    let y = -100;
    let currentX = x;
    let currentY = y;

    const render = () => {
      currentX += (x - currentX) * 0.22;
      currentY += (y - currentY) * 0.22;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = window.requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        visible = true;
        cursor.dataset.visible = 'true';
      }
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const native = target?.closest(NATIVE_CURSOR_SELECTOR);
      const interactive = target?.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
      cursor.dataset.native = native ? 'true' : 'false';
      cursor.dataset.active = interactive && !native ? 'true' : 'false';
      label.textContent = interactive?.dataset.cursor ?? '';
    };

    const onLeave = () => {
      visible = false;
      cursor.dataset.visible = 'false';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    frame = window.requestAnimationFrame(render);

    return () => {
      root.classList.remove('mesh-custom-cursor');
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={cursorRef} className="mesh-cursor" aria-hidden>
      <span className="mesh-cursor__cross mesh-cursor__cross--x" />
      <span className="mesh-cursor__cross mesh-cursor__cross--y" />
      <span className="mesh-cursor__dot" />
      <span ref={labelRef} className="mesh-cursor__label" />
    </div>
  );
}
