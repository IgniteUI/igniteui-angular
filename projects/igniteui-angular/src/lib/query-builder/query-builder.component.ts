import { AfterViewInit, ContentChild, EventEmitter, Output } from '@angular/core';
import { NgIf} from '@angular/common';
import {
    Component, Input, ViewChild, ElementRef, OnDestroy, HostBinding
} from '@angular/core';
import { Subject } from 'rxjs';
import { IQueryBuilderResourceStrings, QueryBuilderResourceStringsEN } from '../core/i18n/query-builder-resources';
import { IExpressionTree } from '../data-operations/filtering-expressions-tree';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { EntityType } from '../grids/common/grid.interface';
import { IgxQueryBuilderHeaderComponent } from './query-builder-header.component';
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { IgxQueryBuilderTreeComponent } from './query-builder-tree.component';

/**
 * A component used for operating with complex filters by creating or editing conditions
 * and grouping them using AND/OR logic.
 * It is used internally in the Advanced Filtering of the Grid.
 *
 * @example
 * ```html
 * <igx-query-builder [fields]="this.fields">
 * </igx-query-builder>
 * ```
 */
@Component({
    selector: 'igx-query-builder',
    templateUrl: './query-builder.component.html',
    standalone: true,
    imports: [NgIf, IgxQueryBuilderHeaderComponent, IgxQueryBuilderTreeComponent]
})
export class IgxQueryBuilderComponent implements AfterViewInit, OnDestroy {
    /**
     * @hidden @internal
     */
    @HostBinding('class.igx-query-builder')
    public cssClass = 'igx-query-builder';

    /**
     * @hidden @internal
     */
    @HostBinding('style.display')
    public display = 'block';

    @Input()
    public entities: EntityType[];

    // /**
    // * Returns the fields.
    // */
    // public get fields(): FieldType[] {
    //     return this._fields;
    // }

    // /**
    //  * Sets the fields.
    //  */
    // @Input()
    // public set fields(fields: FieldType[]) {
    //     this._fields = fields;

    //     if (this._fields) {
    //         this.registerSVGIcons();

    //         this._fields.forEach(field => {
    //             this.setFilters(field);
    //             this.setFormat(field);
    //         });
    //     }
    // }

    
    @Input()
    public expressionTree: IExpressionTree;

    /**
     * Gets the `locale` of the query builder.
     * If not set, defaults to application's locale.
     */
    @Input()
    public locale: string;

    /**
     * Sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IQueryBuilderResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * Returns the resource strings.
     */
    public get resourceStrings(): IQueryBuilderResourceStrings {
        return this._resourceStrings;
    }

    /**
     * Event fired as the expression tree is changed.
     *
     * ```html
     *  <igx-query-builder (expressionTreeChange)='onExpressionTreeChange()'></igx-query-builder>
     * ```
     */
    @Output()
    public expressionTreeChange = new EventEmitter();

    /**
     * @hidden @internal
     */
    @ContentChild(IgxQueryBuilderHeaderComponent)
    public headerContent: IgxQueryBuilderHeaderComponent;
    
    /**
     * @hidden @internal
     */
    @ViewChild(IgxQueryBuilderTreeComponent)
    public queryTree: IgxQueryBuilderTreeComponent;
    
    private destroy$ = new Subject<any>();
    private _resourceStrings = getCurrentResourceStrings(QueryBuilderResourceStringsEN);

    /**
     * @hidden @internal
     */
    public ngAfterViewInit(): void {
        // this._overlaySettings.outlet = this.overlayOutlet;
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
     *
     * used by the grid
     */
    public setPickerOutlet(outlet?: IgxOverlayOutletDirective | ElementRef) {
        this.queryTree.setPickerOutlet(outlet);
    }

    /**
     * @hidden @internal
     *
     * used by the grid
     */
    public get isContextMenuVisible(): boolean {
        return this.queryTree.isContextMenuVisible;
    }

    /**
     * @hidden @internal
     */
    public clearSelection() {
        this.queryTree.clearSelection();
    }

    /**
     * @hidden @internal
     *
     * used by the grid
     */
    public exitOperandEdit() {
        this.queryTree.exitOperandEdit();
    }

    /**
     * @hidden @internal
     *
     * used by the grid
     */
    public setAddButtonFocus() {
        this.queryTree.setAddButtonFocus();
    }

    public onExpressionTreeChange(tree: IExpressionTree) {
        this.expressionTree = tree;
        this.expressionTreeChange.emit();
    }
}

