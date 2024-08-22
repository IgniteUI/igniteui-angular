import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FilteringExpressionsTree, FilteringLogic, IgxStringFilteringOperand, IgxBooleanFilteringOperand, IgxNumberFilteringOperand } from 'igniteui-angular';

const QUERY_BUILDER_CLASS = 'igx-query-builder';
const QUERY_BUILDER_HEADER = 'igx-query-builder__header';
const QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS = 'igx-filter-tree__line--and';
const QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS = 'igx-filter-tree__line--or';
const QUERY_BUILDER_OPERATOR_LINE_SELECTED_CSS_CLASS = 'igx-filter-tree__line--selected';

export class QueryBuilderFunctions {
    public static generateExpressionTree(): FilteringExpressionsTree {
        const innerTree = new FilteringExpressionsTree(FilteringLogic.And, 'Products', ['Id']);
        innerTree.filteringOperands.push({
            field: 'ProductName',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            conditionName: 'contains',
            searchVal: 'a'
        });
        innerTree.filteringOperands.push({
            field: 'Released',
            condition: IgxBooleanFilteringOperand.instance().condition('true'),
            conditionName: 'true',
        });

        const tree = new FilteringExpressionsTree(FilteringLogic.And, 'Orders', ['*']);
        tree.filteringOperands.push({
            field: 'OrderId',
            condition: IgxStringFilteringOperand.instance().condition('in'),
            conditionName: 'in',
            searchTree: innerTree
        });
        tree.filteringOperands.push({
            field: 'OrderId',
            condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
            conditionName: 'greaterThan',
            searchVal: 3,
            ignoreCase: true
        });
        // tree.filteringOperands.push({
        //     field: 'OrderDate',
        //     condition: IgxDateFilteringOperand.instance().condition('after'),
        //     conditionName: 'after',
        //     searchVal: new Date()
        // });
        return tree;
    }

    public static getQueryBuilderFilteringHeader(fix: ComponentFixture<any>) {
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
        const header = queryBuilderElement.querySelector(`.${QUERY_BUILDER_HEADER}`);
        return header;
    }

    public static getQueryBuilderFilteringHeaderText(fix: ComponentFixture<any>) {
        const header = QueryBuilderFunctions.getQueryBuilderFilteringHeader(fix);
        const title = header.querySelector('.ig-typography__h6');
        return title.textContent;
    }

    public static getQueryBuilderFilteringHeaderLegendItemAnd(fix: ComponentFixture<any>) {
        const header = QueryBuilderFunctions.getQueryBuilderFilteringHeader(fix);
        const andLegendItem = header.querySelector('.igx-builder-legend__item--and');
        return andLegendItem;
    }

    public static getQueryBuilderFilteringHeaderLegendItemOr(fix: ComponentFixture<any>) {
        const header = QueryBuilderFunctions.getQueryBuilderFilteringHeader(fix);
        const orLegendItem = header.querySelector('.igx-builder-legend__item--or');
        return orLegendItem;
    }

    public static getQueryBuilderAllGroups(fix: ComponentFixture<any>): any[] {
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
        const allGroups = Array.from(QueryBuilderFunctions.getQueryBuilderTreeChildGroups(queryBuilderElement, false));
        return allGroups;
    }

    /**
     * Get the expressions container that contains all groups and expressions.
     */
    public static getQueryBuilderExpressionsContainer(fix: ComponentFixture<any>) {
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
        const exprContainer = queryBuilderElement.querySelector('.igx-query-builder__main');
        return exprContainer;
    }

