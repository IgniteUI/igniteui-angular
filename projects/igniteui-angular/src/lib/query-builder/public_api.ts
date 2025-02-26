import { IgxQueryBuilderHeaderComponent } from './query-builder-header.component';
import { IgxQueryBuilderComponent } from './query-builder.component';
import { IgxQueryBuilderSearchValueTemplateDirective } from './query-builder.directives';

export {
    IgxQueryBuilderComponent
} from './query-builder.component';
export * from './query-builder-header.component';
export * from './query-builder.directives';

/* NOTE: Query builder directives collection for ease-of-use import in standalone components scenario */
export const IGX_QUERY_BUILDER_DIRECTIVES = [
    IgxQueryBuilderComponent,
    IgxQueryBuilderHeaderComponent,
    IgxQueryBuilderSearchValueTemplateDirective,
] as const;
