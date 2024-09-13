import { ContentChild, EventEmitter, Output, TemplateRef } from '@angular/core';
import { NgIf, NgTemplateOutlet} from '@angular/common';
import {
    Component, Input, ViewChild, ElementRef, OnDestroy, HostBinding
} from '@angular/core';
import { Subject } from 'rxjs';
import { IQueryBuilderResourceStrings, QueryBuilderResourceStringsEN } from '../core/i18n/query-builder-resources';
import { IExpressionTree } from '../data-operations/filtering-expressions-tree';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { EntityType, FieldType } from '../grids/common/grid.interface';
import { IgxQueryBuilderHeaderComponent } from './query-builder-header.component';
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { IgxQueryBuilderTreeComponent } from './query-builder-tree.component';
import { IgxIconService } from '../icon/icon.service';
import { editor } from '@igniteui/material-icons-extended';
import { IgxQueryBuilderSearchValueTemplateDirective } from './query-builder.directives';

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
    imports: [NgIf, IgxQueryBuilderHeaderComponent, IgxQueryBuilderTreeComponent, NgTemplateOutlet, IgxQueryBuilderSearchValueTemplateDirective]
})
export class IgxQueryBuilderComponent implements OnDestroy {
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

    /**
    * Returns the fields.
    */
    public get fields(): FieldType[] {
        return this._fields;
    }

    /**
     * Sets the fields.
     */
    @Input()
    public set fields(fields: FieldType[]) {
        if (fields) {
            this.entities = [
                {
                    name: null, 
                    fields: fields
                }
            ];
        }
    }

    /**
    * Returns the expression tree.
    */
    public get expressionTree(): IExpressionTree {
        return this._expressionTree;
    }

    /**
     * Sets the expression tree.
     */
    @Input()
    public set expressionTree(expressionTree: IExpressionTree) {
        if (JSON.stringify(expressionTree) !== JSON.stringify(this._expressionTree)) {
            this._expressionTree = expressionTree;
        }
    }

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
    @ContentChild(IgxQueryBuilderSearchValueTemplateDirective, { read: TemplateRef })
    public searchValueTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxQueryBuilderTreeComponent)
    public queryTree: IgxQueryBuilderTreeComponent;

    private destroy$ = new Subject<any>();
    private _resourceStrings = getCurrentResourceStrings(QueryBuilderResourceStringsEN);
    private _expressionTree: IExpressionTree;
    private _fields: FieldType[];

    constructor(protected iconService: IgxIconService) {
        this.registerSVGIcons();
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
        this._expressionTree = tree;
        this.expressionTreeChange.emit();
    }

    private registerSVGIcons(): void {
        const editorIcons = editor as any[];

        editorIcons.forEach((icon) => {
            this.iconService.addSvgIconFromText(icon.name, icon.value, 'imx-icons');
            this.iconService.addIconRef(icon.name, 'default', {
                name: icon.name,
                family: 'imx-icons'
            });
        });

        const inIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M560-280H120v-400h720v120h-80v-40H200v240h360v80Zm-360-80v-240 240Zm560 200v-120H640v-80h120v-120h80v120h120v80H840v120h-80Z"/></svg>';
        this.iconService.addSvgIconFromText('in', inIcon, 'imx-icons');
        this.iconService.addIconRef('in', 'default', {
            name: 'in',
            family: 'imx-icons'
        });

        const notInIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M560-280H120v-400h720v120h-80v-40H200v240h360v80Zm-360-80v-240 240Zm440 104 84-84-84-84 56-56 84 84 84-84 56 56-83 84 83 84-56 56-84-83-84 83-56-56Z"/></svg>';
        this.iconService.addSvgIconFromText('not-in', notInIcon, 'imx-icons');
        this.iconService.addIconRef('not-in', 'default', {
            name: 'not-in',
            family: 'imx-icons'
        });

        this.iconService.addIconRef('add', 'default', {
            name: 'add',
            family: 'material',
        });

        this.iconService.addIconRef('close', 'default', {
            name: 'close',
            family: 'material',
        });

        this.iconService.addIconRef('check', 'default', {
            name: 'check',
            family: 'material',
        });

        this.iconService.addIconRef('delete', 'default', {
            name: 'delete',
            family: 'material',
        });

        this.iconService.addIconRef('edit', 'default', {
            name: 'edit',
            family: 'material',
        });

        this.iconService.addIconRef('unfold_less', 'default', {
            name: 'unfold_less',
            family: 'material',
        });

        this.iconService.addIconRef('unfold_more', 'default', {
            name: 'unfold_more',
            family: 'material',
        });
    }
}

