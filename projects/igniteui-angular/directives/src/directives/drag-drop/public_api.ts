import { IgxDragDirective, IgxDragHandleDirective, IgxDragIgnoreDirective, IgxDropDirective } from './drag-drop.directive';

export * from './drag-drop.strategy';
export * from './drag-drop.directive';

/* NOTE: Drag and drop directives collection for ease-of-use import in standalone components scenario */
export const IGX_DRAG_DROP_DIRECTIVES = [
    IgxDragDirective,
    IgxDropDirective,
    IgxDragHandleDirective,
    IgxDragIgnoreDirective
] as const;
