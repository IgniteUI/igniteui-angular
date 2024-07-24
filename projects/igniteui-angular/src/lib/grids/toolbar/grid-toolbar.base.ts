import { Directive, Input, EventEmitter, OnDestroy, Output, Inject, booleanAttribute } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { AbsoluteScrollStrategy } from '../../services/overlay/scroll/absolute-scroll-strategy';
import { ColumnDisplayOrder } from '../common/enums';
import { IColumnToggledEventArgs } from '../common/events';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxToggleDirective, ToggleViewCancelableEventArgs, ToggleViewEventArgs } from '../../directives/toggle/toggle.directive';
import { HorizontalAlignment, OverlaySettings, VerticalAlignment } from '../../services/overlay/utilities';
import { IgxToolbarToken } from './token';
import { ConnectedPositioningStrategy } from '../../services/overlay/position/connected-positioning-strategy';

/* blazorInclude */
/* blazorElement */
/* blazorIndirectRender */
/* blazorAlternateBaseType: GridToolbarBaseAction */
/**
 * Base class for the pinning/hiding column and exporter actions.
 *
 * @hidden @internal
 */
@Directive()
export abstract class BaseToolbarDirective implements OnDestroy {
    /**
     * Sets the height of the column list in the dropdown.
     */
    @Input()
    public columnListHeight: string;

    /**
     * Title text for the column action component
     */
    @Input()
    public title: string;

    /**
     * The placeholder text for the search input.
     */
    @Input()
    public prompt: string;

    /**
     * Sets overlay settings
     */
    @Input()
    public set overlaySettings(overlaySettings: OverlaySettings) {
        this._overlaySettings = overlaySettings;
    }

    /**
     * Returns overlay settings
     */
    public get overlaySettings(): OverlaySettings {
        return this._overlaySettings;
    }
    /**
     * Emits an event before the toggle container is opened.
     */
    @Output()
    public opening = new EventEmitter<ToggleViewCancelableEventArgs>();
    /**
     * Emits an event after the toggle container is opened.
     */

    @Output()
    public opened = new EventEmitter<ToggleViewEventArgs>();
    /**
     * Emits an event before the toggle container is closed.
     */

    @Output()
    public closing = new EventEmitter<ToggleViewEventArgs>();
    /**
     * Emits an event after the toggle container is closed.
     */

    @Output()
    public closed = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Emits when after a column's checked state is changed
     */
    @Output()
    public columnToggle = new EventEmitter<IColumnToggledEventArgs>();

    private $destroy = new Subject<void>();
    private $sub: Subscription;

    private _overlaySettings: OverlaySettings = {
        positionStrategy: new ConnectedPositioningStrategy({
            horizontalDirection: HorizontalAlignment.Left,
            horizontalStartPoint: HorizontalAlignment.Right,
            verticalDirection: VerticalAlignment.Bottom,
            verticalStartPoint: VerticalAlignment.Bottom
        }),
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnEscape: true,
        closeOnOutsideClick: true
    };

    /**
     * Returns the grid containing this component.
     * @hidden @internal
     */
    public get grid() {
        return this.toolbar.grid;
    }

    constructor(@Inject(IgxToolbarToken) protected toolbar: IgxToolbarToken) { }

    /** @hidden @internal **/
    public ngOnDestroy() {
        this.$destroy.next();
        this.$destroy.complete();
    }

    /** @hidden @internal */
    public toggle(anchorElement: HTMLElement, toggleRef: IgxToggleDirective, actions?: IgxColumnActionsComponent): void {
        if (actions) {
            this._setupListeners(toggleRef, actions);
            const setHeight = () =>
                actions.columnsAreaMaxHeight = actions.columnsAreaMaxHeight !== '100%'
                    ? actions.columnsAreaMaxHeight :
                    this.columnListHeight ??
                    `${Math.max(this.grid.calcHeight * 0.5, 200)}px`;
            toggleRef.opening.pipe(first()).subscribe(setHeight);
        }
        toggleRef.toggle({
            ...this.overlaySettings, ...{
                target: anchorElement, outlet: this.grid.outlet,
                excludeFromOutsideClick: [anchorElement]
            }
        });

    }

    /** @hidden @internal */
    public focusSearch(columnActions: HTMLElement) {
        columnActions.querySelector('input')?.focus();
    }

    private _setupListeners(toggleRef: IgxToggleDirective, actions?: IgxColumnActionsComponent) {
        if (actions) {
            if (!this.$sub || this.$sub.closed) {
                this.$sub = actions.columnToggled.pipe(takeUntil(this.$destroy)).subscribe((event) => this.columnToggle.emit(event));
            }
        }
        /** The if statement prevents emitting open and close events twice  */
        if (toggleRef.collapsed) {
            toggleRef.opening.pipe(first(), takeUntil(this.$destroy)).subscribe((event) => this.opening.emit(event));
            toggleRef.opened.pipe(first(), takeUntil(this.$destroy)).subscribe((event) => this.opened.emit(event));
        } else {
            toggleRef.closing.pipe(first(), takeUntil(this.$destroy)).subscribe((event) => this.closing.emit(event));
            toggleRef.closed.pipe(first(), takeUntil(this.$destroy)).subscribe((event) => this.closed.emit(event));
        }
    }
}

/* blazorElement */
/* blazorIndirectRender */
/**
 * @hidden @internal
 * Base class for pinning/hiding column actions
 */
@Directive()
export abstract class BaseToolbarColumnActionsDirective extends BaseToolbarDirective {
    @Input({ transform: booleanAttribute })
    public hideFilter = false;

    @Input()
    public filterCriteria = '';

    @Input()
    public columnDisplayOrder: ColumnDisplayOrder = ColumnDisplayOrder.DisplayOrder;

    @Input()
    public columnsAreaMaxHeight = '100%';

    @Input()
    public uncheckAllText: string;

    @Input()
    public checkAllText: string;

    @Input()
    public indentetion = 30;

    @Input()
    public buttonText: string;

    protected columnActionsUI: IgxColumnActionsComponent;

    public checkAll() {
        this.columnActionsUI.checkAllColumns();
    }

    public uncheckAll() {
        this.columnActionsUI.uncheckAllColumns();
    }
}
