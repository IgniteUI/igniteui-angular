import { IgxAccordionComponent } from './accordion.component';

export * from './accordion.component';

/* Imports that cannot be resolved from IGX_EXPANSION_PANEL_DIRECTIVES spread
    NOTE: Do not remove! Issue: https://github.com/IgniteUI/igniteui-angular/issues/13310
*/
 import {
    IgxExpansionPanelComponent,
    IgxExpansionPanelHeaderComponent,
    IgxExpansionPanelBodyComponent,
    IgxExpansionPanelDescriptionDirective,
    IgxExpansionPanelTitleDirective,
    IgxExpansionPanelIconDirective
} from '../expansion-panel/public_api';

/* Accordion directives collection for ease-of-use import in standalone components scenario */
export const IGX_ACCORDION_DIRECTIVES = [
    IgxAccordionComponent,
    IgxExpansionPanelComponent,
    IgxExpansionPanelHeaderComponent,
    IgxExpansionPanelBodyComponent,
    IgxExpansionPanelDescriptionDirective,
    IgxExpansionPanelTitleDirective,
    IgxExpansionPanelIconDirective
] as const;
