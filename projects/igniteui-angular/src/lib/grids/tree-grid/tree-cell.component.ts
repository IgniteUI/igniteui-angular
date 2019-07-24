import { Component, ChangeDetectorRef, ElementRef, ViewChild, Inject, ChangeDetectionStrategy, NgZone, OnInit, Input } from '@angular/core';
import { IgxGridCellComponent } from '../cell.component';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { getNodeSizeViaRange } from '../../core/utils';
import { DOCUMENT } from '@angular/common';
import { IgxGridBaseComponent, IGridDataBindable } from '../grid';
import { IgxGridSelectionService, IgxGridCRUDService } from '../../core/grid-selection';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid-cell',
    templateUrl: 'tree-cell.component.html'
})
export class IgxTreeGridCellComponent extends IgxGridCellComponent implements OnInit {
    private treeGridAPI: IgxTreeGridAPIService;

    constructor(
                selectionService: IgxGridSelectionService,
                crudService: IgxGridCRUDService,
                gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
                cdr: ChangeDetectorRef,
                element: ElementRef,
                protected zone: NgZone,
                @Inject(DOCUMENT) public document) {
        super(selectionService, crudService, gridAPI, cdr, element, zone);
        this.treeGridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    /**
     * @hidden
     */
    @Input()
    expanded = false;

    /**
     * @hidden
     */
    @Input()
    level = 0;

    /**
     * @hidden
     */
    @Input()
    showIndicator = false;

    @ViewChild('indicator', { read: ElementRef, static: false })
    public indicator: ElementRef;

    @ViewChild('indentationDiv', { read: ElementRef, static: false })
    public indentationDiv: ElementRef;

    @ViewChild('defaultContentElement', { read: ElementRef, static: false })
    public defaultContentElement: ElementRef;

    /**
     * @hidden
     */
    @Input()
    public isLoading: boolean;

    /**
     * @hidden
     */
    ngOnInit() {
        super.ngOnInit();
    }

    /**
     * @hidden
     */
    public toggle(event: Event) {
        event.stopPropagation();
        this.treeGridAPI.trigger_row_expansion_toggle(this.row.treeRow, !this.row.expanded, event, this.visibleColumnIndex);
    }

    /**
     * @hidden
     */
    public onIndicatorFocus() {
        this.gridAPI.submit_value();
        this.nativeElement.focus();
    }

    /**
     * @hidden
     */
    public onLoadingDblClick(event: Event) {
        event.stopPropagation();
    }

    /**
     * @hidden
     */
    public calculateSizeToFit(range: any): number {
        const indicatorWidth = this.indicator.nativeElement.getBoundingClientRect().width;
        const indicatorStyle = this.document.defaultView.getComputedStyle(this.indicator.nativeElement);
        const indicatorMargin = parseFloat(indicatorStyle.marginRight);
        let leftPadding = 0;
        if (this.indentationDiv) {
            const indentationStyle = this.document.defaultView.getComputedStyle(this.indentationDiv.nativeElement);
            leftPadding = parseFloat(indentationStyle.paddingLeft);
        }
        const largestWidth = Math.max(...Array.from(this.nativeElement.children)
            .map((child) => getNodeSizeViaRange(range, child)));
        return largestWidth + indicatorWidth + indicatorMargin + leftPadding;
    }
}
