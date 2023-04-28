import { IGX_EXPANSION_PANEL_DIRECTIVES } from '../expansion-panel/public_api';
import { IgxAccordionComponent } from './accordion.component';

export * from './accordion.component';

/* Accordion directives collection for ease-of-use import in standalone components scenario */
export const IGX_ACCORDION_DIRECTIVES = [
    IgxAccordionComponent,
    ...IGX_EXPANSION_PANEL_DIRECTIVES
] as const;
