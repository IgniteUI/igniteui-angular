import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { cloneArray } from "../core/utils";
import { SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxGridComponent } from "./grid.component";
import { IgxGridRowComponent } from "./row.component";

@Injectable()
export class IgxGridAPIService {

    public change: Subject<any> = new Subject<any>();
    protected state: Map<string, IgxGridComponent> = new Map<string, IgxGridComponent>();

    public register(grid: IgxGridComponent) {
        this.state.set(grid.id, grid);
    }

    public get(id: string): IgxGridComponent {
        return this.state.get(id);
    }

    public markForCheck(id: string): void {
        this.get(id).cdr.markForCheck();
        if (this.get(id).rowList) {
            this.get(id).rowList.forEach((row) => row.cdr.markForCheck());
        }
    }

    public get_column_by_name(id: string, name: string): IgxColumnComponent {
        return this.get(id).columnList.find((col) => col.field === name);
    }

    public get_row(id: string, index: number): IgxGridRowComponent {
        return this.get(id).rowList.find((row) => row.index === index);
    }

    public get_cell_by_field(id: string, rowIndex: number, field: string): IgxGridCellComponent {
        const row = this.get_row(id, rowIndex);
        if (row) {
            return row.cells.find((cell) => cell.column.field === field);
        }
    }

    public get_cell_by_index(id: string, rowIndex: number, columnIndex: number): IgxGridCellComponent {
        const row = this.get_row(id, rowIndex);
        if (row) {
            return row.cells.find((cell) => cell.columnIndex === columnIndex);
        }
    }

    public update(id: string, cell: IgxGridCellComponent): void {
        const index = this.get(id).data.indexOf(cell.row.rowData);
        this.get(id).data[index][cell.column.field] = cell.value;
    }

    public updateRow(value: any, id: string, row: IgxGridRowComponent): void {
        const index = this.get(id).data.indexOf(row.rowData);
        this.get(id).data[index] = value;
    }

    public sort(id: string, fieldName: string, dir: SortingDirection): void {
        const sortingState = this.get(id).sortingExpressions;

        this.prepare_sorting_expression(sortingState, fieldName, dir);
        this.get(id).sortingExpressions = sortingState;
    }

    public sort_multiple(id: string, expressions): void {
        const sortingState = this.get(id).sortingExpressions;

        for (const each of expressions) {
            this.prepare_sorting_expression(sortingState, each.fieldName, each.dir);
        }

        this.get(id).sortingExpressions = sortingState;
    }

    public filter(id, fieldName, term, condition, ignoreCase) {
        const filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }
        this.prepare_filtering_expression(filteringState, fieldName, term, condition, ignoreCase);
        this.get(id).filteringExpressions = filteringState;
    }

    public filterGlobal(id, term, condition, ignoreCase) {
        const filteringState = this.get(id).filteringExpressions;
        for (const column of this.get(id).columns) {
            this.prepare_filtering_expression(filteringState, column.field, term,
                condition || column.filteringCondition, ignoreCase || column.filteringIgnoreCase);
        }
        this.get(id).filteringExpressions = filteringState;
    }

    public clear_filter(id, fieldName) {
        const filteringState = this.get(id).filteringExpressions;
        filteringState.splice(filteringState.findIndex((expr) => expr.fieldName === fieldName), 1);
        this.get(id).filteringExpressions = filteringState;
    }

    protected prepare_filtering_expression(state, fieldName, searchVal, condition, ignoreCase) {

        const expression = state.find((expr) => expr.fieldName === fieldName);
        const newExpression = { fieldName, searchVal, condition, ignoreCase };
        if (!expression) {
            state.push(newExpression);
        } else {
            Object.assign(expression, newExpression);
        }
    }

    protected prepare_sorting_expression(state, fieldName, dir) {

        if (dir === SortingDirection.None) {
            state.splice(state.findIndex((expr) => expr.fieldName === fieldName), 1);
            return;
        }

        const expression = state.find((expr) => expr.fieldName === fieldName);

        if (!expression) {
            state.push({ fieldName, dir });
        } else {
            Object.assign(expression, { fieldName, dir });
        }
    }
}
