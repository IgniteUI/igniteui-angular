import { IgxListItemComponent } from './list-item.component';
import { IgxDataLoadingTemplateDirective, IgxEmptyListTemplateDirective, IgxListItemLeftPanningTemplateDirective, IgxListItemRightPanningTemplateDirective } from './list.common';
import { IgxListActionDirective, IgxListComponent, IgxListLineDirective, IgxListLineSubTitleDirective, IgxListLineTitleDirective, IgxListThumbnailDirective } from './list.component';

export * from './list.component';
export {
    IgxListBaseDirective,
    IgxListPanState,
    IgxEmptyListTemplateDirective,
    IgxDataLoadingTemplateDirective,
    IgxListItemLeftPanningTemplateDirective,
    IgxListItemRightPanningTemplateDirective
} from './list.common';
export * from './list-item.component';

/* NOTE: List directives collection for ease-of-use import in standalone components scenario */
export const IGX_LIST_DIRECTIVES = [
    IgxListComponent,
    IgxListItemComponent,
    IgxListThumbnailDirective,
    IgxListActionDirective,
    IgxListLineDirective,
    IgxListLineTitleDirective,
    IgxListLineSubTitleDirective,
    IgxDataLoadingTemplateDirective,
    IgxEmptyListTemplateDirective,
    IgxListItemLeftPanningTemplateDirective,
    IgxListItemRightPanningTemplateDirective
] as const;
