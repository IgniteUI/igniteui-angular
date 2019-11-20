import { Component, ChangeDetectorRef, ElementRef, ViewChild, Inject,
     ChangeDetectionStrategy, NgZone, OnInit, Input, TemplateRef } from '@angular/core';
import { IgxGridCellComponent } from '../cell.component';
import { GridBaseAPIService } from '../api.service';
import { getNodeSizeViaRange, PlatformUtil } from '../../core/utils';
import { DOCUMENT } from '@angular/common';
import { IgxGridBaseDirective } from '.';
import { IgxGridSelectionService, IgxGridCRUDService } from '../selection/selection.service';
import { HammerGesturesManager } from '../../core/touch';
import { GridType } from '../common/grid.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-expandable-grid-cell',
    templateUrl: 'expandable-cell.component.html',
    providers: [HammerGesturesManager]
})
export class IgxGridExpandableCellComponent extends IgxGridCellComponent implements OnInit {

    constructor(
                selectionService: IgxGridSelectionService,
                crudService: IgxGridCRUDService,
                gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
                cdr: ChangeDetectorRef,
                element: ElementRef,
                protected zone: NgZone,
                touchManager: HammerGesturesManager,
                @Inject(DOCUMENT) public document,
                protected platformUtil: PlatformUtil) {
        super(selectionService, crudService, gridAPI, cdr, element, zone, touchManager, platformUtil);
    }

    /**
     * @hidden
    */
    @Input()
    expanded = false;

    @ViewChild('indicator', { read: ElementRef })
    public indicator: ElementRef;

    @ViewChild('indentationDiv', { read: ElementRef })
    public indentationDiv: ElementRef;

    @ViewChild('defaultContentElement', { read: ElementRef })
    public defaultContentElement: ElementRef;

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
        const expandedStates = this.grid.expansionStates;
        expandedStates.set(this.row.rowID, !this.row.expanded);
        this.grid.expansionStates = expandedStates;

        if (this.grid.rowEditable) {
            this.grid.endEdit(true);
        }
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
}
