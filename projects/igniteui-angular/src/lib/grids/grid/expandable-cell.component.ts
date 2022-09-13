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
    ViewChild
} from '@angular/core';
import { IgxGridCellComponent } from '../cell.component';
import { PlatformUtil } from '../../core/utils';
import { DOCUMENT } from '@angular/common';
import { IgxGridSelectionService } from '../selection/selection.service';
import { HammerGesturesManager } from '../../core/touch';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { IgxOverlayService } from '../../services/public_api';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-expandable-grid-cell',
    templateUrl: 'expandable-cell.component.html',
    providers: [HammerGesturesManager]
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
                @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
                cdr: ChangeDetectorRef,
                element: ElementRef,
                protected zone: NgZone,
                touchManager: HammerGesturesManager,
                @Inject(DOCUMENT) public document,
                protected platformUtil: PlatformUtil) {
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
    public calculateSizeToFit(range: any): number {
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
