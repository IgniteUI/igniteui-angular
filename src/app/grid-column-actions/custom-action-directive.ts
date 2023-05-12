import { Directive, Inject } from '@angular/core';
import { IgxColumnActionsBaseDirective, IgxColumnActionsComponent, IgxColumnComponent, SortingDirection } from 'igniteui-angular';



@Directive({
    selector: '[appColumnGrouping]',
    standalone: true
})
export class IgxColumnGroupingDirective extends IgxColumnActionsBaseDirective {

    constructor(
        @Inject(IgxColumnActionsComponent) protected columnActions: IgxColumnActionsComponent
    ) {
        super();
        columnActions.actionsDirective = this;
    }

    /**
     * @hidden @internal
     */
    public get checkAllLabel(): string {
        return 'Group By All';
    }

    /**
     * @hidden @internal
     */
    public get uncheckAllLabel(): string {
        return 'Ungroup All';
    }

    public get allUnchecked() {
        return false;
    }
    public get allChecked() {
       return false;
    }

    /**
     * @hidden @internal
     */
    public uncheckAll() {
        const grid = this.columnActions.grid as any;
        this.columnActions.filteredColumns.forEach(c =>  grid.clearGrouping(c.field));
    }

    /**
     * @hidden @internal
     */
    public checkAll() {
        const grid = this.columnActions.grid as any;
        this.columnActions.filteredColumns.forEach(c =>  grid.groupBy({
                fieldName: c.field, dir: SortingDirection.Desc, ignoreCase: false
            })
        );
    }

    /**
     * @hidden @internal
     */
    public actionEnabledColumnsFilter = c => c.groupable || !!(c.columnGroup && c.children.toArray().some(child => child.groupable));

    /**
     * @hidden @internal
     */
    public columnChecked(column: IgxColumnComponent): boolean {
        const grid = column.grid as any;
        const isGrouped = grid.groupingExpressions.find(x => x.fieldName === column.field);
        return !!isGrouped;
    }

    /**
     * @hidden @internal
     */
    public toggleColumn(column: IgxColumnComponent) {
        const grid = column.grid as any;
        const groupExpression = grid.groupingExpressions.find(x => x.fieldName === column.field);
        if (groupExpression) {
            grid.clearGrouping(column.field);
        } else {
            grid.groupBy({
                fieldName: column.field, dir: SortingDirection.Desc, ignoreCase: false
            });
        }
    }
}
