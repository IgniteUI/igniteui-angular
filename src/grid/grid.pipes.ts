import { Pipe, PipeTransform } from "@angular/core";
import { cloneArray } from "../core/utils";
import { DataUtil } from "../data-operations/data-util";
import { FilteringLogic, IFilteringExpression } from "../data-operations/filtering-expression.interface";
import { ISortingExpression } from "../data-operations/sorting-expression.interface";
import { IgxGridAPIService } from "./api.service";

@Pipe({
  name: "gridSort",
  pure: true
})
export class IgxGridSortingPipe implements PipeTransform {

    constructor(private gridAPI: IgxGridAPIService) {}

    public transform(collection: any[], expressions: ISortingExpression | ISortingExpression[],
                     id: string, pipeTrigger: number): any[] {

        const state = { expressions: []};
        state.expressions = this.gridAPI.get(id).sortingExpressions;

        if (!state.expressions.length) {
            return collection;
        }

        return DataUtil.sort(cloneArray(collection), state);
    }
}

@Pipe({
    name: "gridPaging",
    pure: true
})
export class IgxGridPagingPipe implements PipeTransform {

    constructor(private gridAPI: IgxGridAPIService) {}

    public transform(collection: any[], page = 0, perPage = 10, id: string, pipeTrigger: number): any[] {

        if (!this.gridAPI.get(id).paging) {
            return collection;
        }

        const state = {
            index: page,
            recordsPerPage: perPage
        };

        const result = DataUtil.page(cloneArray(collection), state);
        this.gridAPI.get(id).pagingState = state;
        return result;
    }
}

@Pipe({
    name: "gridFiltering",
    pure: true
})
export class IgxGridFilteringPipe implements PipeTransform {

    constructor(private gridAPI: IgxGridAPIService) {}

    public transform(collection: any[], expressions: IFilteringExpression | IFilteringExpression[],
                     logic: FilteringLogic, id: string, pipeTrigger: number) {
        const state = { expressions: [], logic };
        state.expressions = this.gridAPI.get(id).filteringExpressions;

        if (!state.expressions.length) {
            return collection;
        }

        return DataUtil.filter(cloneArray(collection), state);
    }
}

@Pipe({
    name: "filterCondition",
    pure: true
})
export class IgxGridFilterConditionPipe implements PipeTransform {

    public transform(value: string): string {
        return value.split(/(?=[A-Z])/).join(" ");
    }
}
