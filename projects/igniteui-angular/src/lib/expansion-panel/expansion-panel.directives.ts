import { Directive, HostBinding, Input } from '@angular/core';

let NEXT_ID = 0;

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-header'
})
export class IgxExpansionPanelHeaderDirective {
}
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-title'
})
export class IgxExpansionPanelTitleDirective {
    @Input()
    @HostBinding('attr.id')
    public id = `igx-expansion-panel-header-title-${NEXT_ID++}`;

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
    selector: 'igx-expansion-panel-body'
})
export class IgxExpansionPanelBodyDirective {
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-icon'
})
export class IgxExpansionPanelIconDirective {
}
