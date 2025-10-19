import { IgxDropDownGroupComponent } from './drop-down-group.component';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownItemNavigationDirective } from './drop-down-navigation.directive';
import { IgxDropDownComponent } from './drop-down.component';

export * from './drop-down.component';
export * from './drop-down-item.component';
export { ISelectionEventArgs, IDropDownNavigationDirective } from './drop-down.common';
export * from './drop-down-navigation.directive';
export * from './drop-down-group.component';

/* NOTE: Drop down directives collection for ease-of-use import in standalone components scenario */
export const IGX_DROP_DOWN_DIRECTIVES = [
    IgxDropDownComponent,
    IgxDropDownItemComponent,
    IgxDropDownGroupComponent,
    IgxDropDownItemNavigationDirective
] as const;
