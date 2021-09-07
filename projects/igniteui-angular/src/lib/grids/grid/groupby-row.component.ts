import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    ViewChild,
    TemplateRef,
    OnDestroy
} from '@angular/core';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { DataType } from '../../data-operations/data-util';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxGridSelectionService, ISelectionNode } from '../selection/selection.service';
import { GridType } from '../common/grid.interface';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxGridComponent } from './grid.component';
import { GridSelectionMode } from '../common/enums';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-groupby-row',
    templateUrl: './groupby-row.component.html'
})
export class IgxGridGroupByRowComponent implements OnDestroy {
    /**
     * @hidden
     */
    @Input()
    public hideGroupRowSelectors: boolean;

    /**
     * @hidden
     */
    @Input()
    public rowDraggable: boolean;

    /**
     * An @Input property that sets the index of the row.
     * ```html
     * <igx-grid-groupby-row [gridID]="id" [index]="rowIndex" [groupRow]="rowData" #row></igx-grid-groupby-row>
     * ```
     */
    @Input()
    public index: number;

    /**
     * An @Input property that sets the id of the grid the row belongs to.
     * ```html
     * <igx-grid-groupby-row [gridID]="id" [index]="rowIndex" [groupRow]="rowData" #row></igx-grid-groupby-row>
     * ```
     */
    @Input()
    public gridID: string;

    /**
     * An @Input property that specifies the group record the component renders for.
     * ```typescript
     * <igx-grid-groupby-row [gridID]="id" [index]="rowIndex" [groupRow]="rowData" #row></igx-grid-groupby-row>
     * ```
     */
    @Input()
    public groupRow: IGroupByRecord;

    /**
     * Returns a reference of the content of the group.
     * ```typescript
     * const groupRowContent = this.grid1.rowList.first.groupContent;
     * ```
     */
    @ViewChild('groupContent', { static: true })
    public groupContent: ElementRef;

    /**
     * @hidden
     */
    @Input()
    protected isFocused = false;

    /**
     * @hidden
     */
    @ViewChild('defaultGroupByExpandedTemplate', { read: TemplateRef, static: true })
    protected defaultGroupByExpandedTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultGroupByCollapsedTemplate', { read: TemplateRef, static: true })
    protected defaultGroupByCollapsedTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    protected destroy$ = new Subject<any>();

    /**
     * @hidden
     */
    protected defaultCssClass = 'igx-grid__group-row';

    /**
     * @hidden
     */
    protected paddingIndentationCssClass = 'igx-grid__group-row--padding-level';

