import {
    Component,
    ElementRef,
    HostBinding,
    Input,
    booleanAttribute
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IgxIconComponent } from 'igniteui-angular/icon';

let NEXT_ID = 0;

/**
 * IgxBreadcrumbItem represents a single item in the breadcrumb trail.
 *
 * @igxModule IgxBreadcrumbModule
 *
 * @igxKeywords breadcrumb item, crumb
 *
 * @igxGroup Navigation
 *
 * @remarks
 * The breadcrumb item component can be used with standard href links, Angular router links,
 * or as a disabled/non-clickable element for the current location.
 *
 * @example
 * ```html
 * <igx-breadcrumb-item [routerLink]="['/home']" icon="home">Home</igx-breadcrumb-item>
 * <igx-breadcrumb-item [disabled]="true">Current Page</igx-breadcrumb-item>
 * ```
 */
@Component({
    selector: 'igx-breadcrumb-item',
    templateUrl: 'breadcrumb-item.component.html',
    styleUrl: 'breadcrumb-item.component.scss',
    standalone: true,
    imports: [RouterLink, IgxIconComponent],
    host: {
        'role': 'listitem'
    }
})
export class IgxBreadcrumbItemComponent {
    /**
     * Sets the value of the `id` attribute. If not provided it will be automatically generated.
     *
     * @example
     * ```html
     * <igx-breadcrumb-item [id]="'breadcrumb-item-1'" [routerLink]="['/home']">Home</igx-breadcrumb-item>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-breadcrumb-item-${NEXT_ID++}`;

    /**
     * Navigation URL (standard href).
     *
     * @example
     * ```html
     * <igx-breadcrumb-item link="/products">Products</igx-breadcrumb-item>
     * ```
     */
    @Input()
    public link: string;

    /**
     * Angular Router integration for navigation.
     *
     * @example
     * ```html
     * <igx-breadcrumb-item [routerLink]="['/products', 'electronics']">Electronics</igx-breadcrumb-item>
     * ```
     */
    @Input()
    public routerLink: string | any[];

    /**
     * Whether the item is disabled/non-clickable.
     * Typically used for the current location (last item).
     *
     * @example
     * ```html
     * <igx-breadcrumb-item [disabled]="true">Current Page</igx-breadcrumb-item>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public disabled = false;

    /**
     * Optional icon name to display before the item label.
     *
     * @example
     * ```html
     * <igx-breadcrumb-item icon="home" [routerLink]="['/home']">Home</igx-breadcrumb-item>
     * ```
     */
    @Input()
    public icon: string;

    /** @hidden */
    @HostBinding('class.igx-breadcrumb-item')
    public cssClass = true;

    /** @hidden */
    @HostBinding('class.igx-breadcrumb-item--disabled')
    public get disabledClass(): boolean {
        return this.disabled;
    }

    /** @hidden */
    @HostBinding('class.igx-breadcrumb-item--current')
    public isCurrent = false;

    /** @hidden */
    @HostBinding('class.igx-breadcrumb-item--hidden')
    public isHidden = false;

    constructor(public elementRef: ElementRef<HTMLElement>) {}

    /**
     * Returns the display label of the breadcrumb item.
     */
    public get label(): string {
        return this.elementRef.nativeElement.textContent?.trim() || '';
    }
}
