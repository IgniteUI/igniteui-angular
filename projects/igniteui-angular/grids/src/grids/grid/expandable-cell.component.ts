import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Input,
    NgZone,
    OnInit,
    TemplateRef,
    ViewChild,
    DOCUMENT
} from '@angular/core';
import { IgxGridCellComponent } from '../cell.component';
import { NgClass, NgTemplateOutlet, DecimalPipe, PercentPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { IgxGridSelectionService } from '../selection/selection.service';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { HammerGesturesManager, IgxOverlayService, PlatformUtil } from 'igniteui-angular/core';
import { IgxGridCellImageAltPipe, IgxStringReplacePipe, IgxColumnFormatterPipe } from '../common/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxChipComponent } from 'igniteui-angular/chips';
import { IgxDateTimeEditorDirective, IgxFocusDirective, IgxTextHighlightDirective, IgxTooltipDirective, IgxTooltipTargetDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxInputDirective, IgxInputGroupComponent, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';
import { IgxTimePickerComponent } from 'igniteui-angular/time-picker';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-expandable-grid-cell',
    templateUrl: 'expandable-cell.component.html',
    providers: [HammerGesturesManager],
    imports: [IgxChipComponent, IgxTextHighlightDirective, IgxIconComponent, NgClass, FormsModule, ReactiveFormsModule, IgxInputGroupComponent, IgxInputDirective, IgxFocusDirective, IgxCheckboxComponent, IgxDatePickerComponent, IgxTimePickerComponent, IgxDateTimeEditorDirective, IgxPrefixDirective, IgxSuffixDirective, NgTemplateOutlet, IgxTooltipTargetDirective, IgxTooltipDirective, IgxGridCellImageAltPipe, IgxStringReplacePipe, IgxColumnFormatterPipe, DecimalPipe, PercentPipe, CurrencyPipe, DatePipe]
})
export class IgxGridExpandableCellComponent extends IgxGridCellComponent implements OnInit {
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

    constructor(selectionService: IgxGridSelectionService,
                @Inject(IGX_GRID_BASE) grid: GridType,
                @Inject(IgxOverlayService) overlayService: IgxOverlayService,
                cdr: ChangeDetectorRef,
                element: ElementRef,
                zone: NgZone,
                touchManager: HammerGesturesManager,
                @Inject(DOCUMENT) public document,
                platformUtil: PlatformUtil) {
        super(selectionService, grid, overlayService, cdr, element, zone, touchManager, platformUtil);
    }

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
