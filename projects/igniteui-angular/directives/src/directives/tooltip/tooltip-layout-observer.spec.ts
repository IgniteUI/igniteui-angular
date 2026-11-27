import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { observeTooltipLayout } from './tooltip-layout-observer';

/** Long enough for the observers to report and for the animation frame that follows. */
const waitForLayout = () => new Promise(resolve => setTimeout(resolve, 100));

describe('observeTooltipLayout', () => {
    let tooltip: HTMLElement;
    let target: HTMLElement;
    let changes: number;
    let stop: () => void;

    beforeEach(async () => {
        tooltip = document.createElement('div');
        tooltip.style.cssText = 'position: fixed; left: 0; top: 0; box-sizing: content-box; width: 100px; height: 20px';
        target = document.createElement('div');
        target.style.cssText = 'position: fixed; left: 200px; top: 200px; width: 200px; height: 40px';
        document.body.append(tooltip, target);

        changes = 0;
        stop = observeTooltipLayout(tooltip, target, () => changes++);

        // The observers report once when they start.
        await waitForLayout();
        changes = 0;
    });

    afterEach(() => {
        stop();
        tooltip.remove();
        target.remove();
    });

    it('should report nothing while the layout stays the same', async () => {
        await waitForLayout();
        expect(changes).toBe(0);
    });

    it('should report a size change of the tooltip content', async () => {
        tooltip.style.width = '150px';
        await waitForLayout();
        expect(changes).toBeGreaterThan(0);
    });

    it('should report a padding change of the tooltip, which leaves its content box the same', async () => {
        tooltip.style.padding = '10px';
        await waitForLayout();
        expect(changes).toBeGreaterThan(0);
    });

    it('should report a border change of the target, which leaves its content box the same', async () => {
        target.style.border = '5px solid';
        await waitForLayout();
        expect(changes).toBeGreaterThan(0);
    });

    it('should report a move of the target', async () => {
        target.style.left = '500px';
        await waitForLayout();
        expect(changes).toBeGreaterThan(0);
    });

    it('should report a move of the target inside the rectangle that it had before it shrank', async () => {
        target.style.width = '50px';
        await waitForLayout();
        changes = 0;

        // From 200-250 to 300-350, inside the 200-400 that the target took at first.
        target.style.left = '300px';
        await waitForLayout();
        expect(changes).toBeGreaterThan(0);
    });

    it('should report the place where a move over several frames ends', async () => {
        let lastSeen = 0;
        stop();
        stop = observeTooltipLayout(tooltip, target, () => lastSeen = target.getBoundingClientRect().top);
        await waitForLayout();

        // As in a transition, the target is at a new place in each frame, also while it is observed again.
        await new Promise<void>(resolve => {
            let frame = 0;
            const move = () => {
                target.style.top = `${200 + ++frame * 20}px`;
                if (frame < 12) {
                    requestAnimationFrame(move);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(move);
        });
        await waitForLayout();

        expect(lastSeen).toBe(440);
    });

    it('should report nothing after it is stopped', async () => {
        stop();
        target.style.left = '500px';
        tooltip.style.width = '150px';
        await waitForLayout();
        expect(changes).toBe(0);
    });
});
