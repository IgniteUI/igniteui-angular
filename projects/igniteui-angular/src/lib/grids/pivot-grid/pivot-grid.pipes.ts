import { Pipe, PipeTransform } from '@angular/core';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { GridBaseAPIService } from '../api.service';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IPivotDimension, IPivotValue } from './pivot-grid.interface';

/**
 * @hidden
 */
@Pipe({
    name: 'gridPivotRow',
    pure: true
})
export class IgxPivotRowPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxPivotGridComponent>) { }

    public transform(
        collection: any,
        rows: IPivotDimension[],
        values?: IPivotValue[]
        ): any[] {
        return collection;
    }
}

/**
 * @hidden
 */
 @Pipe({
    name: 'gridPivotColumn',
    pure: true
})
export class IgxPivotColumnPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxPivotGridComponent>) { }

    public transform(
        collection: any,
        columns: IPivotDimension[],
        values?: IPivotValue[]
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

    public transform(collection: any[],
        expressionsTree: IFilteringExpressionsTree,
        filterStrategy: IFilteringStrategy,
        advancedExpressionsTree: IFilteringExpressionsTree): any[] {
        return collection;
    }
}
