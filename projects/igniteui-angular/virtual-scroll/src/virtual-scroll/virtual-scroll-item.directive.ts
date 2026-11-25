import { Directive, inject, TemplateRef } from "@angular/core";
import { IgxVsItemContext } from "./types";

/**
 * Directive to mark an `ng-template` as the item template for the virtual scroll component.
 * The template provided by this directive will be used to render each item in the virtual scroll.
 * The context for the template will include the item data and its index.
 *
 * @example
 * ```html
 * <igx-virtual-scroll [data]="items">
 *   <ng-template igxVirtualItem let-item let-i="index">
 *     <div>{{ i }}: {{ item }}</div>
 *   </ng-template>
 * </igx-virtual-scroll>
 * ```
 */
@Directive({ selector: "ng-template[igxVirtualItem]" })
export class IgxVirtualItemDirective<T = unknown> {
  public readonly template =
    inject<TemplateRef<IgxVsItemContext<T>>>(TemplateRef);
}
