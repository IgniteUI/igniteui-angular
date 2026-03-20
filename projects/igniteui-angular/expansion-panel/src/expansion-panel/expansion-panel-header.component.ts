import { Component, ChangeDetectorRef, ElementRef, HostBinding, HostListener, Input, EventEmitter, Output, ContentChild, ViewChild, booleanAttribute, inject } from '@angular/core';
import { IgxExpansionPanelIconDirective } from './expansion-panel.directives';
import { IGX_EXPANSION_PANEL_COMPONENT, IgxExpansionPanelBase, IExpansionPanelCancelableEventArgs } from './expansion-panel.common';
import { IgxIconComponent } from 'igniteui-angular/icon';

/**
 * @hidden
 */
export const ExpansionPanelHeaderIconPosition = {
    LEFT: 'left',
    NONE: 'none',
    RIGHT: 'right'
} as const;
export type ExpansionPanelHeaderIconPosition = (typeof ExpansionPanelHeaderIconPosition)[keyof typeof ExpansionPanelHeaderIconPosition];


@Component({
    selector: 'igx-expansion-panel-header',
    templateUrl: 'expansion-panel-header.component.html',
    imports: [IgxIconComponent]
})
export class IgxExpansionPanelHeaderComponent {
    public panel = inject<IgxExpansionPanelBase>(IGX_EXPANSION_PANEL_COMPONENT, { host: true });
    public cdr = inject(ChangeDetectorRef);
    public elementRef = inject(ElementRef);

    /**
     * Returns a reference to the `igx-expansion-panel-icon` element;
     * If `iconPosition` is `NONE` - return null;
     */
    public get iconRef(): ElementRef {
        const renderedTemplate = this.customIconRef ?? this.defaultIconRef;
        return this.iconPosition !== ExpansionPanelHeaderIconPosition.NONE ? renderedTemplate : null;
    }

    /**
     * @hidden
     */
    @ContentChild(IgxExpansionPanelIconDirective)
    public set iconTemplate(val: boolean) {
        this._iconTemplate = val;
    }

    /**
     * @hidden
     */
    public get iconTemplate(): boolean {
        return this._iconTemplate;
    }

    /**
     * Gets/sets the `aria-level` attribute of the header
     * Get
     * Set
     */
    @HostBinding('attr.aria-level')
    @Input()
    public lv = '3';

    /**
     * Gets/sets the `role` attribute of the header
     * Get
     * Set
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'heading';

    /**
     * @hidden
     */
    public get controls(): string {
        return this.panel.id;
    }

    /**
     * @hidden @internal
     */
    public get innerElement() {
        return this.elementRef.nativeElement.children[0];
    }

    /**
     * Gets/sets the position of the expansion-panel-header expand/collapse icon
     * Accepts `left`, `right` or `none`
     * Set
     */
    @Input()
    public iconPosition: ExpansionPanelHeaderIconPosition = ExpansionPanelHeaderIconPosition.LEFT;

    /**
     * Emitted whenever a user interacts with the header host
     */
    @Output()
    public interaction = new EventEmitter<IExpansionPanelCancelableEventArgs>();

    /**
     * @hidden
     */
    @HostBinding('class.igx-expansion-panel__header')
    public cssClass = 'igx-expansion-panel__header';

    /**
     * @hidden
     */
    @HostBinding('class.igx-expansion-panel__header--expanded')
    public get isExpanded() {
        return !this.panel.collapsed;
    }

    /**
     * Gets/sets the whether the header is disabled
     * When disabled, the header will not handle user events and will stop their propagation
     *
     * Set
     */
    @Input({ transform: booleanAttribute })
    @HostBinding('class.igx-expansion-panel--disabled')
    public get disabled(): boolean {
        return this._disabled;
    }

    public set disabled(val: boolean) {
        this._disabled = val;
        if (val) {
            // V.S. June 11th, 2021: #9696 TabIndex should be removed when panel is disabled
            delete this.tabIndex;
        } else {
            this.tabIndex = 0;
        }
    }

    /** @hidden @internal */
    @ContentChild(IgxExpansionPanelIconDirective, { read: ElementRef })
    private customIconRef: ElementRef;

    /** @hidden @internal */
    @ViewChild(IgxIconComponent, { read: ElementRef })
    private defaultIconRef: ElementRef;

    /**
     * Sets/gets the `id` of the expansion panel header.
     *
     * @memberof IgxExpansionPanelComponent
     */
    public id = '';

    /** @hidden @internal */
    public tabIndex = 0;

    // properties section
    private _iconTemplate = false;
    private _disabled = false;

    constructor() {
        this.id = `${this.panel.id}-header`;
    }

    /**
     * @hidden
     */
    @HostListener('keydown.Enter', ['$event'])
    @HostListener('keydown.Space', ['$event'])
    @HostListener('keydown.Spacebar', ['$event'])
    @HostListener('click', ['$event'])
    public onAction(evt?: Event) {
        if (this.disabled) {
            evt.stopPropagation();
            return;
        }
        const eventArgs: IExpansionPanelCancelableEventArgs = { event: evt, owner: this.panel, cancel: false };
        this.interaction.emit(eventArgs);
        if (eventArgs.cancel === true) {
            return;
        }
        this.panel.toggle(evt);
        evt.preventDefault();
    }

    /** @hidden @internal */
    @HostListener('keydown.alt.arrowdown', ['$event'])
    public openPanel(event: KeyboardEvent) {
        if (event.altKey) {
            const eventArgs: IExpansionPanelCancelableEventArgs = { event, owner: this.panel, cancel: false };
            this.interaction.emit(eventArgs);
            if (eventArgs.cancel === true) {
                return;
            }
            this.panel.expand(event);
        }
    }

    /** @hidden @internal */
    @HostListener('keydown.alt.arrowup', ['$event'])
    public closePanel(event: KeyboardEvent) {
        if (event.altKey) {
            const eventArgs: IExpansionPanelCancelableEventArgs = { event, owner: this.panel, cancel: false };
            this.interaction.emit(eventArgs);
            if (eventArgs.cancel === true) {
                return;
            }
            this.panel.collapse(event);
        }
    }

    /**
     * @hidden
     */
    public get iconPositionClass(): string {
        switch (this.iconPosition) {
            case (ExpansionPanelHeaderIconPosition.LEFT):
                return `igx-expansion-panel__header-icon--start`;
            case (ExpansionPanelHeaderIconPosition.RIGHT):
                return `igx-expansion-panel__header-icon--end`;
            case (ExpansionPanelHeaderIconPosition.NONE):
                return `igx-expansion-panel__header-icon--none`;
            default:
                return '';
        }
    }
}
