import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxButtonGroupComponent } from './buttonGroup.component';

export * from './buttonGroup.component';

/* Button group directives collection for ease-of-use import in standalone components scenario */
export const IGX_BUTTON_GROUP_DIRECTIVES = [
    IgxButtonGroupComponent,
    IgxButtonDirective
] as const;
