import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    Input,
    Pipe,
    PipeTransform,
    TemplateRef
} from '@angular/core';
import { IChipsAreaReorderEventArgs } from '../../chips/public_api';
import { DisplayDensity } from '../../core/displayDensity';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { FlatGridType } from '../common/grid.interface';

/**
 * An internal component representing the group-by drop area for the igx-grid component.
 *
 * @hidden @internal
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-group-by-area',
    templateUrl: 'group-by-area.component.html'
})
export class IgxGridGroupByAreaComponent implements DoCheck {

    /**
     * The group-by expressions provided by the parent grid.
     */
    @Input()
    public expressions: IGroupingExpression[] = [];

    /**
     * The drop area template if provided by the parent grid.
     * Otherwise, uses the default internal one.
     */
    @Input()
    public dropAreaTemplate: TemplateRef<void>;

    /**
     * The default message for the default drop area template.
     * Obviously, if another template is provided, this is ignored.
     */
    @Input()
    public dropAreaMessage: string;

    /**
     * Controls the visibility of the drop area component.
     */
    @Input()
    public visible = true;

    @Input()
    public density: DisplayDensity;

    /** The parent grid containing the component. */
    @Input()
    public grid: FlatGridType;

    /** The native DOM element. Used in sizing calculations. */
    public get nativeElement() {
        return this.ref.nativeElement;
    }

    constructor(private ref: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) { }

    public ngDoCheck() {
        if (this.expressions.length) {
            // this.cdr.markForCheck();
        }
    }


    public handleReorder(event: IChipsAreaReorderEventArgs) {
        const newExpressions = [];
        const { chipsArray, originalEvent } = event;

        chipsArray.forEach(chip => {
            const expr = this.expressions.find(item => item.fieldName === chip.id);

            // disallow changing order if there are columns with groupable: false
            if (!this.grid.getColumnByName(expr.fieldName)?.groupable) {
                return;
            }

            newExpressions.push(expr);
        });

        this.grid.groupingExpansionState = [];
        this.expressions = newExpressions;

        // When reordered using keyboard navigation, we don't have `onMoveEnd` event.
        if (originalEvent instanceof KeyboardEvent) {
            this.grid.groupingExpressions = newExpressions;
        }
    }

    public handleMoveEnd() {
        this.grid.groupingExpressions = this.expressions;
    }

    public handleKeyDown(id: string, key: string) {
        // Use the refactored KEYMAP enum later
        if (![' ', 'Spacebar', 'Enter'].includes(key)) {
            return;
        }
        this.updateSorting(id);
    }

    public handleClick(id: string) {
        this.updateSorting(id);
    }

    protected updateSorting(id: string) {
        const expr = this.grid.sortingExpressions.find(e => e.fieldName === id);
        expr.dir = 3 - expr.dir;
        this.grid.sort(expr);
    }
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

    public transform(key: string, grid: FlatGridType) {
        const column = grid.getColumnByName(key);
        return { groupable: column.groupable, title: column?.header ?? key };
    }
}
