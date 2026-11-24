/**
 * A snapshot of a masked editor as it was *before* an edit was applied.
 *
 * @hidden @internal
 */
export interface MaskHistoryState {
    /** The masked text. */
    value: string;
    /** The start of the text selection. */
    start: number;
    /** The end of the text selection. */
    end: number;
    /**
     * Optional data of the host that the text alone cannot restore, such as the date behind a date editor text.
     * The history only carries it along.
     */
    model?: unknown;
}

/**
 * The kind of an edit. A run of one granular kind coalesces into a single step.
 * Paste, drop, cut, composition, auto-fill and a date part spin are `atomic`: each one is its own step.
 *
 * @hidden @internal
 */
export type MaskEditKind = 'insert' | 'delete-backward' | 'delete-forward' | 'atomic';

const MAX_HISTORY_SIZE = 100;

/**
 * The undo and redo history of a masked editor. The mask writes the value of the input on each edit,
 * which clears the browser undo stack, so this history replaces it.
 * The caret position alone groups a run of edits. A text changed from outside or a changed mask signature
 * invalidates the history.
 *
 * @hidden @internal
 */
export class MaskHistory {
    private readonly _undoStack: MaskHistoryState[] = [];
    private readonly _redoStack: MaskHistoryState[] = [];

    private _lastKind: MaskEditKind | null = null;
    private _lastCaret = -1;
    private _lastValue = '';
    private _pattern = '';

    /** The state that the last traversal restored. The opposite stack takes it on the next step. */
    private _lastRestored: MaskHistoryState | null = null;

    /**
     * @param signature Resolves the identity of the mask pattern that the snapshots are taken against.
     */
    constructor(private readonly signature: () => string) { }

    public get canUndo(): boolean {
        return this._undoStack.length > 0;
    }

    public get canRedo(): boolean {
        return this._redoStack.length > 0;
    }

    /**
     * Records the state that an edit is about to overwrite.
     * Call it only when the edit is known to change the text.
     */
    public record(kind: MaskEditKind, state: MaskHistoryState): void {
        this.validate(state.value);
        this._redoStack.length = 0;
        this._lastRestored = null;

        if (!this.shouldCoalesce(kind, state)) {
            this._undoStack.push({ ...state });

            if (this._undoStack.length > MAX_HISTORY_SIZE) {
                this._undoStack.shift();
            }
        }

        this._lastKind = kind;
    }

    /**
     * Reports the state that an edit settled on, so that the next {@link record} can tell
     * whether it continues the run.
     */
    public settle(value: string, caret: number): void {
        this._lastValue = value;
        this._lastCaret = caret;
    }

    /**
     * Reconciles the history with the current text, for example on focus.
     * A changed text drops the history. The run always ends.
     */
    public resync(value: string): void {
        this.validate(value);

        this._lastValue = value;
        this._lastKind = null;
        this._lastCaret = -1;
        this._lastRestored = null;
    }

    /** Steps one edit back and hands `current` to the redo stack. */
    public undo(current: MaskHistoryState): MaskHistoryState | null {
        return this.step(this._undoStack, this._redoStack, current);
    }

    /** Steps one edit forward and hands `current` back to the undo stack. */
    public redo(current: MaskHistoryState): MaskHistoryState | null {
        return this.step(this._redoStack, this._undoStack, current);
    }

    /** Drops all the history. */
    public clear(): void {
        this._undoStack.length = 0;
        this._redoStack.length = 0;
        this._lastKind = null;
        this._lastCaret = -1;
        this._lastRestored = null;
    }

    /**
     * A run continues only while the caret stays where the last edit left it, so a click
     * or an arrow key breaks it with no extra hook. A replaced selection is always its own edit.
     */
    private shouldCoalesce(kind: MaskEditKind, state: MaskHistoryState): boolean {
        if (kind === 'atomic' || kind !== this._lastKind || !this.canUndo || state.start !== state.end) {
            return false;
        }

        return kind === 'insert' ? state.start === this._lastCaret : state.end === this._lastCaret;
    }

    /**
     * Drops all the history if the mask pattern changed, or if the text was changed from outside.
     * Returns whether the snapshots are still usable.
     */
    private validate(value: string): boolean {
        const pattern = this.signature();
        const stale = pattern !== this._pattern || ((this.canUndo || this.canRedo) && value !== this._lastValue);

        if (stale) {
            this._pattern = pattern;
            this.clear();
            this._lastValue = value;
        }

        return !stale;
    }

    private step(from: MaskHistoryState[], to: MaskHistoryState[], current: MaskHistoryState): MaskHistoryState | null {
        // A stale history would restore the text of a value that the editor no longer holds.
        if (!this.validate(current.value)) {
            return null;
        }

        const state = from.pop();

        if (!state) {
            return null;
        }

        to.push(this._lastRestored ?? { ...current });

        // Typing after an undo must not extend the step that was just restored.
        this._lastKind = null;
        this._lastValue = state.value;
        this._lastCaret = state.start;
        this._lastRestored = { ...state };

        return state;
    }
}
