/**
 * Watches the layout around an open tooltip, for changes that happen without a scroll or a resize
 * of the window, such as a theme or a font change.
 *
 * `onChange` runs at most once per frame, when the size of the tooltip or of its target changes,
 * or when the target moves.
 *
 * @param tooltip the tooltip element.
 * @param target the element the tooltip is attached to.
 * @param onChange called after a change.
 * @returns a function that stops watching.
 */
export function observeTooltipLayout(tooltip: HTMLElement, target: HTMLElement, onChange: () => void): () => void {
    const view = tooltip.ownerDocument.defaultView;

    if (!view || typeof view.ResizeObserver === 'undefined' || typeof view.IntersectionObserver === 'undefined') {
        return () => {};
    }

    let frame = 0;
    const schedule = () => {
        if (!frame) {
            frame = view.requestAnimationFrame(() => {
                frame = 0;
                onChange();
            });
        }
    };

    const resizeObserver = new view.ResizeObserver(schedule);
    resizeObserver.observe(tooltip);
    resizeObserver.observe(target);

    const stopMoveObserver = observeMove(target, schedule);

    return () => {
        view.cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        stopMoveObserver();
    };
}

/**
 * Calls `onMove` when `element` moves. The root of the intersection observer is shrunk to the
 * rectangle of the element, so a move of the element changes its intersection ratio.
 * After each move, the element is observed again at its new place.
 */
function observeMove(element: HTMLElement, onMove: () => void): () => void {
    const document = element.ownerDocument;
    const view = document.defaultView!;
    const root = document.documentElement;
    let observer: IntersectionObserver | undefined;

    const observe = (threshold = 1) => {
        observer?.disconnect();

        const { left, top, width, height } = element.getBoundingClientRect();

        if (!width || !height) {
            return;
        }

        const rootMargin = [
            top,
            root.clientWidth - (left + width),
            root.clientHeight - (top + height),
            left
        ].map(inset => `${-Math.floor(inset)}px`).join(' ');

        let isFirstCall = true;
        const callback = ([entry]: IntersectionObserverEntry[]) => {
            const ratio = entry.intersectionRatio;

            if (isFirstCall) {
                isFirstCall = false;

                // The viewport clips the element. Observe it again with its visible ratio as the threshold.
                if (ratio > 0 && ratio !== threshold) {
                    observe(ratio);
                }
                return;
            }

            onMove();
            observe();
        };
        const options = { rootMargin, threshold: Math.min(1, threshold) || 1 };

        // With the document as the root, the root margin also applies inside an iframe.
        try {
            observer = new view.IntersectionObserver(callback, { ...options, root: document });
        } catch {
            observer = new view.IntersectionObserver(callback, options);
        }

        observer.observe(element);
    };

    observe();

    return () => observer?.disconnect();
}
