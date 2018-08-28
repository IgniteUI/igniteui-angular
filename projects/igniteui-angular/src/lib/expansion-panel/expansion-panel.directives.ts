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
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-description'
})
export class IgxExpansionPanelDescriptionDirective {
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-body'
})
export class IgxExpansionPanelBodyDirective {
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-button'
})
export class IgxExpansionPanelButtonDirective {
}
