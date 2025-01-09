import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    forwardRef,
    ElementRef,
    ViewChildren,
    QueryList,
    ViewChild,
    TemplateRef
} from '@angular/core';
import { IgxRowDirective } from '../row.directive';
import { IgxHierarchicalGridCellComponent } from './hierarchical-cell.component';
import { GridType } from '../common/grid.interface';
import { IgxGridNotGroupedPipe, IgxGridCellStylesPipe, IgxGridCellStyleClassesPipe, IgxGridDataMapperPipe, IgxGridTransactionStatePipe } from '../common/pipes';
import { IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { IgxRowDragDirective } from '../row-drag.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { NgTemplateOutlet, NgIf, NgClass, NgStyle, NgFor } from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-hierarchical-grid-row',
    templateUrl: './hierarchical-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxHierarchicalRowComponent) }],
    imports: [NgTemplateOutlet, IgxIconComponent, NgIf, IgxRowDragDirective, NgClass, IgxGridForOfDirective, IgxHierarchicalGridCellComponent, NgStyle, IgxCheckboxComponent, NgFor, IgxGridNotGroupedPipe, IgxGridCellStylesPipe, IgxGridCellStyleClassesPipe, IgxGridDataMapperPipe, IgxGridTransactionStatePipe]
})
export class IgxHierarchicalRowComponent extends IgxRowDirective {
    @ViewChild('expander', { read: ElementRef })
    public expander: ElementRef<HTMLElement>;

    @ViewChildren(forwardRef(() => IgxHierarchicalGridCellComponent), { read: IgxHierarchicalGridCellComponent })
    protected override _cells: QueryList<IgxHierarchicalGridCellComponent>;

    /**
     * @hidden
     */
    @ViewChild('defaultExpandedTemplate', { read: TemplateRef, static: true })
    protected defaultExpandedTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultEmptyTemplate', { read: TemplateRef, static: true })
    protected defaultEmptyTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultCollapsedTemplate', { read: TemplateRef, static: true })
    protected defaultCollapsedTemplate: TemplateRef<any>;

    protected expanderClass = 'igx-grid__hierarchical-expander';
    protected rolActionClass = 'igx-grid__tr-action';

    /**
     * @hidden
     */
    public get expanderClassResolved() {
        return {
            [`${this.expanderClass} ${this.rolActionClass}`]: !this.pinned || this.disabled,
            [`${this.expanderClass}--empty`]: this.pinned && !this.disabled
        };
    }

    public override get viewIndex(): number {
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * Returns whether the row is expanded.
     * ```typescript
     * const RowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    public override get expanded() {
        return this.grid.gridAPI.get_row_expansion_state(this.data);
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-grid__tr--expanded')
    public get expandedClass() {
        return this.expanded && !this.pinned;
    }

    public override get hasChildren() {
        return !!this.grid.childLayoutKeys.length;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-grid__tr--highlighted')
    public get highlighted() {
        return this.grid && this.grid.highlightedRowID === this.key;
    }

    /**
     * @hidden
     */
    public expanderClick(event) {
        event.stopPropagation();
        this.toggle();
    }

    /**
     * Toggles the hierarchical row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        if (this.added) {
            return;
        }
        // K.D. 28 Feb, 2022 #10634 Don't trigger endEdit/commit upon row expansion state change
        // this.endEdit(this.grid.rootGrid);
        this.grid.gridAPI.set_row_expansion_state(this.key, !this.expanded);
        this.grid.cdr.detectChanges();
    }

    /**
     * @hidden
     * @internal
     */
    public select = () => {
        this.grid.selectRows([this.key]);
    };

    /**
     * @hidden
     * @internal
     */
    public deselect = () => {
        this.grid.deselectRows([this.key]);
    };

    /**
     * @hidden
     */
    public get iconTemplate() {
        let expandable = true;
        if (this.grid.hasChildrenKey) {
            expandable = this.data[this.grid.hasChildrenKey];
        }
        if (!expandable || (this.pinned && !this.disabled)) {
            return this.defaultEmptyTemplate;
        }
        if (this.expanded) {
            return this.grid.rowExpandedIndicatorTemplate || this.defaultExpandedTemplate;
        } else {
            return this.grid.rowCollapsedIndicatorTemplate || this.defaultCollapsedTemplate;
        }
    }

    // TODO: consider moving into CRUD
    protected endEdit(grid: GridType) {
        if (grid.gridAPI.crudService.cellInEditMode) {
            grid.gridAPI.crudService.endEdit();
        }
        grid.gridAPI.getChildGrids(true).forEach(g => {
            if (g.gridAPI.crudService.cellInEditMode) {
                g.gridAPI.crudService.endEdit();
            }
        });
    }
}
