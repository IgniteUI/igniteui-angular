import { Injectable, Optional } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IBreadcrumbItem } from './breadcrumb.common';

/**
 * Service for generating breadcrumbs from Angular Router configuration.
 *
 * @remarks
 * This service listens to router events and builds a breadcrumb trail
 * from route data. Routes should define breadcrumb labels using
 * `data: { breadcrumb: 'Label' }` in their configuration.
 *
 * @example
 * ```typescript
 * // Route configuration
 * const routes: Routes = [
 *   { path: '', data: { breadcrumb: 'Home' }, component: HomeComponent },
 *   { 
 *     path: 'products', 
 *     data: { breadcrumb: 'Products' },
 *     children: [
 *       { path: ':id', data: { breadcrumb: 'Product Details' }, component: ProductComponent }
 *     ]
 *   }
 * ];
 *
 * // Component usage
 * @Component({...})
 * export class AppComponent {
 *   breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
 *   constructor(private breadcrumbService: IgxBreadcrumbService) {}
 * }
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class IgxBreadcrumbService {
    private breadcrumbsSubject = new BehaviorSubject<IBreadcrumbItem[]>([]);

    /**
     * Observable of the current breadcrumb items.
     */
    public breadcrumbs$: Observable<IBreadcrumbItem[]> = this.breadcrumbsSubject.asObservable();

    constructor(
        @Optional() private router: Router,
        @Optional() private activatedRoute: ActivatedRoute
    ) {
        if (this.router && this.activatedRoute) {
            this.router.events
                .pipe(filter(event => event instanceof NavigationEnd))
                .subscribe(() => {
                    this.updateBreadcrumbs();
                });

            // Initial breadcrumb build
            this.updateBreadcrumbs();
        }
    }

    /**
     * Returns the current breadcrumb items.
     */
    public get breadcrumbs(): IBreadcrumbItem[] {
        return this.breadcrumbsSubject.value;
    }

    /**
     * Manually sets the breadcrumb items.
     * This overrides any auto-generated breadcrumbs.
     *
     * @param items The breadcrumb items to set
     */
    public setBreadcrumbs(items: IBreadcrumbItem[]): void {
        this.breadcrumbsSubject.next(items);
    }

    /**
     * Adds a breadcrumb item to the end of the trail.
     *
     * @param item The breadcrumb item to add
     */
    public addBreadcrumb(item: IBreadcrumbItem): void {
        const current = this.breadcrumbsSubject.value;
        this.breadcrumbsSubject.next([...current, item]);
    }

    /**
     * Clears all breadcrumb items.
     */
    public clearBreadcrumbs(): void {
        this.breadcrumbsSubject.next([]);
    }

    /**
     * Refreshes the breadcrumbs from the current route.
     */
    public refresh(): void {
        this.updateBreadcrumbs();
    }

    private updateBreadcrumbs(): void {
        if (!this.activatedRoute) {
            return;
        }

        const breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
        this.breadcrumbsSubject.next(breadcrumbs);
    }

    private buildBreadcrumbs(
        route: ActivatedRoute,
        url: string = '',
        breadcrumbs: IBreadcrumbItem[] = []
    ): IBreadcrumbItem[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

            if (routeURL !== '') {
                url += `/${routeURL}`;
            }

            const label = child.snapshot.data['breadcrumb'];
            if (label) {
                const isLast = child.children.length === 0 || 
                    !child.children.some(c => c.snapshot.data['breadcrumb']);

                breadcrumbs.push({
                    label: this.resolveLabel(label, child),
                    routerLink: url,
                    disabled: isLast
                });
            }

            return this.buildBreadcrumbs(child, url, breadcrumbs);
        }

        return breadcrumbs;
    }

    private resolveLabel(label: string | ((data: any) => string), route: ActivatedRoute): string {
        if (typeof label === 'function') {
            return label(route.snapshot.data);
        }
        return label;
    }
}
