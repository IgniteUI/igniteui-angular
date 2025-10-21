import { IgxHintDirective } from 'igniteui-angular/directives';
import { IgxLabelDirective } from 'igniteui-angular/directives';
import { IgxPrefixDirective } from 'igniteui-angular/directives';
import { IgxSuffixDirective } from 'igniteui-angular/directives';
import { IgxSelectGroupComponent } from './select-group.component';
import { IgxSelectItemComponent } from './select-item.component';
import { IgxSelectComponent, IgxSelectFooterDirective, IgxSelectHeaderDirective, IgxSelectToggleIconDirective } from './select.component';

export * from './select-group.component';
export * from './select-item.component';
export * from './select.component';

/* NOTE: Select directives collection for ease-of-use import in standalone components scenario */
export const IGX_SELECT_DIRECTIVES = [
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxSelectGroupComponent,
    IgxSelectHeaderDirective,
    IgxSelectFooterDirective,
    IgxSelectToggleIconDirective,
    IgxLabelDirective,
    IgxPrefixDirective,
    IgxSuffixDirective,
    IgxHintDirective
] as const;
