import { Component, ChangeDetectorRef, ElementRef, ViewChild, Inject } from '@angular/core';
import { IgxGridCellComponent } from '../cell.component';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxSelectionAPIService } from '../../core/selection';
import { getNodeSizeViaRange } from '../../core/utils';
import { DOCUMENT } from '@angular/common';
import { IgxGridBaseComponent } from '../grid';

@Component({
    selector: 'igx-tree-grid-cell',
    templateUrl: 'tree-cell.component.html'
})
export class IgxTreeGridCellComponent extends IgxGridCellComponent {
    private treeGridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
                selection: IgxSelectionAPIService,
                cdr: ChangeDetectorRef,
                element: ElementRef,
                @Inject(DOCUMENT) public document) {
        super(gridAPI, selection, cdr, element);
        this.treeGridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    @ViewChild('indicator', { read: ElementRef })
    public indicator: ElementRef;

    @ViewChild('indentationDiv', { read: ElementRef })
    public indentationDiv: ElementRef;

    /**
     * @hidden
     */
    protected resolveStyleClasses(): string {
        return super.resolveStyleClasses() + ' igx-grid__td--tree-cell';
    }

    /**
     * @hidden
     */
    public get indentation() {
        return this.row.treeRow.level;
    }

    /**
     * @hidden
     */
    public get hasChildren() {
        return this.row.treeRow.children && this.row.treeRow.children.length > 0;
    }

    /**
     * @hidden
     */
    get expanded(): boolean {
        return this.row.expanded;
    }

    /**
     * @hidden
     */
    public toggle(event: Event) {
        event.stopPropagation();
        this.treeGridAPI.trigger_row_expansion_toggle(this.gridID, this.row.treeRow, !this.row.expanded, event, this.visibleColumnIndex);
    }

    /**
     * @hidden
     */
    public onIndicatorFocus() {
        this.gridAPI.submit_value(this.gridID);
        this.nativeElement.focus();
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