    /**
     * Returns whether the row is focused.
     * ```
     * let gridRowFocused = this.grid1.rowList.first.focused;
     * ```
     */
    get focused(): boolean {
        return this.isActive();
    }

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        public gridSelection: IgxGridSelectionService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef,
        public filteringService: IgxFilteringService) {
        this.gridSelection.selectedRowsChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.cdr.markForCheck();
        });
    }


    @HostListener('pointerdown')
    public activate() {
        this.grid.navigation.setActiveNode({ row: this.index });
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Returns whether the group row is expanded.
     * ```typescript
     * const groupRowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    @HostBinding('attr.aria-expanded')
    get expanded(): boolean {
        return this.grid.isExpandedGroup(this.groupRow);
    }

    /**
     * @hidden
     */
    @HostBinding('attr.aria-describedby')
    get describedBy(): string {
        const grRowExpr = this.groupRow.expression !== undefined ? this.groupRow.expression.fieldName : '';
        return this.gridID + '_' + grRowExpr;
    }

    @HostBinding('attr.data-rowIndex')
    get dataRowIndex() {
        return this.index;
    }

    /**
     * Returns a reference to the underlying HTML element.
     * ```typescript
     * const groupRowElement = this.nativeElement;
     * ```
     */
    get nativeElement(): any {
        return this.element.nativeElement;
    }

    @HostBinding('attr.id')
    public get attrCellID() {
        return `${this.gridID}_${this.index}`;
    }

    /**
     * Returns the style classes applied to the group rows.
     * ```typescript
     * const groupCssStyles = this.grid1.rowList.first.styleClasses;
     * ```
     */
    @HostBinding('class')
    get styleClasses(): string {
        return `${this.defaultCssClass} ` + `${this.paddingIndentationCssClass}-` + this.groupRow.level +
            (this.isActive() ? ` ${this.defaultCssClass}--active` : '');
    }

    public isActive() {
        return this.grid.navigation.activeNode ? this.grid.navigation.activeNode.row === this.index : false;
    }

    /**
     * @hidden @internal
     */
    getRowID(rowData): IgxGridRowComponent {
        return this.grid.primaryKey ? rowData[this.grid.primaryKey] : rowData;
    }

    /**
     * @hidden @internal
     */
    public onGroupSelectorClick(event) {
        if (!this.grid.isMultiRowSelectionEnabled) {
            return;
        }
        event.stopPropagation();
        if (this.areAllRowsInTheGroupSelected) {
            this.groupRow.records.forEach(row => {
                this.gridSelection.deselectRow(this.getRowID(row), event);
            });
        } else {
            this.groupRow.records.forEach(row => {
                this.gridSelection.selectRowById(this.getRowID(row), false, event);
            });
        }
    }

    /**
     * Toggles the group row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        this.grid.toggleGroup(this.groupRow);
    }

    public get iconTemplate() {
        if (this.expanded) {
            return this.grid.rowExpandedIndicatorTemplate || this.defaultGroupByExpandedTemplate;
        } else {
            return this.grid.rowCollapsedIndicatorTemplate || this.defaultGroupByCollapsedTemplate;
        }
    }

    protected get selectionNode(): ISelectionNode {
        return {
            row: this.index,
            column: this.gridSelection.activeElement ? this.gridSelection.activeElement.column : 0
        };
    }

    /**
     * Returns a reference to the `IgxGridComponent` the `IgxGridGroupByRowComponent` belongs to.
     * ```typescript
     * this.grid1.rowList.first.grid;
     * ```
     */
    get grid(): IgxGridComponent {
        return this.gridAPI.grid as IgxGridComponent;
    }

    /**
     * @hidden
     */
    get dataType(): any {
        const column = this.groupRow.column;
        return (column && column.dataType) || DataType.String;
    }

    /**
     * @hidden @internal
     */
    public get areAllRowsInTheGroupSelected(): boolean {
        return this.groupRow.records.every(x => this.gridSelection.isRowSelected(this.getRowID(x)));
    }

    /**
     * @hidden @internal
     */
    public get selectedRowsInTheGroup(): any[] {
        const selectedIds = this.gridSelection.filteredSelectedRowIds;
        return this.groupRow.records.filter(rowID => selectedIds.indexOf(this.getRowID(rowID)) > -1);
    }

    /**
     * @hidden @internal
     */
    public get groupByRowCheckboxIndeterminateState(): boolean {
        if (this.selectedRowsInTheGroup.length > 0) {
            return !this.areAllRowsInTheGroupSelected;
        }
        return false;
    }

    /**
     * @hidden @internal
     */
    public get groupByRowSelectorBaseAriaLabel(): string {
        const ariaLabel: string = this.areAllRowsInTheGroupSelected ?
            this.grid.resourceStrings.igx_grid_groupByArea_deselect_message : this.grid.resourceStrings.igx_grid_groupByArea_select_message;
        return ariaLabel.replace('{0}', this.groupRow.expression.fieldName).replace('{1}', this.groupRow.value);
    }

    /**
     * @hidden @internal
     */
    get showRowSelectors(): boolean {
        return this.grid.rowSelection !== GridSelectionMode.none && !this.hideGroupRowSelectors;
    }

}
