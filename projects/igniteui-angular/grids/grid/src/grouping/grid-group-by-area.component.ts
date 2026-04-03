import {
    Component,
    Input,
} from '@angular/core';
import { IChipsAreaReorderEventArgs, IgxChipComponent, IgxChipsAreaComponent } from 'igniteui-angular/chips';
import { FlatGridType, IgxGroupByAreaDirective, IgxGroupByMetaPipe, IgxGroupAreaDropDirective } from 'igniteui-angular/grids/core';
import { NgTemplateOutlet } from '@angular/common';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxDropDirective } from 'igniteui-angular/directives';
import { IGroupingExpression, ISortingExpression } from 'igniteui-angular/core';

/**
 * An internal component representing the group-by drop area for the igx-grid component.
 *
 * @hidden @internal
 */
@Component({
    selector: 'igx-grid-group-by-area',
    templateUrl: '../../../core/src/grouping/group-by-area.component.html',
    providers: [{ provide: IgxGroupByAreaDirective, useExisting: IgxGridGroupByAreaComponent }],
    imports: [IgxChipsAreaComponent, IgxChipComponent, IgxIconComponent, IgxSuffixDirective, IgxGroupAreaDropDirective, IgxDropDirective, NgTemplateOutlet, IgxGroupByMetaPipe]
})
export class IgxGridGroupByAreaComponent extends IgxGroupByAreaDirective {
    @Input()
    public sortingExpressions: ISortingExpression[] = [];

    /** The parent grid containing the component. */
    @Input()
    public override grid: FlatGridType;

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

