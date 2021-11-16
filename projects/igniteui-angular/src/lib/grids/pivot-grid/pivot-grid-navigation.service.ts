import { IgxGridNavigationService } from '../grid-navigation.service';
import { Injectable } from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';

@Injectable()
export class IgxPivotGridNavigationService extends IgxGridNavigationService {
    public grid: IgxPivotGridComponent;

    public dispatchEvent(event: KeyboardEvent) {
        // TODO
    }
}
