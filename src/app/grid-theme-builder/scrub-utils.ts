import { WritableSignal } from '@angular/core';

/**
 * Attaches a pointer-drag "scrub" gesture that adjusts a numeric CSS-length
 * signal (e.g. "3px") by dragging vertically. Raw pointermove deltas are
 * accumulated and applied at most once per animation frame so a fast drag
 * doesn't force a signal write (and change-detection pass) per pixel of
 * pointer movement.
 */
export function startScrub(sig: WritableSignal<string>, fallback: string, event: PointerEvent, onChange?: () => void): void {
    const el = event.currentTarget as HTMLElement;
    el.setPointerCapture(event.pointerId);
    let lastY = event.clientY;
    let accumulatedDelta = 0;
    let frame: number | null = null;

    const applyPendingDelta = () => {
        frame = null;
        if (accumulatedDelta === 0) return;
        const delta = accumulatedDelta;
        accumulatedDelta = 0;

        const current = sig() || fallback;
        const match = current.match(/^([\d.]+)(\D*)$/);
        if (!match) return;
        const unit = match[2] || 'px';
        const step = unit === 'px' ? 1 : 0.1;
        const next = Math.max(0, Math.round((parseFloat(match[1]) + delta * step) * 10) / 10);
        sig.set(`${next}${unit}`);
        onChange?.();
    };

    const onMove = (e: PointerEvent) => {
        accumulatedDelta += lastY - e.clientY;
        lastY = e.clientY;
        frame ??= requestAnimationFrame(applyPendingDelta);
    };

    const onUp = () => {
        el.removeEventListener('pointermove', onMove as EventListener);
        el.removeEventListener('pointerup', onUp);
        if (frame !== null) {
            cancelAnimationFrame(frame);
            applyPendingDelta();
        }
    };

    el.addEventListener('pointermove', onMove as EventListener);
    el.addEventListener('pointerup', onUp);
}

export function scrubKeydown(sig: WritableSignal<string>, fallback: string, event: KeyboardEvent): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const current = sig() || fallback;
    const match = current.match(/^([\d.]+)(\D*)$/);
    if (!match) return;
    const unit = match[2] || 'px';
    const step = unit === 'px' ? 1 : 0.1;
    const delta = event.key === 'ArrowUp' ? step : -step;
    const next = Math.max(0, Math.round((parseFloat(match[1]) + delta) * 10) / 10);
    sig.set(`${next}${unit}`);
    (event.target as HTMLInputElement).value = sig();
}
