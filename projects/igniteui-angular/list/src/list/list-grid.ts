import { ElementRef, Injectable, inject } from '@angular/core';
import {
    IgxKeyBindingsService,
    IgxSingleTabStopService,
    arrowDown,
    arrowLeft,
    arrowRight,
    arrowUp,
    escapeKey,
    f2Key,
    getTabbableElements,
    isFromArrowKeyControl,
    isLeftToRight
} from 'igniteui-angular/core';
import { eventNode } from './list.common';

const ARROW_KEYS = new Set<string>([arrowUp, arrowDown, arrowLeft, arrowRight]);

/** The keys that go back from a control to its row. */
const RETURN_KEYS: readonly string[] = [escapeKey, f2Key];

/**
 * @hidden
 * Whether a key goes back from a control to its row: Escape or F2.
 *
 * @param event - The key event.
 * @returns `true` for Escape and F2.
 *
 * @example
 * ```typescript
 * if (target === row) {
 *     return returnsToRow(event);
 * }
 * ```
 */
export function returnsToRow(event: KeyboardEvent): boolean {
    return RETURN_KEYS.includes(event.key);
}

/**
 * The configuration of an {@link IgxListGrid}.
 *
 * @hidden @internal
 */
export interface IgxListGridOptions {
    /** Whether the list runs the grid mode. */
    active: () => boolean;
    /** The own row that is `node` or holds it. The host of an empty list is the row of its message. */
    rowOf: (node: Node) => HTMLElement | undefined;
    /** Whether `element` is one control, such as a nested list with navigation, that the search does not enter. */
    isWidget: (element: Element) => boolean;
    /** Focuses a row or a control. A widget focuses its own tab stop. */
    focus: (control: HTMLElement) => void;
    /** The row that Tab and Shift+Tab enter the list on. */
    tabStop: () => HTMLElement;
}

/**
 * The grid mode of a list, the counterpart of `ListGrid` in `igc-list`: Right/Left move through
 * the controls of a row, Escape/F2 go back to it, and Tab leaves the list.
 *
 * @remarks
 * Unlike `igc-list`, it keeps the `tabindex` of the controls and handles Tab with
 * {@link IgxSingleTabStopService}. Provide it on the list and configure it after the roving focus.
 *
 * @hidden @internal
 */
@Injectable()
export class IgxListGrid {
    private readonly _host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly _keyBindings = inject(IgxKeyBindingsService, { self: true });
    private readonly _singleTabStop = inject(IgxSingleTabStopService, { self: true });

    private _options?: IgxListGridOptions;

    /**
     * Whether Tab is moving the focus on its way out of the list, so the list can ignore that focus.
     *
     * @returns `true` during the focus move.
     *
     * @example
     * ```typescript
     * if (this._grid.leaving) {
     *     return;
     * }
     * ```
     */
    public get leaving(): boolean {
        return this._singleTabStop.leaving;
    }

    /**
     * Binds the grid keys and the Tab handling. Call it once.
     *
     * @param options - The rows, the widgets and the focus of the list.
     * @returns The grid, for chaining.
     *
     * @example
     * ```typescript
     * inject(IgxListGrid).configure({
     *     active: () => this.isGrid,
     *     rowOf: (node) => this.rowOf(node),
     *     isWidget: (element) => this.isWidget(element),
     *     focus: (control) => control.focus(),
     *     tabStop: () => this.tabStop
     * });
     * ```
     */
    public configure(options: IgxListGridOptions): this {
        if (this._options) {
            return this;
        }
        this._options = options;

        const grid = { when: options.active };
        // Right and Left on a row without controls keep their default, so a list around it can take them.
        const arrows = { ...grid, preventDefault: false };

        this._keyBindings
            .set(arrowLeft, (event) => this.moveInRow(event, -1), arrows)
            .set(arrowRight, (event) => this.moveInRow(event, 1), arrows);
        for (const key of RETURN_KEYS) {
            this._keyBindings.set(key, (event) => this.returnToRow(event), grid);
        }

        this._singleTabStop.configure({ when: options.active, tabStop: options.tabStop });
        return this;
    }

    /**
     * Whether a key on a control of `row` stays with the control: every key
     * but Escape, F2 and the arrows, and the arrows too when the control uses them.
     *
     * @param event - The key event, during its dispatch.
     * @param row - The row of the control.
     * @returns `true` when the list leaves the key alone.
     *
     * @example
     * ```typescript
     * skip: (_, event) => target !== row && this._grid.leavesToControl(event, row)
     * ```
     */
    public leavesToControl(event: KeyboardEvent, row: HTMLElement): boolean {
        if (returnsToRow(event)) {
            return false;
        }
        return !ARROW_KEYS.has(event.key) || isFromArrowKeyControl(event, row, this._options!.isWidget);
    }

    /**
     * Whether `element` is inside a widget of `row`, which keeps the focus in its own rows.
     *
     * @param element - The focused element.
     * @param row - Its row.
     * @returns `true` inside a nested list with navigation.
     *
     * @example
     * ```typescript
     * const control = target !== row && !this._grid.inWidget(target, row) ? target : null;
     * ```
     */
    public inWidget(element: Element, row: HTMLElement): boolean {
        return this.outermostWidget(element.parentElement, row) !== null;
    }

    /** The outermost widget between `element`, included, and `row`. */
    private outermostWidget(element: HTMLElement | null, row: HTMLElement): HTMLElement | null {
        let widget: HTMLElement | null = null;
        for (let node = element; node && node !== row; node = node.parentElement) {
            if (this._options!.isWidget(node)) {
                widget = node;
            }
        }
        return widget;
    }

    /** The controls of a row, in order. A widget counts as one. */
    private controlsOf(row: HTMLElement): HTMLElement[] {
        const controls = new Set<HTMLElement>();
        for (const element of getTabbableElements(row)) {
            controls.add(this.outermostWidget(element, row) ?? element);
        }
        return [...controls];
    }

    private rowOfEvent(event: KeyboardEvent): { target: Node; row: HTMLElement } | undefined {
        const target = eventNode(event);
        const row = target && this._options!.rowOf(target);
        return target && row ? { target, row } : undefined;
    }

    /** Moves between a row and its controls, around the ends. */
    private moveInRow(event: KeyboardEvent, delta: -1 | 1) {
        const found = this.rowOfEvent(event);
        const controls = found ? this.controlsOf(found.row) : [];
        if (!found || !controls.length) {
            return;
        }
        event.preventDefault();
        // 0 is the row, also for a focused element outside the controls.
        const stops = [found.row, ...controls];
        const index = controls.findIndex(control => control.contains(found.target)) + 1;
        const step = isLeftToRight(this._host) ? delta : -delta;
        this._options!.focus(stops[(index + step + stops.length) % stops.length]);
    }

    private returnToRow(event: KeyboardEvent) {
        this.rowOfEvent(event)?.row.focus();
    }
}
