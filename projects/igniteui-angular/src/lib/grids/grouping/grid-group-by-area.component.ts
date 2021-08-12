import {
    Component,
    ElementRef,
    Input,
} from '@angular/core';
import { IChipsAreaReorderEventArgs } from '../../chips/public_api';
import { PlatformUtil } from '../../core/utils';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { FlatGridType } from '../common/grid.interface';
import { IgxGroupByAreaDirective } from './group-by-area.directive';

/**
 * An internal component representing the group-by drop area for the igx-grid component.
 *
 * @hidden @internal
 */
@Component({
    selector: 'igx-grid-group-by-area',
    templateUrl: 'group-by-area.component.html',
    providers: [{ provide: IgxGroupByAreaDirective, useExisting: IgxGridGroupByAreaComponent }]
})
export class IgxGridGroupByAreaComponent extends IgxGroupByAreaDirective {
    @Input()
    public sortingExpressions: ISortingExpression[] = [];

    /** The parent grid containing the component. */
    @Input()
    public grid: FlatGridType;

    constructor(ref: ElementRef<HTMLElement>, platform: PlatformUtil) {
        super(ref, platform);
     }

    public handleReorder(event: IChipsAreaReorderEventArgs) {
        const { chipsArray, originalEvent } = event;
        const newExpressions = this.getReorderedExpressions(chipsArray);

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

    public groupBy(expression: IGroupingExpression) {
        this.grid.groupBy(expression);
    }

    public clearGrouping(name: string) {
        this.grid.clearGrouping(name);
    }
}

