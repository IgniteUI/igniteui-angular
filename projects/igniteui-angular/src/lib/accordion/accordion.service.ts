import { Injectable } from '@angular/core';
import { IgxExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { IgxAccordionComponent } from './accordion.component';

/** @hidden @internal */
@Injectable()
export class IgxAccordionService {
    public expandedPanels: Set<IgxExpansionPanelComponent> = new Set<IgxExpansionPanelComponent>();
    private accordion: IgxAccordionComponent;

    public register(accordion: IgxAccordionComponent) {
        this.accordion = accordion;
    }
}