    /**
     * Get the root group.
     */
    public static getQueryBuilderTreeRootGroup(fix: ComponentFixture<any>) {
        const exprContainer = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix);
        const rootGroup = exprContainer.querySelector(':scope > .igx-filter-tree');
        return rootGroup;
    }

    /**
     * Get all child groups of the given 'group' by specifying whether to include its direct child groups only
     * or all of its child groups in the hierarchy. (NOTE: Expressions do not have children!)
     */
    public static getQueryBuilderTreeChildGroups(group: HTMLElement, directChildrenOnly = true) {
        const pattern = directChildrenOnly ? ':scope > .igx-filter-tree' : '.igx-filter-tree';
        const childrenContainer = group.querySelector('.igx-filter-tree__expression');
        const childGroups = Array.from(childrenContainer.querySelectorAll(pattern));
        return childGroups;
    }

    /**
     * Get all child expressions of the given 'group' by specifying whether to include its direct child expressions only
     * or all of its child expressions in the hierarchy.
     */
    public static getQueryBuilderTreeChildExpressions(group: HTMLElement, directChildrenOnly = true) {
        const pattern = directChildrenOnly ? ':scope > .igx-filter-tree__expression-item' : '.igx-filter-tree__expression-item';
        const childrenContainer = group.querySelector('.igx-filter-tree__expression');
        const childExpressions = Array.from(childrenContainer.querySelectorAll(pattern));
        return childExpressions;
    }

    /**
     * Get all child groups and expressions of the given 'group' by specifying whether to include its
     * direct child groups and expressions only or all of its child groups and expressions in the hierarchy.
     */
    public static getQueryBuilderTreeChildItems(group: HTMLElement, directChildrenOnly = true) {
        const childGroups = Array.from(QueryBuilderFunctions.getQueryBuilderTreeChildGroups(group, directChildrenOnly));
        const childExpressions = Array.from(QueryBuilderFunctions.getQueryBuilderTreeChildExpressions(group, directChildrenOnly));
        return childGroups.concat(childExpressions);
    }
    /**
     * Get a specific item from the tree (could be a group or an expression)
     * by specifying its hierarchical path (not including the root group).
     * (Example: [2 ,1] will first get the third item of the root group,
     *  and then it will get the second item of the root group's third item.)
     * (NOTE: Only the items that are groups have children.)
     * The returned element is the one that has been gotten last.
     */
    public static getQueryBuilderTreeItem(fix: ComponentFixture<any>,
        path: number[]) {
        let node = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
        for (const pos of path) {
            const directChildren = QueryBuilderFunctions.getQueryBuilderTreeChildItems(node as HTMLElement, true);
            node = directChildren[pos];
        }
        return node;
    }

    /**
     * Get the operator line of the root group.
     */
    public static getQueryBuilderTreeRootGroupOperatorLine(fix: ComponentFixture<any>) {
        const rootGroup = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
        const directOperatorLine = rootGroup.querySelector(':scope > .igx-filter-tree__line');
        return directOperatorLine;
    }

    /**
     * Get the operator line of the group that is located on the provided 'path'.
     */
    public static getQueryBuilderTreeGroupOperatorLine(fix: ComponentFixture<any>, path: number[]) {
        const group = QueryBuilderFunctions.getQueryBuilderTreeItem(fix, path);
        const directOperatorLine = group.querySelector(':scope > .igx-filter-tree__line');
        return directOperatorLine;
    }

    /**
     * Verifies the type of the operator line ('and' or 'or').
     * (NOTE: The 'operator' argument must be a string with a value that is either 'and' or 'or'.)
     */
    public static verifyOperatorLine(operatorLine: HTMLElement, operator: string) {
        expect(operator === 'and' || operator === 'or').toBe(true, 'operator must be \'and\' or \'or\'');

        if (operator === 'and') {
            expect(operatorLine.classList.contains(QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS)).toBe(true, 'incorrect operator line');
            expect(operatorLine.classList.contains(QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS)).toBe(false, 'incorrect operator line');
        } else {
            expect(operatorLine.classList.contains(QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS)).toBe(false, 'incorrect operator line');
            expect(operatorLine.classList.contains(QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS)).toBe(true, 'incorrect operator line');
        }
    }

    public static verifyOperatorLineSelection(operatorLine: HTMLElement, shouldBeSelected: boolean) {
        expect(operatorLine.classList.contains(QUERY_BUILDER_OPERATOR_LINE_SELECTED_CSS_CLASS))
            .toBe(shouldBeSelected, 'incorrect selection state of the operator line');
    }
}
