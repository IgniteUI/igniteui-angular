import { IgxBreadcrumbComponent } from './breadcrumb.component';
import { IgxBreadcrumbItemComponent } from './breadcrumb-item.component';
import { IgxBreadcrumbSeparatorDirective, IgxBreadcrumbItemTemplateDirective } from './breadcrumb.directives';

export * from './breadcrumb.component';
export * from './breadcrumb-item.component';
export * from './breadcrumb.directives';
export * from './breadcrumb.service';
export * from './breadcrumb.common';

/* NOTE: Breadcrumb directives collection for ease-of-use import in standalone components scenario */
export const IGX_BREADCRUMB_DIRECTIVES = [
    IgxBreadcrumbComponent,
    IgxBreadcrumbItemComponent,
    IgxBreadcrumbSeparatorDirective,
    IgxBreadcrumbItemTemplateDirective
] as const;
