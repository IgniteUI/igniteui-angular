/**
 * The type of breadcrumb display behavior.
 * - `location`: Used for navigation schemes with multiple levels of hierarchy
 * - `attribute`: Displays the full crumb items trail
 * - `dynamic`: Path-based breadcrumbs showing the path taken to arrive at a page
 */
export type BreadcrumbType = 'location' | 'attribute' | 'dynamic';

/**
 * Interface representing a breadcrumb item.
 */
export interface IBreadcrumbItem {
    /** The display label for the breadcrumb item */
    label: string;
    /** The URL for standard navigation */
    link?: string;
    /** Angular router link for navigation */
    routerLink?: string | any[];
    /** Whether the item is disabled/non-clickable */
    disabled?: boolean;
    /** Optional icon name to display */
    icon?: string;
}
