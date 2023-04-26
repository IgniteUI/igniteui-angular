import { Directive, ElementRef, HostBinding } from '@angular/core';

/**
 * Returns the `textContent` of an element
 *
 * ```html
 * <igx-expansion-panel-title>
 *  Tooltip content
 * </igx-expansion-panel-title>
 * ```
 *
 *  or the `title` content
 *
 * ```html
 * <igx-expansion-panel-title [title]="'Tooltip content'">
 * </igx-expansion-panel-title>
 * ```
 *
 * If both are provided, returns the `title` content.
 *
 * @param element
 * @returns tooltip content for an element
 */
const getTooltipContent = (element: ElementRef): string => {
    if (element.nativeElement.title) {
        return element.nativeElement.title;
    }
    if (element.nativeElement.textContent) {
        return element.nativeElement.textContent.trim();
    }

    return null;
};

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

    @HostBinding('attr.title')
    private get title(): string {
        return getTooltipContent(this.element);
    }

    constructor(private element: ElementRef) { }
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

    @HostBinding('attr.title')
    private get title(): string {
        return getTooltipContent(this.element);
    }

    constructor(private element: ElementRef) { }
}

/**
 * @hidden @internal
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-expansion-panel-icon'
})
export class IgxExpansionPanelIconDirective { }
