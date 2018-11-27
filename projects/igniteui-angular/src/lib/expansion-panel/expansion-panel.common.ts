import { EventEmitter } from '@angular/core';
import { AnimationReferenceMetadata } from '@angular/animations';

export interface IgxExpansionPanelBase {
    id: string;
    cssClass: string;
    /** @hidden @internal */
    headerId: string;
    collapsed: boolean;
    animationSettings: { openAnimation: AnimationReferenceMetadata, closeAnimation: AnimationReferenceMetadata };
    onCollapsed: EventEmitter<any>;
    onExpanded: EventEmitter<any>;
    collapse(evt?: Event);
    expand(evt?: Event);
    toggle(evt?: Event);
}

/** @hidden */
export const IGX_EXPANSION_PANEL_COMPONENT = 'IgxExpansionPanelToken';

export interface IExpansionPanelEventArgs {
    event: Event;
    panel: IgxExpansionPanelBase;
}
