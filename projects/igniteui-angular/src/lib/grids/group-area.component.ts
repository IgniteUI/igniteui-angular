import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { IBaseChipEventArgs, IChipClickEventArgs, IChipKeyDownEventArgs } from '../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../chips/chips-area.component';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { IgxGridComponent } from './grid/grid.component';
import { IgxTreeGridComponent } from './tree-grid/tree-grid.component';

/**
 * Provides a pre-configured column grouping component for the tree grid.
 *
 * @example
 * ```html
 *  <igx-group-area></igx-group-area>
 * ```
 */
@Component({
    selector: 'igx-group-area',
    templateUrl: './group-area.component.html'
})
export class IgxGroupAreaComponent {
    private _groupingExpressions: IGroupingExpression[];

    @Input()
    public grid: IgxGridComponent | IgxTreeGridComponent;

    @Input()
    public get groupingExpressions(): IGroupingExpression[] {
        return this._groupingExpressions;
    }
    public set groupingExpressions(value: IGroupingExpression[]) {
        this._groupingExpressions = value;
        this.groupingExpressionsChange.emit(value);
    }

    /**
     * @hidden
     */
    @Output()
    public groupingExpressionsChange = new EventEmitter<IGroupingExpression[]>();

    /**
     * @hidden @internal
     */
    @ViewChild('groupArea')
    public groupArea: ElementRef;

    /**
     * @hidden @internal
     */
    public chipsOrderChanged(event: IChipsAreaReorderEventArgs) { }

    /**
     * @hidden @internal
     */
    public chipsMovingEnded() { }

    /**
     * @hidden @internal
     */
    public onChipKeyDown(event: IChipKeyDownEventArgs) { }

    /**
     * @hidden @internal
     */
    public onChipRemoved(event: IBaseChipEventArgs) { }

    /**
     * @hidden @internal
     */
    public onChipClicked(event: IChipClickEventArgs) { }

    /**
     * @hidden @internal
     */
     public getGroupByChipTitle(expression: IGroupingExpression): string {
        const column = this.grid.getColumnByName(expression.fieldName);
        return (column && column.header) || expression.fieldName;
    }

    /**
     * @hidden @internal
     */
    public getColumnGroupable(fieldName: string): boolean {
        const column = this.grid.getColumnByName(fieldName);
        return column && column.groupable;
    }

    /**
     * @hidden @internal
     */
    public get dropAreaTemplateResolved(): TemplateRef<any> {
        if (this.grid.dropAreaTemplate) {
            return this.grid.dropAreaTemplate;
        } else {
            return this.grid.defaultDropAreaTemplate;
        }
    }

    /**
     * @hidden @internal
     */
    public getGroupAreaHeight(): number {
        return this.groupArea ? this.grid.getComputedHeight(this.groupArea.nativeElement) : 0;
    }
}
