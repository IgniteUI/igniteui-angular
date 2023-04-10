import { Directive, ElementRef, HostBinding, OnInit } from '@angular/core';
import { getTooltipContent } from '../core/utils';

/**
 * @hidden @internal
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-expansion-panel-title'
})
export class IgxExpansionPanelTitleDirective implements OnInit {
    @HostBinding('class.igx-expansion-panel__header-title')
    public cssClass = `igx-expansion-panel__header-title`;

    @HostBinding('attr.title')
    public title: string;

    constructor(private element: ElementRef) {}

    public ngOnInit() {
        this.title = getTooltipContent(this.element);
    }
}

/**
 * @hidden @internal
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-expansion-panel-description'
})
export class IgxExpansionPanelDescriptionDirective implements OnInit {
    @HostBinding('class.igx-expansion-panel__header-description')
    public cssClass = `igx-expansion-panel__header-description`;

    @HostBinding('attr.title')
    public title: string;

    constructor(private element: ElementRef) {}

    public ngOnInit() {
        this.title = getTooltipContent(this.element);
    }
}

/**
 * @hidden @internal
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-expansion-panel-icon'
})
export class IgxExpansionPanelIconDirective { }
