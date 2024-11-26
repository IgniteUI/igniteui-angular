import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import { NgIf, NgClass, NgStyle, NgTemplateOutlet, DecimalPipe, PercentPipe, CurrencyPipe, DatePipe } from '@angular/common';

import { HammerGesturesManager } from '../../core/touch';
import { IgxGridExpandableCellComponent } from '../grid/expandable-cell.component';
import { IgxTreeGridRow } from '../grid-public-row';
import { RowType } from '../common/grid.interface';
import { IgxGridCellImageAltPipe, IgxStringReplacePipe, IgxColumnFormatterPipe } from '../common/pipes';
import { IgxTooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { IgxTooltipTargetDirective } from '../../directives/tooltip/tooltip-target.directive';
import { IgxCircularProgressBarComponent } from '../../progressbar/progressbar.component';
import { IgxSuffixDirective } from '../../directives/suffix/suffix.directive';
import { IgxPrefixDirective } from '../../directives/prefix/prefix.directive';
import { IgxDateTimeEditorDirective } from '../../directives/date-time-editor/date-time-editor.directive';
import { IgxTimePickerComponent } from '../../time-picker/time-picker.component';
import { IgxDatePickerComponent } from '../../date-picker/date-picker.component';
import { IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { IgxFocusDirective } from '../../directives/focus/focus.directive';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxInputGroupComponent } from '../../input-group/input-group.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxTextHighlightDirective } from '../../directives/text-highlight/text-highlight.directive';
import { IgxChipComponent } from '../../chips/chip.component';
import { IgxTextSelectionDirective } from '../../directives/text-selection/text-selection.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid-cell',
    templateUrl: 'tree-cell.component.html',
    providers: [HammerGesturesManager],
    imports: [
        NgIf,
        NgClass,
        NgStyle,
        NgTemplateOutlet,
        DecimalPipe,
        PercentPipe,
        CurrencyPipe,
        DatePipe,
        IgxChipComponent,
        IgxTextHighlightDirective,
        IgxIconComponent,
        ReactiveFormsModule,
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxFocusDirective,
        IgxCheckboxComponent,
        IgxDatePickerComponent,
        IgxTimePickerComponent,
        IgxDateTimeEditorDirective,
        IgxPrefixDirective,
        IgxSuffixDirective,
        IgxCircularProgressBarComponent,
        IgxTooltipTargetDirective,
        IgxTooltipDirective,
        IgxGridCellImageAltPipe,
        IgxStringReplacePipe,
        IgxColumnFormatterPipe,
        IgxTextSelectionDirective
    ]
})
export class IgxTreeGridCellComponent extends IgxGridExpandableCellComponent {

    /**
     * @hidden
     */
    @Input()
    public level = 0;

    /**
     * @hidden
     */
    @Input()
    public showIndicator = false;

    /**
     * @hidden
     */
    @Input()
    public isLoading: boolean;

    /**
     * Gets the row of the cell.
     * ```typescript
     * let cellRow = this.cell.row;
     * ```
     *
     * @memberof IgxGridCellComponent
     */
    @Input()
    public override get row(): RowType {
        // TODO: Fix types
        return new IgxTreeGridRow(this.grid as any, this.intRow.index, this.intRow.data);
    }

    /**
     * @hidden
     */
    public override toggle(event: Event) {
        event.stopPropagation();
        this.grid.gridAPI.set_row_expansion_state(this.intRow.key, !this.intRow.expanded, event);
    }

    /**
     * @hidden
     */
    public onLoadingDblClick(event: Event) {
        event.stopPropagation();
    }
}
