import {
    Component, Input, ViewChild, ChangeDetectorRef, AfterViewInit, OnDestroy, HostBinding
} from '@angular/core';
import { VerticalAlignment, HorizontalAlignment, OverlaySettings } from '../../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../../services/overlay/position/connected-positioning-strategy';
import { IgxOverlayService } from '../../../services/overlay/overlay';
import { IDragStartEventArgs } from '../../../directives/drag-drop/drag-drop.directive';
import { CloseScrollStrategy } from '../../../services/overlay/scroll/close-scroll-strategy';
import { IgxOverlayOutletDirective } from '../../../directives/toggle/toggle.directive';
import { Subject, Subscription } from 'rxjs';
import { AbsoluteScrollStrategy } from '../../../services/public_api';
import { IActiveNode } from '../../grid-navigation.service';
import { PlatformUtil } from '../../../core/utils';
import { FieldType, GridType } from '../../common/grid.interface';
import { DisplayDensity } from '../../../core/displayDensity';
import { IgxQueryBuilderComponent } from '../../../query-builder/query-builder.component';

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
export class IgxAdvancedFilteringDialogComponent implements AfterViewInit, OnDestroy {
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
    @ViewChild('overlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    protected overlayOutlet: IgxOverlayOutletDirective;

    /**
     * @hidden @internal
     */
    public inline = true;    

    /**
     * @hidden @internal
     */
    public lastActiveNode = {} as IActiveNode;

    /**
     * @hidden @internal
     */
    public columnSelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: false
    };

    /**
     * @hidden @internal
     */
    public conditionSelectOverlaySettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: false
    };

    private destroy$ = new Subject<any>();
    private _overlayComponentId: string;
    private _overlayService: IgxOverlayService;    
    private _grid: GridType;
    private _filteringChange: Subscription;

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalStartPoint: VerticalAlignment.Top
    };
    private _overlaySettings: OverlaySettings = {
        closeOnOutsideClick: false,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
        scrollStrategy: new CloseScrollStrategy()
    };

    constructor(public cdr: ChangeDetectorRef, protected platform: PlatformUtil) { }

    /**
     * @hidden @internal
     */
    public ngAfterViewInit(): void {
        this._overlaySettings.outlet = this.overlayOutlet;
        this.columnSelectOverlaySettings.outlet = this.overlayOutlet;
        this.conditionSelectOverlaySettings.outlet = this.overlayOutlet;        
        this.queryBuilder.fields = this.filterableFields;
        this.queryBuilder.expressionTree = this.grid.advancedFilteringExpressionsTree;
    }

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

        if (this._filteringChange) {
            this._filteringChange.unsubscribe();
        }

        if (this._grid) {
            this._grid.filteringService.registerSVGIcons();

            //TODO Clear query builder edit state
            // this._filteringChange = this._grid.advancedFilteringExpressionsTreeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            //     this.init();
            // });

            // this.init();
        }
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

        // if (!this.contextMenuToggle.collapsed) {
        //     this.contextMenuToggle.element.style.display = 'none';
        // }
    }

    /**
     * @hidden @internal
     */
    public dragEnd() {
        // if (!this.contextMenuToggle.collapsed) {
        //     this.calculateContextMenuTarget();
        //     this.contextMenuToggle.reposition();
        //     this.contextMenuToggle.element.style.display = '';
        // }
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
    public onOutletPointerDown(event) {
        // This prevents closing the select's dropdown when clicking the scroll
        event.preventDefault();
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
        this.queryBuilder.rootGroup = this.grid.advancedFilteringExpressionsTree = null;
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
        //this.exitOperandEdit();
        //TODO set grid expressionsTree
        //this.grid.advancedFilteringExpressionsTree = this.createExpressionsTreeFromGroupItem(this.rootGroup);
        this.grid.advancedFilteringExpressionsTree = this.queryBuilder.createExpressionsTreeFromGroupItem(this.queryBuilder.rootGroup);
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
}
