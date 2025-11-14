import { Directive, HostBinding } from '@angular/core';
import { HeaderContentBaseDirective } from './expansion-panel.common';

/** @hidden @internal */
@Directive({
    selector: 'igx-expansion-panel-title',
    standalone: true
})
export class IgxExpansionPanelTitleDirective extends HeaderContentBaseDirective {
    @HostBinding('class.igx-expansion-panel__header-title')
    public cssClass = `igx-expansion-panel__header-title`;

    @HostBinding('attr.title')
    private get title(): string {
        return this.getTooltipContent(this.element);
    }
}

/** @hidden @internal */
@Directive({
    selector: 'igx-expansion-panel-description',
    standalone: true
})
export class IgxExpansionPanelDescriptionDirective extends HeaderContentBaseDirective {
    @HostBinding('class.igx-expansion-panel__header-description')
    public cssClass = `igx-expansion-panel__header-description`;

    @HostBinding('attr.title')
    private get title(): string {
        return this.getTooltipContent(this.element);
    }
}

/** @hidden @internal */
@Directive({
    selector: 'igx-expansion-panel-icon',
    standalone: true
})
export class IgxExpansionPanelIconDirective { }
