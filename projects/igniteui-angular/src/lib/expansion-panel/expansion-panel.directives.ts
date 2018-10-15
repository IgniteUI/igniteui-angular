import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-title'
})
export class IgxExpansionPanelTitleDirective {
    @HostBinding('class.igx-expansion-panel__header-title')
    public cssClass = `igx-expansion-panel__header-title`;
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-description'
})
export class IgxExpansionPanelDescriptionDirective {
    @HostBinding('class.igx-expansion-panel__header-description')
    public cssClass = `igx-expansion-panel__header-description`;
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-icon'
})
export class IgxExpansionPanelIconDirective {
}
