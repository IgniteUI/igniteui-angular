import { Component, HostBinding, Inject, forwardRef, ElementRef, Input } from '@angular/core';
import { IgxExpansionPanelComponent } from './expansion-panel.component';

@Component({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-body',
    template: `
            <ng-content></ng-content>`
})
export class IgxExpansionPanelBodyComponent {
    constructor(@Inject(forwardRef(() => IgxExpansionPanelComponent))
    public panel: IgxExpansionPanelComponent, public element: ElementRef) {
    }
    @HostBinding('class.igx-expansion-panel__body')
    public cssClass = `igx-expansion-panel__body`;
    public _title = '';

    @Input()
    @HostBinding('attr.aria-label')
    public label = this.panel.id + '-region';

    @Input()
    @HostBinding('attr.aria-labelledby')
    public get labelledBy(): string {
        return this.panel.title ? this.panel.title.id : this._title;
    }
    public set labelledBy(val: string) {
        this._title = val;
    }

    @Input()
    @HostBinding('attr.role')
    public role = 'region';
}
