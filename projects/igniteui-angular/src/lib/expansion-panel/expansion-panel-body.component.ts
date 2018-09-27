import { Component, HostBinding, Inject,
    forwardRef, ElementRef, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { IgxExpansionPanelComponent } from './expansion-panel.component';

@Component({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-body',
    template: `<ng-content></ng-content>`
})
export class IgxExpansionPanelBodyComponent implements OnInit {
    private _labelledBy = '';
    private _label = '';
    constructor(@Inject(forwardRef(() => IgxExpansionPanelComponent))
    public panel: IgxExpansionPanelComponent, public element: ElementRef,
    public cdr: ChangeDetectorRef) {
    }
    @HostBinding('class.igx-expansion-panel__body')
    public cssClass = `igx-expansion-panel__body`;
    public _title = '';

    @Input()
    @HostBinding('attr.aria-label')
    public get label(): string {
        return this._label || this.panel.id + '-region';
    }
    public set label(val: string) {
        this._label = val;
    }

    @Input()
    @HostBinding('attr.aria-labelledby')
    public get labelledBy(): string {
        return this._labelledBy;
    }
    public set labelledBy(val: string) {
        this._labelledBy = val;
    }

    @Input()
    @HostBinding('attr.role')
    public role = 'region';

    ngOnInit() {
        this.labelledBy = this.panel.headerId;
        this.label = this.panel.id + '-region';
    }
}
