import { IgxHintDirective } from '../directives/hint/hint.directive';
import { IgxInputDirective } from '../directives/input/input.directive';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxInputGroupComponent } from './input-group.component';

export * from './input-group.component';
export * from '../directives/input/input.directive';
export * from '../directives/label/label.directive';
export * from '../directives/hint/hint.directive';
export * from '../directives/prefix/prefix.directive';
export * from '../directives/suffix/suffix.directive';
export * from './inputGroupType';

/* NOTE: Input group directives collection for ease-of-use import in standalone components scenario */
export const IGX_INPUT_GROUP_DIRECTIVES = [
    IgxInputGroupComponent,
    IgxInputDirective,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSuffixDirective,
    IgxHintDirective
] as const;
