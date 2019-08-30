import { EventEmitter } from '@angular/core';
import { AnimationReferenceMetadata } from '@angular/animations';
import { IBaseEventArgs } from '../core/utils';

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

export interface IExpansionPanelEventArgs extends IBaseEventArgs {
    event: Event;
    panel: IgxExpansionPanelBase;
}
