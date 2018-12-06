import { Component, HostBinding, ElementRef, Input, ChangeDetectorRef, OnInit, Inject } from '@angular/core';
import { IgxExpansionPanelBase, IGX_EXPANSION_PANEL_COMPONENT } from './expansion-panel.common';

@Component({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-body',
    template: `<ng-content></ng-content>`
})
export class IgxExpansionPanelBodyComponent implements OnInit {
    private _labelledBy = '';
    private _label = '';
    constructor(
        @Inject(IGX_EXPANSION_PANEL_COMPONENT) public panel: IgxExpansionPanelBase,
        public element: ElementRef, public cdr: ChangeDetectorRef) {
    }
    /**
     * @hidden
     */
    @HostBinding('class.igx-expansion-panel__body')
    public cssClass = `igx-expansion-panel__body`;

    /**
     * Gets the `aria-label` attribute of the panel body
     * Defaults to the panel id with '-region' in the end;
     * Get
     * ```typescript
     *  const currentLabel = this.panel.body.label;
     * ```
     */
    @Input()
    @HostBinding('attr.aria-label')
    public get label(): string {
        return this._label || this.panel.id + '-region';
    }
    /**
     * Sets the `aria-label` attribute of the panel body
     * ```typescript
     *  this.panel.body.label = 'my-custom-label';
     * ```
     * ```html
     *  <igx-expansion-panel-body [label]="'my-custom-label'"></igx-expansion-panel-body>
     * ```
     */
    public set label(val: string) {
        this._label = val;
    }

    /**
     * Gets the `aria-labelledby` attribute of the panel body
     * Defaults to the panel header id;
     * Get
     * ```typescript
     *  const currentLabel = this.panel.body.labelledBy;
     * ```
     */
    @Input()
    @HostBinding('attr.aria-labelledby')
    public get labelledBy(): string {
        return this._labelledBy;
    }
    /**
     * Sets the `aria-labelledby` attribute of the panel body
     * ```typescript
     *  this.panel.body.labelledBy = 'my-custom-id';
     * ```
     * ```html
     *  <igx-expansion-panel-body [labelledBy]="'my-custom-id'"></igx-expansion-panel-body>
     * ```
     */
    public set labelledBy(val: string) {
        this._labelledBy = val;
    }

    /**
     * Gets/sets the `role` attribute of the panel body
     * Default is 'region';
     * Get
     * ```typescript
     *  const currentRole = this.panel.body.role;
     * ```
     * Set
     * ```typescript
     *  this.panel.body.role = 'content';
     * ```
     * ```html
     *  <igx-expansion-panel-body [role]="'custom'"></igx-expansion-panel-body>
     * ```
     */
    @Input()
    @HostBinding('attr.role')
    public role = 'region';

    ngOnInit() {
        this.labelledBy = this.panel.headerId;
        this.label = this.panel.id + '-region';
    }
}
