import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent } from '../grid-base.component';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxGridAPIService } from './grid-api.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    providers: [IgxGridNavigationService, { provide: GridBaseAPIService, useClass: IgxGridAPIService }],
    selector: 'igx-grid',
    templateUrl: './grid.component.html'
})
export class IgxGridComponent extends IgxGridBaseComponent {
}
