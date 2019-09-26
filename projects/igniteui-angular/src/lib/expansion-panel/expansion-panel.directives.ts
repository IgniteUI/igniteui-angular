import { Directive, HostBinding } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-title'
})
export class IgxExpansionPanelTitleDirective {
    @HostBinding('class.igx-expansion-panel__header-title')
    public cssClass = `igx-expansion-panel__header-title`;
}

/**
 * @hidden
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-description'
})
export class IgxExpansionPanelDescriptionDirective {
    @HostBinding('class.igx-expansion-panel__header-description')
    public cssClass = `igx-expansion-panel__header-description`;
}

/**
 * @hidden
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-expansion-panel-icon'
})
export class IgxExpansionPanelIconDirective {
}
