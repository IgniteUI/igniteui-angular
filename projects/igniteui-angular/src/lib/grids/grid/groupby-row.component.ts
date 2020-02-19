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
} from '@angular/core';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { DataType } from '../../data-operations/data-util';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxGridSelectionService, ISelectionNode } from '../selection/selection.service';
import { GridType } from '../common/grid.interface';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-groupby-row',
    templateUrl: './groupby-row.component.html'
})
export class IgxGridGroupByRowComponent {

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        private gridSelection: IgxGridSelectionService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     */
    protected defaultCssClass = 'igx-grid__group-row';

    /**
     * @hidden
     */
    protected paddingIndentationCssClass = 'igx-grid__group-row--padding-level';

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
    @Input()
    protected isFocused = false;

    /**
     * Returns whether the row is focused.
     * ```
     * let gridRowFocused = this.grid1.rowList.first.focused;
     * ```
     */
    get focused(): boolean {
        return this.isActive();
    }

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


    @HostListener('click')
    public activate() {
        this.grid.navigation.activeNode ? this.grid.navigation.activeNode.row = this.index :
            this.grid.navigation.activeNode = {row: this.index};
    }

    /**
     * Toggles the group row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        const isVirtualized = !this.grid.verticalScrollContainer.dc.instance.notVirtual;
        const groupRowIndex = this.index;
        this.grid.toggleGroup(this.groupRow);
        if (isVirtualized) {
            const groupRow = this.grid.nativeElement.querySelector(`[data-rowIndex="${groupRowIndex}"]`);
            if (groupRow) {
                groupRow.focus();
            }
        }
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
    get grid(): any {
        return this.gridAPI.grid;
    }

    /**
     * @hidden
     */
    get dataType(): any {
        const column = this.grid.getColumnByName(this.groupRow.expression.fieldName);
        return (column && column.dataType) || DataType.String;
    }
}
