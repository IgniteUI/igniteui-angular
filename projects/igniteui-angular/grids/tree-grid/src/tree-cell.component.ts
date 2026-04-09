import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';

import { IgxTreeGridRow } from 'igniteui-angular/grids/core';
import { RowType } from 'igniteui-angular/grids/core';
import { IgxGridCellImageAltPipe, IgxStringReplacePipe, IgxColumnFormatterPipe } from 'igniteui-angular/grids/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HammerGesturesManager, IgxNumberFormatterPipe, IgxPercentFormatterPipe, IgxCurrencyFormatterPipe, IgxDateFormatterPipe } from 'igniteui-angular/core';
import { IgxChipComponent } from 'igniteui-angular/chips';
import { IgxDateTimeEditorDirective, IgxFocusDirective, IgxTextHighlightDirective, IgxTextSelectionDirective, IgxTooltipDirective, IgxTooltipTargetDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxInputDirective, IgxInputGroupComponent, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';
import { IgxTimePickerComponent } from 'igniteui-angular/time-picker';
import { IgxCircularProgressBarComponent } from 'igniteui-angular/progressbar';
import { IgxGridExpandableCellComponent } from 'igniteui-angular/grids/grid';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid-cell',
    templateUrl: 'tree-cell.component.html',
    providers: [HammerGesturesManager],
    imports: [
        NgClass,
        NgStyle,
        NgTemplateOutlet,
        IgxNumberFormatterPipe,
        IgxPercentFormatterPipe,
        IgxCurrencyFormatterPipe,
        IgxDateFormatterPipe,
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
