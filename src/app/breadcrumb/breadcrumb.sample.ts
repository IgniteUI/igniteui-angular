import { Component, ViewEncapsulation } from '@angular/core';
import { IGX_BREADCRUMB_DIRECTIVES, IgxBreadcrumbSeparatorDirective } from 'igniteui-angular/breadcrumb';
import { IgxIconComponent } from 'igniteui-angular/icon';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-breadcrumb-sample',
    styleUrls: ['breadcrumb.sample.scss'],
    templateUrl: 'breadcrumb.sample.html',
    imports: [IGX_BREADCRUMB_DIRECTIVES, IgxBreadcrumbSeparatorDirective, IgxIconComponent]
})
export class BreadcrumbSampleComponent {
    // Sample data for dynamic breadcrumbs
    public breadcrumbItems = [
        { label: 'Home', link: '/home', icon: 'home' },
        { label: 'Products', link: '/products' },
        { label: 'Electronics', link: '/products/electronics' },
        { label: 'Laptops', link: '/products/electronics/laptops' },
        { label: 'Gaming Laptops', link: '/products/electronics/laptops/gaming' },
        { label: 'ASUS ROG', disabled: true }
    ];

    // Toggle for custom separator demo
    public useCustomSeparator = false;

    // Toggle for collapsed items demo
    public showCollapsed = true;
    public maxItems = 4;
    public itemsBeforeCollapse = 1;
    public itemsAfterCollapse = 2;

    public toggleCustomSeparator(): void {
        this.useCustomSeparator = !this.useCustomSeparator;
    }

    public toggleCollapsed(): void {
        this.showCollapsed = !this.showCollapsed;
    }
}
