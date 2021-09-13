import { Pipe, PipeTransform } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxPivotGridComponent } from './pivot-grid.component';

/**
 * @hidden
 */
@Pipe({
    name: 'gridPivotData',
    pure: true
})
export class IgxGridPivotDataPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxPivotGridComponent>) { }

    public transform(
        collection: any
        ): any[] {
        return collection;
    }
}

/**
 * @hidden
 */
 @Pipe({
    name: 'gridPivotColumns',
    pure: true
})
export class IgxGridPivotColumnsPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxPivotGridComponent>) { }

    public transform(
        collection: any
        ): any[] {
        return collection;
    }
}

/**
 * @hidden
 */
@Pipe({
    name: 'gridPivotFilter',
    pure: true
})
export class IgxPivotGridFilterPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxPivotGridComponent>) { }

    public transform(collection: any[]): any[] {
        return collection;
    }
}
