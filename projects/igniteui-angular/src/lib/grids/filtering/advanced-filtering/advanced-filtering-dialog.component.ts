import {
    Component, Input, ViewChild, ChangeDetectorRef, AfterViewInit, OnDestroy, HostBinding
} from '@angular/core';
import { IgxOverlayService } from '../../../services/overlay/overlay';
import { IDragStartEventArgs } from '../../../directives/drag-drop/drag-drop.directive';
import { Subject } from 'rxjs';
import { IActiveNode } from '../../grid-navigation.service';
import { PlatformUtil } from '../../../core/utils';
import { FieldType, GridType } from '../../common/grid.interface';
import { DisplayDensity } from '../../../core/displayDensity';
import { IgxQueryBuilderComponent } from '../../../query-builder/query-builder.component';
import { CurrentResourceStrings } from '../../../core/i18n/resources';
import { GridResourceStringsEN } from '../../../core/i18n/grid-resources';

/**
 * A component used for presenting advanced filtering UI for a Grid.
 * It is used internally in the Grid, but could also be hosted in a container outside of it.
 *
 * Example:
 * ```html
 * <igx-advanced-filtering-dialog
 *     [grid]="grid1">
 * </igx-advanced-filtering-dialog>
 * ```
 */
@Component({
    selector: 'igx-advanced-filtering-dialog',
    templateUrl: './advanced-filtering-dialog.component.html'
})
export class IgxAdvancedFilteringDialogComponent implements OnDestroy {
    /**
     * @hidden @internal
     */
    @ViewChild('queryBuilder', { read: IgxQueryBuilderComponent })
    public queryBuilder: IgxQueryBuilderComponent;

    /**
     * @hidden @internal
     */
    @HostBinding('style.display')
    public display = 'block';

    /**
     * @hidden @internal
     */
    public inline = true;

    /**
     * @hidden @internal
     */
    public lastActiveNode = {} as IActiveNode;

    private destroy$ = new Subject<any>();
    private _overlayComponentId: string;
    private _overlayService: IgxOverlayService;
    private _grid: GridType;

    constructor(public cdr: ChangeDetectorRef, protected platform: PlatformUtil) { }

    /**
     * @hidden @internal
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden @internal
     */
    public get displayDensity(): DisplayDensity {
        return this.grid.displayDensity;
    }

    /**
     * An @Input property that sets the grid.
     */
    @Input()
    public set grid(grid: GridType) {
        this._grid = grid;

        if (this._grid) {
            this._grid.filteringService.registerSVGIcons();
        }

        this.assignResourceStrings();
    }

    /**
     * Returns the grid.
     */
    public get grid(): GridType {
        return this._grid;
    }

    /**
     * @hidden @internal
     */
    public get filterableFields(): FieldType[] {
        return this.grid.columns.filter((column) => !column.columnGroup && column.filterable)
    }

    /**
     * @hidden @internal
     */
    public dragStart(dragArgs: IDragStartEventArgs) {
        if (!this._overlayComponentId) {
            dragArgs.cancel = true;
            return;
        }
    }

    /**
     * @hidden @internal
     */
    public onDragMove(e) {
        const deltaX = e.nextPageX - e.pageX;
        const deltaY = e.nextPageY - e.pageY;
        e.cancel = true;
        this._overlayService.setOffset(this._overlayComponentId, deltaX, deltaY);
    }

    /**
     * @hidden @internal
     */
    public onKeyDown(eventArgs: KeyboardEvent) {
        eventArgs.stopPropagation();
        const key = eventArgs.key;
        if (this.queryBuilder.isContextMenuVisible && (key === this.platform.KEYMAP.ESCAPE)) {
            this.queryBuilder.clearSelection();
        } else if (key === this.platform.KEYMAP.ESCAPE) {
            this.closeDialog();
        }
    }

    /**
     * @hidden @internal
     */
    public initialize(grid: GridType, overlayService: IgxOverlayService,
        overlayComponentId: string) {
        this.inline = false;
        this.grid = grid;
        this._overlayService = overlayService;
        this._overlayComponentId = overlayComponentId;
    }

    /**
     * @hidden @internal
     */
    public onClearButtonClick(event?: Event) {
        this.grid.crudService.endEdit(false, event);
        this.queryBuilder.expressionTree = this.grid.advancedFilteringExpressionsTree = null;
    }

    /**
     * @hidden @internal
     */
    public closeDialog() {
        if (this._overlayComponentId) {
            this._overlayService.hide(this._overlayComponentId);
        }
        this.grid.navigation.activeNode = this.lastActiveNode;
        if (this.grid.navigation.activeNode && this.grid.navigation.activeNode.row === -1) {
            (this.grid as any).theadRow.nativeElement.focus();
        }
    }

    /**
     * @hidden @internal
     */
    public applyChanges(event?: Event) {
        this.grid.crudService.endEdit(false, event);
        this.grid.advancedFilteringExpressionsTree = this.queryBuilder.createExpressionTreeFromGroupItem(this.queryBuilder.rootGroup);
    }

    /**
     * @hidden @internal
     */
    public cancelChanges() {
        this.closeDialog();
    }

    /**
     * @hidden @internal
     */
    public onApplyButtonClick(event?: Event) {
        this.applyChanges(event);
        this.closeDialog();
    }

    private assignResourceStrings() {
        // If grid has custom resource strings set for the advanced filtering,
        // they are passed to the query builder resource strings.
        const gridRS = this.grid.resourceStrings;

        if (gridRS !== GridResourceStringsEN) {
            const queryBuilderRS = CurrentResourceStrings.QueryBuilderResStrings;
            Object.keys(gridRS).forEach((prop) => {
                const reg = /^igx_grid_(advanced_)?filter_(row_)?/;
                if (!reg.test(prop)) {
                    return;
                }
                const affix = prop.replace(reg, '');
                const filterProp = `igx_query_builder_filter_${affix}`;
                const generalProp = `igx_query_builder_${affix}`
                if (queryBuilderRS[filterProp] !== undefined) {
                    queryBuilderRS[filterProp] = gridRS[prop];
                } else if (queryBuilderRS[generalProp] !== undefined) {
                    queryBuilderRS[generalProp] = gridRS[prop];
                }
            });
        }
    }
}
