import {
    Component,
    ElementRef,
    Input,
} from '@angular/core';
import { IChipsAreaReorderEventArgs } from '../../chips/public_api';
import { PlatformUtil } from '../../core/utils';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IgxGroupByAreaDirective } from './group-by-area.directive';

/**
 * An internal component representing the group-by drop area for the igx-grid component.
 *
 * @hidden @internal
 */
@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid-group-by-area',
    templateUrl: 'group-by-area.component.html',
    providers: [{ provide: IgxGroupByAreaDirective, useExisting: IgxTreeGridGroupByAreaComponent }]
})
export class IgxTreeGridGroupByAreaComponent extends IgxGroupByAreaDirective {
    @Input()
    public hideGroupedColumns: boolean;

    constructor(ref: ElementRef<HTMLElement>, platform: PlatformUtil) {
        super(ref, platform);
     }

    public handleReorder(event: IChipsAreaReorderEventArgs) {
        const { chipsArray, originalEvent } = event;
        const newExpressions = this.getReorderedExpressions(chipsArray);

        this.chipExpressions = newExpressions;

        // When reordered using keyboard navigation, we don't have `onMoveEnd` event.
        if (originalEvent instanceof KeyboardEvent) {
            this.expressions = newExpressions;
        }
    }

    public handleMoveEnd() {
        this.expressions = this.chipExpressions;
    }

    public groupBy(expression: IGroupingExpression) {
        this.expressions.push(expression);
        this.expressions = [...this.expressions];
    }

    public clearGrouping(name: string) {
        this.expressions = this.expressions.filter(item => item.fieldName !== name);
    }
}

