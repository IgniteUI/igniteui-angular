import {
    Component,
    ChangeDetectorRef,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    Host,
    EventEmitter,
    Output,
    ContentChild,
    Inject
} from '@angular/core';
import { IgxExpansionPanelIconDirective } from './expansion-panel.directives';
import { IExpansionPanelEventArgs, IGX_EXPANSION_PANEL_COMPONENT, IgxExpansionPanelBase } from './expansion-panel.common';

/**
 * @hidden
 */
export enum ICON_POSITION {
    LEFT = 'left',
    NONE = 'none',
    RIGHT = 'right'
}


@Component({
    selector: 'igx-expansion-panel-header',
    templateUrl: 'expansion-panel-header.component.html'
})
export class IgxExpansionPanelHeaderComponent {
     // properties section
    private _iconTemplate = false;
    /**
     * Sets/gets the `id` of the expansion panel header.
     * ```typescript
     * let panelHeaderId =  this.panel.header.id;
     * ```
     * @memberof IgxExpansionPanelComponent
     */
    public id = '';

    /**
     * @hidden
     */
    @ContentChild(IgxExpansionPanelIconDirective)
    public set iconTemplate(val: any) {
        this._iconTemplate = <boolean>val;
    }

    /**
     * @hidden
     */
    public get iconTemplate(): any {
        return this._iconTemplate;
    }

    /**
     * Gets/sets the `aria-level` attribute of the header
     * Get
     * ```typescript
     *  const currentAriaLevel = this.panel.header.lv;
     * ```
     * Set
     * ```typescript
     *  this.panel.header.lv = '5';
     * ```
     * ```html
     *  <igx-expansion-panel-header [lv]="myCustomLevel"></igx-expansion-panel-header>
     * ```
     */
    @HostBinding('attr.aria-level')
    @Input()
    public lv = '3';

    /**
     * Gets/sets the `role` attribute of the header
     * Get
     * ```typescript
     *  const currentRole = this.panel.header.role;
     * ```
     * Set
     * ```typescript
     *  this.panel.header.role = '5';
     * ```
     * ```html
     *  <igx-expansion-panel-header [role]="'custom'"></igx-expansion-panel-header>
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'heading';

    /**
     * @hidden
     */
    public get controls (): string {
        return this.panel.id;
    }

    /**
     * Gets/sets the position of the expansion-panel-header expand/collapse icon
     * Accepts `left`, `right` or `none`
     * ```typescript
     *  const currentIconPosition = this.panel.header.iconPosition;
     * ```
     * Set
     * ```typescript
     *  this.panel.header.iconPosition = 'left';
     * ```
     * ```html
     *  <igx-expansion-panel-header [iconPosition]="'right'"></igx-expansion-panel-header>
     * ```
     */
    @Input()
    public iconPosition: ICON_POSITION = ICON_POSITION.LEFT;

    /**
     * Emitted whenever a user interacts with the header host
     * ```typescript
     *  handleInteraction(event: IExpansionPanelEventArgs) {
     *  ...
     * }
     * ```
     * ```html
     *  <igx-expansion-panel-header (onInteraction)="handleInteraction($event)">
     *      ...
     *  </igx-expansion-panel-header>
     * ```
     */
    @Output()
    public onInteraction = new EventEmitter<IExpansionPanelEventArgs>();

    /**
     * @hidden
     */
     @HostBinding('class.igx-expansion-panel__header')
     public cssClass = 'igx-expansion-panel__header';

     /**
     * @hidden
     */
     @HostBinding('class.igx-expansion-panel__header--expanded')
     public get isExpanded () {
            return !this.panel.collapsed;
         }

    /**
     * Gets/sets the whether the header is disabled
     * When disabled, the header will not handle user events and will stop their propagation
     *
     * ```typescript
     *  const isDisabled = this.panel.header.disabled;
     * ```
     * Set
     * ```typescript
     *  this.panel.header.disabled = true;
     * ```
     * ```html
     *  <igx-expansion-panel-header [disabled]="true">
     *     ...
     *  </igx-expansion-panel-header>
     * ```
     */
    @Input()
    @HostBinding('class.igx-expansion-panel--disabled')
    public disabled = false;

    constructor(@Host() @Inject(IGX_EXPANSION_PANEL_COMPONENT) public panel: IgxExpansionPanelBase, public cdr: ChangeDetectorRef,
     public elementRef: ElementRef) {
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
         this.onInteraction.emit({ event: evt, panel: this.panel });
         this.panel.toggle(evt);
         evt.preventDefault();
     }

     /**
     * @hidden
     */
     public get iconPositionClass(): string {
        switch (this.iconPosition) {
            case (ICON_POSITION.LEFT):
                return `igx-expansion-panel__header-icon--start`;
            case (ICON_POSITION.RIGHT):
                return `igx-expansion-panel__header-icon--end`;
            case (ICON_POSITION.NONE):
                return `igx-expansion-panel__header-icon--none`;
            default:
                return '';
        }
     }
}
