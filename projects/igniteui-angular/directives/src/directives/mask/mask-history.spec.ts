import { beforeEach, describe, expect, it } from 'vitest';
import { MaskHistory, MaskHistoryState } from './mask-history';

/** Shorthand for a collapsed-caret state. */
const at = (value: string, caret: number): MaskHistoryState => ({ value, start: caret, end: caret });

describe('MaskHistory', () => {
    let history: MaskHistory;
    let signature: string;

    beforeEach(() => {
        signature = 'mask';
        history = new MaskHistory(() => signature);
    });

    describe('Recording', () => {
        it('should start out empty', () => {
            expect(history.canUndo).toBe(false);
            expect(history.canRedo).toBe(false);
            expect(history.undo(at('___', 0))).toBeNull();
            expect(history.redo(at('___', 0))).toBeNull();
        });

        it('should record a single step', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);

            expect(history.canUndo).toBe(true);
            expect(history.undo(at('a__', 1))).toEqual(at('___', 0));
        });

        it('should drop the oldest entry past the cap', () => {
            for (let i = 0; i < 120; i++) {
                history.record('atomic', at(String(i), 0));
                history.settle(String(i + 1), 0);
            }

            let steps = 0;
            let state = history.undo(at('120', 0));

            while (state) {
                steps++;
                state = history.undo(state);
            }

            expect(steps).toBe(100);
        });

        it('should carry the model of a state through undo and redo', () => {
            history.record('atomic', { ...at('___', 0), model: 1 });
            history.settle('a__', 1);

            const undone = history.undo({ ...at('a__', 1), model: 2 })!;
            expect(undone.model).toBe(1);
            expect(history.redo(undone)!.model).toBe(2);
        });
    });

    describe('Coalescing', () => {
        it('should merge a contiguous run of insertions', () => {
            history.record('insert', at('___', 0));
            history.settle('a__', 1);
            history.record('insert', at('a__', 1));
            history.settle('ab_', 2);
            history.record('insert', at('ab_', 2));
            history.settle('abc', 3);

            // One step back to the state before the whole run.
            expect(history.undo(at('abc', 3))).toEqual(at('___', 0));
            expect(history.canUndo).toBe(false);
        });

        it('should merge a contiguous run of backspaces', () => {
            history.record('delete-backward', at('abc', 3));
            history.settle('ab_', 2);
            history.record('delete-backward', at('ab_', 2));
            history.settle('a__', 1);

            expect(history.undo(at('a__', 1))).toEqual(at('abc', 3));
            expect(history.canUndo).toBe(false);
        });

        it('should keep a run going when an edit only moves the caret', () => {
            history.record('delete-backward', at('1/2', 3));
            history.settle('1/_', 2);
            // A backspace over the literal changes no text, so nothing is recorded.
            history.pass('delete-backward', at('1/_', 2));
            history.settle('1/_', 1);
            history.record('delete-backward', at('1/_', 1));
            history.settle('_/_', 0);

            expect(history.undo(at('_/_', 0))).toEqual(at('1/2', 3));
            expect(history.canUndo).toBe(false);
        });

        it('should end the run when an edit that changed nothing came after a caret move', () => {
            history.record('insert', at('___ ___', 0));
            history.settle('a__ ___', 1);

            // The caret moved to 4 and the character typed there was rejected.
            history.pass('insert', at('a__ ___', 4));
            history.settle('a__ ___', 4);

            history.record('insert', at('a__ ___', 4));
            history.settle('a__ b__', 5);

            expect(history.undo(at('a__ b__', 5))).toEqual(at('a__ ___', 4));
            expect(history.undo(at('a__ ___', 4))).toEqual(at('___ ___', 0));
        });

        it('should keep the run when an edit that changed nothing continues it', () => {
            history.record('insert', at('___', 0));
            history.settle('a__', 1);

            // A rejected character where the caret already is.
            history.pass('insert', at('a__', 1));
            history.settle('a__', 1);

            history.record('insert', at('a__', 1));
            history.settle('ab_', 2);

            expect(history.undo(at('ab_', 2))).toEqual(at('___', 0));
            expect(history.canUndo).toBe(false);
        });

        it('should start a new step after the run is ended, even with the caret back in place', () => {
            history.record('insert', at('___', 0));
            history.settle('ab_', 2);

            // The caret left and came back, for example with the Left and the Right arrow keys.
            history.endRun();

            history.record('insert', at('ab_', 2));
            history.settle('abc', 3);

            expect(history.undo(at('abc', 3))).toEqual(at('ab_', 2));
            expect(history.undo(at('ab_', 2))).toEqual(at('___', 0));
        });

        it('should break the run when the kind changes', () => {
            history.record('insert', at('___', 0));
            history.settle('a__', 1);
            history.record('delete-backward', at('a__', 1));
            history.settle('___', 0);

            expect(history.undo(at('___', 0))).toEqual(at('a__', 1));
            expect(history.undo(at('a__', 1))).toEqual(at('___', 0));
        });

        it('should break the run when the caret is not contiguous', () => {
            history.record('insert', at('___', 0));
            history.settle('a__', 1);

            // The caret moved, e.g. with an arrow key or a click.
            history.record('insert', at('a__', 2));
            history.settle('a_c', 3);

            expect(history.undo(at('a_c', 3))).toEqual(at('a__', 2));
            expect(history.undo(at('a__', 2))).toEqual(at('___', 0));
        });

        it('should never merge into a replaced selection', () => {
            history.record('insert', at('___', 0));
            history.settle('a__', 1);
            history.record('insert', { value: 'a__', start: 1, end: 3 });
            history.settle('ab_', 2);

            expect(history.undo(at('ab_', 2))).toEqual({ value: 'a__', start: 1, end: 3 });
            expect(history.undo(at('a__', 1))).toEqual(at('___', 0));
        });

        it('should never merge atomic edits', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);
            history.record('atomic', at('a__', 1));
            history.settle('ab_', 2);

            expect(history.undo(at('ab_', 2))).toEqual(at('a__', 1));
            expect(history.undo(at('a__', 1))).toEqual(at('___', 0));
        });

        it('should not merge across an atomic edit', () => {
            history.record('insert', at('___', 0));
            history.settle('a__', 1);
            history.record('atomic', at('a__', 1));
            history.settle('ab_', 2);
            history.record('insert', at('ab_', 2));
            history.settle('abc', 3);

            expect(history.undo(at('abc', 3))).toEqual(at('ab_', 2));
            expect(history.undo(at('ab_', 2))).toEqual(at('a__', 1));
            expect(history.undo(at('a__', 1))).toEqual(at('___', 0));
        });
    });

    describe('Traversal', () => {
        it('should round-trip undo and redo', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);

            const undone = history.undo(at('a__', 1))!;
            expect(undone).toEqual(at('___', 0));
            expect(history.canRedo).toBe(true);

            expect(history.redo(undone)).toEqual(at('a__', 1));
            expect(history.canUndo).toBe(true);
            expect(history.canRedo).toBe(false);
        });

        it('should hand the restored state to the opposite stack on a repeated step', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);
            history.record('atomic', at('a__', 1));
            history.settle('ab_', 2);

            const first = history.undo(at('ab_', 2))!;
            // The second undo reports a caret that the host has moved since.
            history.undo({ value: 'a__', start: 99, end: 99 });

            // The redo entry carries the caret that the first undo restored, not 99.
            expect(history.redo(at('___', 0))).toEqual(first);
        });

        it('should record after an undo and drop the redo stack', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);
            history.undo(at('a__', 1));

            expect(history.canRedo).toBe(true);

            history.record('atomic', at('___', 0));
            history.settle('z__', 1);

            expect(history.canRedo).toBe(false);
        });

        it('should not merge a new edit into the step it just restored', () => {
            history.record('insert', at('___', 0));
            history.settle('a__', 1);
            history.undo(at('a__', 1));

            history.record('insert', at('___', 0));
            history.settle('z__', 1);

            expect(history.undo(at('z__', 1))).toEqual(at('___', 0));
        });
    });

    describe('Invalidation', () => {
        it('should drop the earlier history when the text was changed from outside', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);

            // An outside value assignment, then a user edit.
            history.record('atomic', at('xyz', 0));
            history.settle('xyzq', 1);

            // Undo goes back only to the assigned value.
            expect(history.undo(at('xyzq', 1))).toEqual(at('xyz', 0));
            expect(history.canUndo).toBe(false);
        });

        it('should refuse to traverse when the text was changed from outside', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);

            expect(history.undo(at('xyz', 0))).toBeNull();
            expect(history.canUndo).toBe(false);
        });

        it('should refuse to redo over a text that was changed from outside', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);
            history.undo(at('a__', 1));

            // Only redo entries are left when the outside change comes.
            expect(history.canUndo).toBe(false);
            expect(history.redo(at('xyz', 0))).toBeNull();
            expect(history.canRedo).toBe(false);
        });

        it('should drop the history when an edit that changed nothing follows an outside change', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);

            // The text was changed from outside, and then a character was rejected.
            history.pass('insert', at('xyz', 0));
            history.settle('xyz', 0);

            // Settling must not make the old step look current.
            expect(history.canUndo).toBe(false);
            expect(history.undo(at('xyz', 0))).toBeNull();
        });

        it('should drop the redo steps when an edit that changed nothing follows an outside change', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);
            history.undo(at('a__', 1));

            history.pass('insert', at('xyz', 0));
            history.settle('xyz', 0);

            expect(history.canRedo).toBe(false);
            expect(history.redo(at('xyz', 0))).toBeNull();
        });

        it('should drop the history when the mask pattern changes', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);

            signature = 'other-mask';

            expect(history.undo(at('a__', 1))).toBeNull();
            expect(history.canUndo).toBe(false);
        });

        it('should drop the history on clear', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);
            history.record('atomic', at('a__', 1));
            history.settle('ab_', 2);
            history.undo(at('ab_', 2));

            history.clear();

            expect(history.canUndo).toBe(false);
            expect(history.canRedo).toBe(false);
        });

        it('should keep the history on resync with an unchanged text', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);

            history.resync('a__');

            expect(history.undo(at('a__', 1))).toEqual(at('___', 0));
        });

        it('should drop the history on resync with a changed text', () => {
            history.record('atomic', at('___', 0));
            history.settle('a__', 1);

            history.resync('zzz');

            expect(history.canUndo).toBe(false);
        });

        it('should break the current run on resync', () => {
            history.record('insert', at('___', 0));
            history.settle('a__', 1);

            history.resync('a__');

            history.record('insert', at('a__', 1));
            history.settle('ab_', 2);

            expect(history.undo(at('ab_', 2))).toEqual(at('a__', 1));
            expect(history.undo(at('a__', 1))).toEqual(at('___', 0));
        });
    });
});
