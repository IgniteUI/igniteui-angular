import { Directive, HostBinding } from '@angular/core';

/**
 * @hidden @internal
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-expansion-panel-title'
})
export class IgxExpansionPanelTitleDirective {
    @HostBinding('class.igx-expansion-panel__header-title')
    public cssClass = `igx-expansion-panel__header-title`;
}

/**
 * @hidden @internal
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-expansion-panel-description'
})
export class IgxExpansionPanelDescriptionDirective {
    @HostBinding('class.igx-expansion-panel__header-description')
    public cssClass = `igx-expansion-panel__header-description`;
}

/**
 * @hidden @internal
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-expansion-panel-icon'
})
export class IgxExpansionPanelIconDirective { }
