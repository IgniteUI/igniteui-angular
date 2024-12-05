import {
    Component,
    ElementRef,
    Input,
} from '@angular/core';
import { IChipsAreaReorderEventArgs } from '../../chips/public_api';
import { PlatformUtil } from '../../core/utils';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { ISortingExpression } from '../../data-operations/sorting-strategy';
import { FlatGridType } from '../common/grid.interface';
import { IgxGroupByAreaDirective, IgxGroupByMetaPipe } from './group-by-area.directive';
import { IgxDropDirective } from '../../directives/drag-drop/drag-drop.directive';
import { IgxGroupAreaDropDirective } from '../grid.directives';
import { IgxSuffixDirective } from '../../directives/suffix/suffix.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxChipComponent } from '../../chips/chip.component';
import { NgFor, NgTemplateOutlet } from '@angular/common';
import { IgxChipsAreaComponent } from '../../chips/chips-area.component';

/**
 * An internal component representing the group-by drop area for the igx-grid component.
 *
 * @hidden @internal
 */
@Component({
    selector: 'igx-grid-group-by-area',
    templateUrl: 'group-by-area.component.html',
    providers: [{ provide: IgxGroupByAreaDirective, useExisting: IgxGridGroupByAreaComponent }],
    imports: [IgxChipsAreaComponent, NgFor, IgxChipComponent, IgxIconComponent, IgxSuffixDirective, IgxGroupAreaDropDirective, IgxDropDirective, NgTemplateOutlet, IgxGroupByMetaPipe]
})
export class IgxGridGroupByAreaComponent extends IgxGroupByAreaDirective {
    @Input()
    public sortingExpressions: ISortingExpression[] = [];

    /** The parent grid containing the component. */
    @Input()
    public override grid: FlatGridType;

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

