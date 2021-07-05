import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    Pipe,
    PipeTransform,
    QueryList,
    TemplateRef,
    ViewChildren
} from '@angular/core';
import { IChipsAreaReorderEventArgs, IgxChipComponent } from '../../chips/public_api';
import { DisplayDensity } from '../../core/displayDensity';
import { PlatformUtil } from '../../core/utils';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxColumnComponent } from '../columns/column.component';
import { GridType } from '../common/grid.interface';
import { IgxColumnMovingDragDirective } from '../moving/moving.drag.directive';

/**
 * An internal component representing a base group-by drop area.
 *
 * @hidden @internal
 */
 @Directive()
export abstract class IgxGroupByAreaDirective {
    /**
     * The drop area template if provided by the parent grid.
     * Otherwise, uses the default internal one.
     */
    @Input()
    public dropAreaTemplate: TemplateRef<void>;

    @Input()
    public density: DisplayDensity = DisplayDensity.comfortable;

    @HostBinding('class.igx-grid__grouparea')
    public defaultClass =  true;

    @HostBinding('class.igx-grid__grouparea--cosy')
    public get cosyStyle() {
        return this.density === 'cosy';
    }

    @HostBinding('class.igx-grid__grouparea--compact')
    public get compactStyle() {
        return this.density === 'compact';
    }

    /** The parent grid containing the component. */
    @Input()
    public grid: GridType;

    /**
     * The group-by expressions provided by the parent grid.
     */
    @Input()
    public get expressions(): IGroupingExpression[] {
        return this._expressions;
    }

    public set expressions(value: IGroupingExpression[]) {
        this._expressions = value;
        this.chipExpressions = this._expressions;
        this.expressionsChanged();
        this.expressionsChange.emit(this._expressions);
    }

    /**
     * The default message for the default drop area template.
     * Obviously, if another template is provided, this is ignored.
     */
    @Input()
    public get dropAreaMessage(): string {
        return this._dropAreaMessage ?? this.grid.resourceStrings.igx_grid_groupByArea_message;
    }

    public set dropAreaMessage(value: string) {
        this._dropAreaMessage = value;
    }

    @Output()
    public expressionsChange = new EventEmitter<IGroupingExpression[]>();

    @ViewChildren(IgxChipComponent)
    public chips: QueryList<IgxChipComponent>;

    public chipExpressions: IGroupingExpression[];

    /** The native DOM element. Used in sizing calculations. */
    public get nativeElement() {
        return this.ref.nativeElement;
    }

    private _expressions: IGroupingExpression[] = [];
    private _dropAreaMessage: string;

    constructor(private ref: ElementRef<HTMLElement>, protected platform: PlatformUtil) { }


    public get dropAreaVisible(): boolean {
        return (this.grid.draggedColumn && this.grid.draggedColumn.groupable) ||
            !this.expressions.length;
    }

    public handleKeyDown(id: string, event: KeyboardEvent) {
        if (this.platform.isActivationKey(event)) {
            this.updateSorting(id);
        }
    }

    public handleClick(id: string) {
        if (!this.grid.getColumnByName(id).groupable) {
            return;
        }
        this.updateSorting(id);
    }

     public onDragDrop(event) {
        const drag: IgxColumnMovingDragDirective = event.detail.owner;
        if (drag instanceof IgxColumnMovingDragDirective) {
            const column: IgxColumnComponent = drag.column;
            if (this.grid.columns.indexOf(column) < 0) {
                return;
            }

            const isGrouped = this.expressions.findIndex((item) => item.fieldName === column.field) !== -1;
            if (column.groupable && !isGrouped && !column.columnGroup && !!column.field) {
                const groupingExpression = {
                    fieldName: column.field,
                    dir: SortingDirection.Asc,
                    ignoreCase: column.sortingIgnoreCase,
                    strategy: column.sortStrategy,
                    groupingComparer: column.groupingComparer
                };

                this.groupBy(groupingExpression);
            }
        }
    }

    protected getReorderedExpressions(chipsArray: IgxChipComponent[]) {
        const newExpressions = [];

        chipsArray.forEach(chip => {
            const expr = this.expressions.find(item => item.fieldName === chip.id);

            // disallow changing order if there are columns with groupable: false
            if (!this.grid.getColumnByName(expr.fieldName)?.groupable) {
                return;
            }

            newExpressions.push(expr);
        });

        return newExpressions;
    }

    protected updateSorting(id: string) {
        const expr = this.grid.sortingExpressions.find(e => e.fieldName === id);
        expr.dir = 3 - expr.dir;
        this.grid.sort(expr);
    }

    protected expressionsChanged() {
    }

    public abstract handleReorder(event: IChipsAreaReorderEventArgs);

    public abstract handleMoveEnd();

    public abstract groupBy(expression: IGroupingExpression);

    public abstract clearGrouping(name: string);

}

/**
 * A pipe to circumvent the use of getters/methods just to get some additional
 * information from the grouping expression and pass it to the chip representing
 * that expression.
 *
 * @hidden @internal
 */
@Pipe({ name: 'igxGroupByMeta' })
export class IgxGroupByMetaPipe implements PipeTransform {

    public transform(key: string, grid: GridType) {
        const column = grid.getColumnByName(key);
        return { groupable: column.groupable, title: column.header || key };
    }
}
