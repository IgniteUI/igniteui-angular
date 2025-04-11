import { booleanAttribute, ContentChild, EventEmitter, Output, TemplateRef } from '@angular/core';
import {
    Component, Input, ViewChild, ElementRef, OnDestroy, HostBinding
} from '@angular/core';
import { Subject } from 'rxjs';
import { IQueryBuilderResourceStrings, QueryBuilderResourceStringsEN } from '../core/i18n/query-builder-resources';
import { IExpressionTree } from '../data-operations/filtering-expressions-tree';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import { EntityType, FieldType } from '../grids/common/grid.interface';
import { getCurrentResourceStrings } from '../core/i18n/resources';
import { IgxQueryBuilderTreeComponent } from './query-builder-tree.component';
import { IgxIconService } from '../icon/icon.service';
import { editor } from '@igniteui/material-icons-extended';
import { IgxQueryBuilderSearchValueTemplateDirective } from './query-builder.directives';
import { recreateTree } from '../data-operations/expressions-tree-util';

/**
 * A component used for operating with complex filters by creating or editing conditions
 * and grouping them using AND/OR logic.
 * It is used internally in the Advanced Filtering of the Grid.
 *
 * @example
 * ```html
 * <igx-query-builder [entities]="this.entities">
 * </igx-query-builder>
 * ```
 */
@Component({
    selector: 'igx-query-builder',
    templateUrl: './query-builder.component.html',
    imports: [IgxQueryBuilderTreeComponent]
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

    /**
     * Gets/sets whether the confirmation dialog should be shown when changing entity.
     * Default value is `true`.
     */
    @Input({ transform: booleanAttribute })
    public showEntityChangeDialog = true;

    /**
     * Returns the entities.
     * @hidden
     */
    public get entities(): EntityType[] {
        return this._entities;
    }

    /**
     * Sets the entities.
     * @hidden
     */
    @Input()
    public set entities(entities: EntityType[]) {
        if (entities !== this._entities) {
            if (entities && this.expressionTree) {
                this._expressionTree = recreateTree(this._expressionTree, entities);
            }
        }
        this._entities = entities;
    }

    /**
     * Returns the fields.
     * @hidden
     * @deprecated in version 19.1.0. Use the `entities` property instead.
     */
    public get fields(): FieldType[] {
        return this._fields;
    }

    /**
     * Sets the fields.
     * @hidden
     * @deprecated in version 19.1.0. Use the `entities` property instead.
     */
    @Input()
    public set fields(fields: FieldType[]) {
        if (fields) {
            this._fields = fields;
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
        if (expressionTree !== this._expressionTree) {
            if (this.entities && expressionTree) {
                this._expressionTree = recreateTree(expressionTree, this.entities);
            } else {
                this._expressionTree = expressionTree;
            }
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
     * Disables subsequent entity changes at the root level after the initial selection.
     */
    @Input()
    public disableEntityChange = false;

    /**
     * Disables return fields changes at the root level.
     */
     @Input()
     public disableReturnFieldsChange = false;

    /**
     * Event fired as the expression tree is changed.
     *
     * ```html
     *  <igx-query-builder (expressionTreeChange)='onExpressionTreeChange()'></igx-query-builder>
     * ```
     */
    @Output()
    public expressionTreeChange = new EventEmitter<IExpressionTree>();

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
    private _entities: EntityType[];
    private _shouldEmitTreeChange = true;

    constructor(protected iconService: IgxIconService) {
        this.registerSVGIcons();
    }

    /**
     * Returns whether the expression tree can be committed in the current state.
     */
    public canCommit(): boolean {
        return this.queryTree?.canCommitCurrentState() === true;
    }

    /**
     * Commits the expression tree in the current state if it is valid. If not throws an exception.
     */
    public commit(): void {
        if (this.canCommit()) {
            this._shouldEmitTreeChange = false;
            this.queryTree.commitCurrentState();
            this._shouldEmitTreeChange = true;
        } else {
            throw new Error('Expression tree can\'t be committed in the current state. Use `canCommit` method to check if the current state is valid.');
        }
    }

    /**
     * Discards all unsaved changes to the expression tree.
     */
    public discard(): void {
        this.queryTree.cancelOperandEdit();
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
        if (tree && this.entities && tree !== this._expressionTree) {
            this._expressionTree = recreateTree(tree, this.entities);
        } else {
            this._expressionTree = tree;
        }
        if (this._shouldEmitTreeChange) {
            this.expressionTreeChange.emit(tree);
        }
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
    }
}

