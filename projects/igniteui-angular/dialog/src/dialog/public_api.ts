import { IgxDialogComponent } from './dialog.component';
import { IgxDialogActionsDirective, IgxDialogTitleDirective } from './dialog.directives';

export * from './dialog.component';
export * from './dialog.directives';

/* NOTE: Dialog directives collection for ease-of-use import in standalone components scenario */
export const IGX_DIALOG_DIRECTIVES = [
    IgxDialogComponent,
    IgxDialogTitleDirective,
    IgxDialogActionsDirective
] as const;
