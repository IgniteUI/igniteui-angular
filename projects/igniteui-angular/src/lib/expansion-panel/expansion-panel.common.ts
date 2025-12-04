import { Directive, ElementRef, EventEmitter, InjectionToken } from '@angular/core';
import { AnimationReferenceMetadata } from '@angular/animations';
import { CancelableEventArgs, IBaseEventArgs } from '../core/utils';

export interface IgxExpansionPanelBase {
    id: string;
    cssClass: string;
    /** @hidden @internal */
    headerId: string;
    collapsed: boolean;
    animationSettings: { openAnimation: AnimationReferenceMetadata; closeAnimation: AnimationReferenceMetadata };
    contentCollapsed: EventEmitter<any>;
    contentCollapsing: EventEmitter<any>;
    contentExpanded: EventEmitter<any>;
    contentExpanding: EventEmitter<any>;
    collapse(evt?: Event);
    expand(evt?: Event);
    toggle(evt?: Event);
}

/** @hidden */
export const IGX_EXPANSION_PANEL_COMPONENT = /*@__PURE__*/new InjectionToken<IgxExpansionPanelBase>('IgxExpansionPanelToken');

export interface IExpansionPanelEventArgs extends IBaseEventArgs {
    event: Event;
}

export interface IExpansionPanelCancelableEventArgs  extends IExpansionPanelEventArgs, CancelableEventArgs {}

@Directive()
export abstract class HeaderContentBaseDirective {

    constructor(protected element: ElementRef) { }

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
    public getTooltipContent = (element: ElementRef): string => {
        if (element.nativeElement.title) {
            return element.nativeElement.title;
        }
        if (element.nativeElement.textContent) {
            return element.nativeElement.textContent.trim();
        }

        return null;
    };
}
