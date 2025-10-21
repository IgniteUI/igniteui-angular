import { IgxHintDirective } from 'igniteui-angular/directives';
import { IgxInputDirective } from 'igniteui-angular/directives';
import { IgxLabelDirective } from 'igniteui-angular/directives';
import { IgxPrefixDirective } from 'igniteui-angular/directives';
import { IgxSuffixDirective } from 'igniteui-angular/directives';
import { IgxInputGroupComponent } from './input-group.component';

export * from './input-group.component';
export * from 'igniteui-angular/directives';
export * from 'igniteui-angular/directives';
export * from 'igniteui-angular/directives';
export * from 'igniteui-angular/directives';
export * from 'igniteui-angular/directives';
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
