import { IgxActionStripComponent, IgxActionStripMenuItemDirective } from './action-strip.component';

export { IgxActionStripComponent, IgxActionStripMenuItemDirective } from './action-strip.component';

/* Action-strip outside of grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_ACTION_STRIP_DIRECTIVES = [
    IgxActionStripComponent,
    IgxActionStripMenuItemDirective
] as const;
