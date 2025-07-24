import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild, DOCUMENT, inject } from '@angular/core';
import { IgxGridCellComponent } from '../cell.component';
import { NgClass, NgTemplateOutlet, DecimalPipe, PercentPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { HammerGesturesManager } from '../../core/touch';
import { IgxGridCellImageAltPipe, IgxStringReplacePipe, IgxColumnFormatterPipe } from '../common/pipes';
import { IgxTooltipDirective } from '../../directives/tooltip/tooltip.directive';
import { IgxTooltipTargetDirective } from '../../directives/tooltip/tooltip-target.directive';
import { IgxSuffixDirective } from '../../directives/suffix/suffix.directive';
import { IgxPrefixDirective } from '../../directives/prefix/prefix.directive';
import { IgxDateTimeEditorDirective } from '../../directives/date-time-editor/date-time-editor.directive';
import { IgxTimePickerComponent } from '../../time-picker/time-picker.component';
import { IgxDatePickerComponent } from '../../date-picker/date-picker.component';
import { IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { IgxFocusDirective } from '../../directives/focus/focus.directive';
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxInputGroupComponent } from '../../input-group/input-group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxTextHighlightDirective } from '../../directives/text-highlight/text-highlight.directive';
import { IgxChipComponent } from '../../chips/chip.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-expandable-grid-cell',
    templateUrl: 'expandable-cell.component.html',
    providers: [HammerGesturesManager],
    imports: [IgxChipComponent, IgxTextHighlightDirective, IgxIconComponent, NgClass, FormsModule, ReactiveFormsModule, IgxInputGroupComponent, IgxInputDirective, IgxFocusDirective, IgxCheckboxComponent, IgxDatePickerComponent, IgxTimePickerComponent, IgxDateTimeEditorDirective, IgxPrefixDirective, IgxSuffixDirective, NgTemplateOutlet, IgxTooltipTargetDirective, IgxTooltipDirective, IgxGridCellImageAltPipe, IgxStringReplacePipe, IgxColumnFormatterPipe, DecimalPipe, PercentPipe, CurrencyPipe, DatePipe]
})
export class IgxGridExpandableCellComponent extends IgxGridCellComponent implements OnInit {
    public document = inject(DOCUMENT);

    /**
     * @hidden
     */
    @Input()
    public expanded = false;

    @ViewChild('indicator', { read: ElementRef })
    public indicator: ElementRef;

    @ViewChild('indentationDiv', { read: ElementRef })
    public indentationDiv: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('defaultExpandedTemplate', { read: TemplateRef, static: true })
    protected defaultExpandedTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultCollapsedTemplate', { read: TemplateRef, static: true })
    protected defaultCollapsedTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    public toggle(event: Event) {
        event.stopPropagation();
        const expansionState = this.grid.gridAPI.get_row_expansion_state(this.intRow.data);
        this.grid.gridAPI.set_row_expansion_state(this.intRow.key, !expansionState, event);
    }

    /**
     * @hidden
     */
    public onIndicatorFocus() {
        this.grid.gridAPI.update_cell(this.grid.crudService.cell);
    }

    /**
     * @hidden
     */
    public override calculateSizeToFit(range: any): number {
        let leftPadding = 0;
        if (this.indentationDiv) {
            const indentationStyle = this.document.defaultView.getComputedStyle(this.indentationDiv.nativeElement);
            leftPadding = parseFloat(indentationStyle.paddingLeft);
        }
        const contentWidth = this.platformUtil.getNodeSizeViaRange(range, this.nativeElement);
        return contentWidth + leftPadding;
    }

    /**
     * @hidden
     */
    public get iconTemplate() {
        if (this.expanded) {
            return this.grid.rowExpandedIndicatorTemplate || this.defaultExpandedTemplate;
        } else {
            return this.grid.rowCollapsedIndicatorTemplate || this.defaultCollapsedTemplate;
        }
    }

    /**
     * @hidden
     */
    public get showExpanderIndicator() {
        const isGhost = this.intRow.pinned && this.intRow.disabled;
        return !this.editMode && (!this.intRow.pinned || isGhost);
    }
}
