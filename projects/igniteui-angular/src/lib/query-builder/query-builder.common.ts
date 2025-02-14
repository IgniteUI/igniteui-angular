import { Pipe, PipeTransform } from '@angular/core';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';

@Pipe({
    name: 'fieldFormatter',
    standalone: true
})
export class IgxFieldFormatterPipe implements PipeTransform {

    public transform(value: any, formatter: (v: any, data: any, fieldData?: any) => any, rowData: any, fieldData?: any) {
        return formatter(value, rowData, fieldData);
    }
}

/**
 * @hidden @internal
 */
export class ExpressionItem {
    public parent: ExpressionGroupItem;
    public expanded: boolean;
    constructor(parent?: ExpressionGroupItem) {
        this.parent = parent;
    }
}

/**
 * @hidden @internal
 */
export class ExpressionGroupItem extends ExpressionItem {
    public operator: FilteringLogic;
    public children: ExpressionItem[];
    constructor(operator: FilteringLogic, parent?: ExpressionGroupItem) {
        super(parent);
        this.operator = operator;
        this.children = [];
    }
}

/**
 * @hidden @internal
 */
export class ExpressionOperandItem extends ExpressionItem {
    public expression: IFilteringExpression;
    public inEditMode: boolean;
    public inAddMode: boolean;
    public hovered: boolean;
    public focused: boolean;
    public fieldLabel: string;
    constructor(expression: IFilteringExpression, parent: ExpressionGroupItem) {
        super(parent);
        this.expression = expression;
    }
}

const IGX_QUERY_BUILDER = 'igx-query-builder';
const IGX_FILTER_TREE = 'igx-filter-tree';

/**
 * @hidden @internal
 */
export const QueryBuilderSelectors = {
    DRAG_INDICATOR: 'igx-drag-indicator',

    DROP_DOWN_LIST_SCROLL: 'igx-drop-down__list-scroll',
    DROP_DOWN_ITEM_DISABLED: 'igx-drop-down__item--disabled',

    FILTER_TREE: IGX_FILTER_TREE,
    FILTER_TREE_EXPRESSION_CONTEXT_MENU: IGX_FILTER_TREE + '__expression-context-menu',
    FILTER_TREE_EXPRESSION_ITEM: IGX_FILTER_TREE + '__expression-item',
    FILTER_TREE_EXPRESSION_ITEM_DROP_GHOST: IGX_FILTER_TREE + '__expression-item-drop-ghost',
    FILTER_TREE_EXPRESSION_ITEM_GHOST: IGX_FILTER_TREE + '__expression-item-ghost',
    FILTER_TREE_EXPRESSION_SECTION: IGX_FILTER_TREE + '__expression-section',

    FILTER_TREE_LINE_AND: IGX_FILTER_TREE + '__line--and',
    FILTER_TREE_LINE_OR: IGX_FILTER_TREE + '__line--or',
    FILTER_TREE_SUBQUERY: IGX_FILTER_TREE + '__subquery',

    QUERY_BUILDER: IGX_QUERY_BUILDER,
    QUERY_BUILDER_BODY: IGX_QUERY_BUILDER + '__main',
    QUERY_BUILDER_HEADER: IGX_QUERY_BUILDER + '__header',
    QUERY_BUILDER_TREE: IGX_QUERY_BUILDER + '-tree',

    VIABLE_DROP_AREA:
        `.${IGX_FILTER_TREE}__expression-item[igxDrop]:not(.${IGX_FILTER_TREE + '__expression-item-drop-ghost'}),` + /*Condition chip*/
        `.${IGX_FILTER_TREE}__subquery:has([igxDrop]),` + /*Chip in edit*/
        `.${IGX_FILTER_TREE}__buttons > .igx-button[igxDrop]:first-of-type,` + /*Add Condition Button*/
        `.${IGX_FILTER_TREE}__expression-context-menu[igxDrop]` /*AND/OR group root*/
}
