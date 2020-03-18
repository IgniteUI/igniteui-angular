import { Component, ChangeDetectorRef, ElementRef, ViewChild, Inject,
     ChangeDetectionStrategy, NgZone, OnInit, Input, TemplateRef } from '@angular/core';
import { IgxGridCellComponent } from '../cell.component';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { getNodeSizeViaRange, PlatformUtil } from '../../core/utils';
import { DOCUMENT } from '@angular/common';
import { IgxGridBaseDirective } from '../grid';
import { IgxGridSelectionService, IgxGridCRUDService } from '../selection/selection.service';
import { HammerGesturesManager } from '../../core/touch';
import { GridType } from '../common/grid.interface';
import { IgxGridExpandableCellComponent } from '../grid/expandable-cell.component';
import { IgxChipComponent } from '../../chips';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid-cell',
    templateUrl: 'tree-cell.component.html',
    providers: [HammerGesturesManager]
})
export class IgxTreeGridCellComponent extends IgxGridExpandableCellComponent {
    private treeGridAPI: IgxTreeGridAPIService;

    @ViewChild('pinnedIndicator') 
    public pinnedIndicator: IgxChipComponent;

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
        super(selectionService, crudService, gridAPI, cdr, element, zone, touchManager, document, platformUtil);
        this.treeGridAPI = <IgxTreeGridAPIService>gridAPI;
    }

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


    /**
     * @hidden
     */
    @Input()
    public isLoading: boolean;

    /**
     * @hidden
     */
    public toggle(event: Event) {
        event.stopPropagation();
        this.treeGridAPI.set_row_expansion_state(this.row.rowID, !this.row.expanded, event);
    }

    /**
     * @hidden
     */
    public onLoadingDblClick(event: Event) {
        event.stopPropagation();
    }
}
