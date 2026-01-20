import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IgxGridLiteComponent } from "igniteui-angular/grids/lite";
import { GridLiteDataService } from './data.service';




@Component({
    selector: 'app-grid-lite-sample',
    templateUrl: 'grid-lite.sample.html',
    styleUrls: ['grid-lite.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxGridLiteComponent]
})
export class GridLiteSampleComponent {
    protected data = [];
    private dataService = inject(GridLiteDataService);
    constructor() {
        this.data = this.dataService.generateUsers(100);
    }
}
