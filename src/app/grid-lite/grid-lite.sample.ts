import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, viewChild } from '@angular/core';
import { IgxGridLiteCellTemplateDirective, IgxGridLiteColumnComponent, IgxGridLiteComponent, IgxGridLiteFilteringExpression, IgxGridLiteHeaderTemplateDirective, IgxGridLiteSortingExpression, IgxGridLiteSortingOptions } from "igniteui-angular/grids/lite";
import { GridLiteDataService } from './data.service';
import { IgxCheckboxComponent } from 'igniteui-angular';
@Component({
    selector: 'app-grid-lite-sample',
    templateUrl: 'grid-lite.sample.html',
    styleUrls: ['grid-lite.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxCheckboxComponent, IgxGridLiteComponent, IgxGridLiteColumnComponent, IgxGridLiteHeaderTemplateDirective, IgxGridLiteCellTemplateDirective]
})
export class GridLiteSampleComponent {
    protected grid = viewChild<IgxGridLiteComponent<any>>('grid');
    protected data = [];
    private dataService = inject(GridLiteDataService);

    protected sortingExpressions: IgxGridLiteSortingExpression[] = [
        {
            key: 'firstName',
            direction: "ascending"
        }
    ]

    protected filteringExpressions: IgxGridLiteFilteringExpression[] = [
        {
            key: 'age',
            condition: 'greaterThan',
            searchTerm: 50
        }
    ]

    protected sortingOptions: IgxGridLiteSortingOptions = {
        mode: 'multiple'
    }

    constructor() {
        this.data = this.dataService.generateUsers(10);
    }

    protected logEvent(name: string, event: any) {
        console.log(name, event);
    }
}
