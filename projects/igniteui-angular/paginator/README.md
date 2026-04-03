# igx-paginator

Pagination component for Ignite UI for Angular.

This entry point provides the paginator UI used across the grid family to display paging information, let users pick a page size, and navigate through large data sets.

## Getting Started

```ts
import { Component } from '@angular/core';
import { IgxPaginatorComponent } from 'igniteui-angular/paginator';

@Component({
        selector: 'app-sample',
        standalone: true,
        imports: [IgxPaginatorComponent],
        template: `
            <igx-paginator
                [totalRecords]="total"
                [perPage]="perPage"
                (perPageChange)="perPage = $event"
                (pageChange)="handlePage($event)">
            </igx-paginator>
        `
})
export class SampleComponent {
        public total = 250;
        public perPage = 25;

        public handlePage(index: number): void {
                // Load the data chunk for the requested page.
        }
}
```

## Basic Configuration

```html
<igx-grid [data]="pagedData" [paging]="true">
    <!-- columns -->
</igx-grid>

<igx-paginator
    [totalRecords]="totalRecords"
    [perPage]="perPage"
    [selectOptions]="[10, 25, 50, 100]"
    (pageChange)="onPageChanged($event)"
    (perPageChange)="onPerPageChanged($event)">
</igx-paginator>
```

1. Bind `totalRecords` to the total data size (remote or local).
2. Handle `pageChange` to request or compute the correct data slice.
3. Optionally provide custom `selectOptions` to limit the page-size dropdown.

## Customization

- **Custom content** – project markup with `igxPaginatorContent` for bespoke layouts.
- **Overlay settings** – provide the `overlaySettings` input to align the page-size dropdown with your app shell.
- **Localization** – set `resourceStrings` with your own `IPaginatorResourceStrings` implementation.

```html
<ng-template igxPaginatorContent>
    Displaying {{ page + 1 }} / {{ totalPages }}
</ng-template>
```

## API Reference

### Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | number | `0` | Current zero-based page index. |
| `perPage` | number | `15` | Number of records shown per page. Updating recalculates `totalPages`. |
| `totalRecords` | number | `undefined` | Total records in the bound data source. |
| `selectOptions` | number[] | `[5,10,15,25,50,100,500]` | Values displayed in the page-size selector; merged with `perPage` for uniqueness. |
| `overlaySettings` | `OverlaySettings` | `{}` | Customizes how the dropdown for page-size is rendered. |
| `resourceStrings` | `IPaginatorResourceStrings` | `PaginatorResourceStringsEN` | Localizes button labels and tooltips. |

### Outputs

| Event | Payload | Description |
| --- | --- | --- |
| `perPageChange` | `number` | Fires after the page-size changes. |
| `pageChange` | `number` | Fires after the current page changes. |
| `paging` | `IPageCancellableEventArgs` | Fires before paging; set `cancel = true` to block navigation. |
| `pagingDone` | `IPageEventArgs` | Fires after paging completes with previous/current page info. |

### Methods and Convenience Getters

- `nextPage()`, `previousPage()` – move the current page forward or backward when possible.
- `paginate(index: number)` – jump to a specific page programmatically.
- `isFirstPage`, `isLastPage` – booleans that indicate boundary conditions for navigation controls.
- `nativeElement` – underlying DOM element, useful when integrating with lower-level libraries.

## Related Packages

- [Grids](../grids/README.md) – demonstrates the paginator in action inside data grids.
- [Core Overlay Services](../core/src/services/overlay/README.md) – configure advanced dropdown positioning shared with the paginator.

Consult the [official paginator documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/paginator) for tutorials and live examples.
