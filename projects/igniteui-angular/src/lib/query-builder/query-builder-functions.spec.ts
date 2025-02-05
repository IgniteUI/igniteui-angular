import { DebugElement } from '@angular/core';
import { ComponentFixture, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FilteringExpressionsTree, FilteringLogic, IgxStringFilteringOperand, IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxIconComponent, IgxDateFilteringOperand, IgxChipComponent } from 'igniteui-angular';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';

export const QueryBuilderConstants = {
    QUERY_BUILDER_CLASS: 'igx-query-builder',
    QUERY_BUILDER_HEADER: 'igx-query-builder__header',
    QUERY_BUILDER_TREE: 'igx-query-builder-tree',
    QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS: 'igx-filter-tree__line--and',
    QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS: 'igx-filter-tree__line--or',
    CSS_CLASS_DROPDOWN_LIST_SCROLL: 'igx-drop-down__list-scroll',
    QUERY_BUILDER_GROUP_CONTEXT_MENU: 'igx-filter-tree__expression-context-menu',
    CSS_CLASS_DROP_DOWN_ITEM_DISABLED: 'igx-drop-down__item--disabled',
    QUERY_BUILDER_BODY: 'igx-query-builder__main',
    QUERY_BUILDER_EXPRESSION_ITEM_CLASS: 'igx-filter-tree__expression-item'
}

export const SampleEntities = [
    {
        name: 'Products', fields: [
            { field: 'Id', dataType: 'number' },
            { field: 'ProductName', dataType: 'string' },
            { field: 'OrderId', dataType: 'number' },
            { field: 'Released', dataType: 'boolean' }
        ]
    },
    {
        name: 'Orders', fields: [
            { field: 'OrderId', dataType: 'number' },
            { field: 'OrderName', dataType: 'string' },
            { field: 'OrderDate', dataType: 'date' },
            { field: 'Delivered', dataType: 'boolean' }
        ]
    }
];

export class QueryBuilderFunctions {
    public static generateExpressionTree(): FilteringExpressionsTree {
        const innerTree = new FilteringExpressionsTree(FilteringLogic.And, null, 'Products', ['Id']);
        innerTree.filteringOperands.push({
            fieldName: 'ProductName',
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            conditionName: 'contains',
            searchVal: 'a'
        });
        innerTree.filteringOperands.push({
            fieldName: 'Released',
            condition: IgxBooleanFilteringOperand.instance().condition('true'),
            conditionName: 'true',
        });

        const tree = new FilteringExpressionsTree(FilteringLogic.And, null, 'Orders', ['*']);
        tree.filteringOperands.push({
            fieldName: 'OrderId',
            condition: IgxStringFilteringOperand.instance().condition('in'),
            conditionName: 'in',
            searchTree: innerTree
        });
        tree.filteringOperands.push({
            fieldName: 'OrderId',
            condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
            conditionName: 'greaterThan',
            searchVal: 3,
            ignoreCase: true
        });
        tree.filteringOperands.push({
            fieldName: 'OrderDate',
            condition: IgxDateFilteringOperand.instance().condition('after'),
            conditionName: 'after',
            searchVal: new Date()
        });
        return tree;
    }

    public static generateExpressionTreeWithSubGroup(): FilteringExpressionsTree {
        const innerTree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Products', ['OrderId']);
        innerTree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxNumberFilteringOperand.instance().condition('equals'),
            conditionName: IgxNumberFilteringOperand.instance().condition('equals').name,
            searchVal: 123
        });
        innerTree.filteringOperands.push({
            fieldName: 'ProductName',
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            conditionName: IgxStringFilteringOperand.instance().condition('equals').name,
            searchVal: 'abc'
        });


        const tree = new FilteringExpressionsTree(FilteringLogic.And, null, 'Orders', ['*']);
        tree.filteringOperands.push({
            fieldName: 'OrderName',
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            conditionName: IgxStringFilteringOperand.instance().condition('equals').name,
            searchVal: 'foo'
        });

        tree.filteringOperands.push({
            fieldName: 'OrderId',
            condition: IgxStringFilteringOperand.instance().condition('in'),
            conditionName: IgxStringFilteringOperand.instance().condition('in').name,
            searchTree: innerTree
        });

        const subGroup = new FilteringExpressionsTree(FilteringLogic.Or, undefined, 'Orders', ['*']);
        subGroup.filteringOperands.push({
            fieldName: 'OrderName',
            condition: IgxStringFilteringOperand.instance().condition('endsWith'),
            conditionName: IgxStringFilteringOperand.instance().condition('endsWith').name,
            searchVal: 'a'
        });
        subGroup.filteringOperands.push({
            fieldName: 'OrderDate',
            condition: IgxDateFilteringOperand.instance().condition('today'),
            conditionName: IgxDateFilteringOperand.instance().condition('today').name
        });
        tree.filteringOperands.push(subGroup);

        return tree;
    }


    public static getQueryBuilderHeader(fix: ComponentFixture<any>) {
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_CLASS}`))[0].nativeElement;
        const header = queryBuilderElement.querySelector(`.${QueryBuilderConstants.QUERY_BUILDER_HEADER}`);
        return header;
    }

    public static getQueryBuilderHeaderText(fix: ComponentFixture<any>) {
        const header = QueryBuilderFunctions.getQueryBuilderHeader(fix);
        const title = header.querySelector('.igx-query-builder__title');
        return title.textContent;
    }

    /**
     * Get the expressions container that contains all groups and expressions.
     */
    public static getQueryBuilderExpressionsContainer(fix: ComponentFixture<any>, level = 0) {
        const searchClass = `${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-${level}`
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${searchClass}`))[0].nativeElement;
        const exprContainer = queryBuilderElement.querySelector('.igx-query-builder__main');
        return exprContainer;
    }

    /**
     * Get the initial condition adding buttons when the dialog does not contain any filters.
     */
    public static getQueryBuilderInitialAddConditionBtn(fix: ComponentFixture<any>, level = 0) {
        const exprContainer = this.getQueryBuilderExpressionsContainer(fix, level);
        const initialButton = Array.from(exprContainer.querySelectorAll('button')).filter(item => item.checkVisibility()).at(-1);
        return initialButton;
    }

    public static getQueryBuilderAllGroups(fix: ComponentFixture<any>): any[] {
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_CLASS}`))[0].nativeElement;
        const allGroups = Array.from(QueryBuilderFunctions.getQueryBuilderTreeChildGroups(queryBuilderElement, false));
        return allGroups;
    }

    /**
     * Get the root group.
     */
    public static getQueryBuilderTreeRootGroup(fix: ComponentFixture<any>, level = 0) {
        const exprContainer = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix, level).children[1];
        const rootGroup = exprContainer.querySelector(':scope > .igx-filter-tree');
        return rootGroup;
    }

    /**
     * Get all child groups of the given 'group' by specifying whether to include its direct child groups only
     * or all of its child groups in the hierarchy. (NOTE: Expressions do not have children!)
     */
    public static getQueryBuilderTreeChildGroups(group: HTMLElement, directChildrenOnly = true) {
        const pattern = directChildrenOnly ? ':scope > .igx-filter-tree' : '.igx-filter-tree';
        const childrenContainer = group.querySelector('.igx-filter-tree__expressions').children[1];
        const childGroups = Array.from(childrenContainer.querySelectorAll(pattern));
        return childGroups;
    }

    /**
     * Get all child expressions of the given 'group' by specifying whether to include its direct child expressions only
     * or all of its child expressions in the hierarchy.
     */
    public static getQueryBuilderTreeChildExpressions(group: HTMLElement, directChildrenOnly = true) {
        const pattern = directChildrenOnly ? ':scope > .igx-filter-tree__expression-item' : '.igx-filter-tree__expression-item';
        const childrenContainer = group.querySelector('.igx-filter-tree__expressions').children[1];
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
        path: number[],
        level = 0) {
        let node = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix, level);
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

    public static getQueryBuilderEditModeContainer(fix: ComponentFixture<any>, entityContainer = true, level = 0) {
        const exprContainer = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix, level);
        const editModeContainers = Array.from(exprContainer.querySelectorAll('.igx-filter-tree__inputs'));
        const entityEditModeContainer = editModeContainers.find(container => container.children.length == 2);
        const conditionEditModeContainer = editModeContainers.find(container => container.children.length >= 4);
        return entityContainer ? entityEditModeContainer : conditionEditModeContainer;
    }

    public static getQueryBuilderEntitySelect(fix: ComponentFixture<any>, level = 0) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, true, level);
        const entitySelect = editModeContainer.querySelector('igx-select');
        return entitySelect;
    }

    public static getQueryBuilderFieldsCombo(fix: ComponentFixture<any>, level = 0) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, true, level);
        const fieldCombo = level == 0 ? editModeContainer.querySelector('igx-combo') : editModeContainer.querySelectorAll('igx-select')[1];
        return fieldCombo;
    }

    public static getQueryBuilderColumnSelect(fix: ComponentFixture<any>, level = 0) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false, level);
        const selects = Array.from(editModeContainer.querySelectorAll('igx-select'));
        const columnSelect = selects[0];
        return columnSelect;
    }

    public static getQueryBuilderOperatorSelect(fix: ComponentFixture<any>, level = 0) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false, level);
        const selects = Array.from(editModeContainer.querySelectorAll('igx-select'));
        const operatorSelect = selects[1];
        return operatorSelect;
    }

    public static getQueryBuilderValueInput(fix: ComponentFixture<any>, dateType = false, level = 0) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false, level);
        const input = dateType ?
            editModeContainer.querySelector('igx-date-picker').querySelector('input') :
            Array.from(editModeContainer.querySelectorAll('igx-input-group'))[2];
        return input;
    }

    public static getQueryBuilderExpressionCommitButton(fix: ComponentFixture<any>, level = 0) {
        const actionButtons = fix.debugElement.queryAll(By.css('.igx-filter-tree__inputs-actions > button'));
        const commitButton = actionButtons.filter((el: DebugElement) => {
            const icon = el.query(By.directive(IgxIconComponent)).componentInstance;
            return icon.name === 'confirm';
        });

        return commitButton[level].nativeElement;
    }

    public static getQueryBuilderExpressionCloseButton(fix: ComponentFixture<any>, level = 0) {
        const actionButtons = fix.debugElement.queryAll(By.css('.igx-filter-tree__inputs-actions > button'));
        const closeButton = actionButtons.filter((el: DebugElement) => {
            const icon = el.query(By.directive(IgxIconComponent)).componentInstance;
            return icon.name === 'close';
        });

        return closeButton[level].nativeElement;
    }

    /**
     * Get the adding buttons and the cancel button of the root group by specifying the
     * index position of the buttons container.
     */
    public static getQueryBuilderTreeRootGroupButtons(fix: ComponentFixture<any>, buttonsIndex: number) {
        const buttonsContainer: any = this.getQueryBuilderTreeRootGroupButtonsContainer(fix, buttonsIndex);
        const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
        return buttons;
    }

    public static getQueryBuilderTreeRootGroupButtonsContainer(fix: ComponentFixture<any>, buttonsIndex: number) {
        const group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
        const childrenContainer = group.querySelector('.igx-filter-tree__expressions');
        const buttonsContainers = Array.from(childrenContainer.querySelectorAll(':scope > .igx-filter-tree__buttons'));
        return buttonsContainers[buttonsIndex];
    }

    public static getQueryBuilderOutlet(queryBuilderElement: HTMLElement) {
        const outlet = queryBuilderElement.querySelector(':scope > .igx-query-builder__outlet');
        return outlet;
    }

    public static getQueryBuilderSelectDropdown(queryBuilderElement: HTMLElement) {
        const outlet = QueryBuilderFunctions.getQueryBuilderOutlet(queryBuilderElement);
        const selectDropdown = outlet.querySelector(`.${QueryBuilderConstants.CSS_CLASS_DROPDOWN_LIST_SCROLL}`);
        return selectDropdown;
    }

    public static getQueryBuilderSelectDropdownItems(queryBuilderElement: HTMLElement) {
        const selectDropdown = QueryBuilderFunctions.getQueryBuilderSelectDropdown(queryBuilderElement);
        const items = Array.from(selectDropdown.querySelectorAll('.igx-drop-down__item'));
        return items;
    }

    public static getQueryBuilderCalendar(fix: ComponentFixture<any>) {
        const calendar = fix.debugElement.queryAll(By.css(`.igx-calendar`))[0].nativeElement;
        return calendar;
    }

    /**
     * Get the underlying chip of the expression that is located on the provided 'path'.
     */
    public static getQueryBuilderTreeExpressionChip(fix: ComponentFixture<any>, path: number[], level = 0) {
        const treeItem = QueryBuilderFunctions.getQueryBuilderTreeItem(fix, path, level);
        const chip = treeItem.querySelector('igx-chip');
        return chip;
    }

    /**
     * Get the action icons ('edit' and 'add') of the expression that is located on the provided 'path'.
     */
    public static getQueryBuilderTreeExpressionActionsContainer(fix: ComponentFixture<any>, path: number[]) {
        const treeItem = QueryBuilderFunctions.getQueryBuilderTreeItem(fix, path);
        const actionsContainer = treeItem.querySelector('.igx-filter-tree__expression-actions');
        return actionsContainer;
    }

    /**
     * Get the specified icon (add, close) of the expression that is located on the provided 'path'.
     */
    public static getQueryBuilderTreeExpressionIcon(fix: ComponentFixture<any>, path: number[], iconType: string) {
        const actionsContainer = QueryBuilderFunctions.getQueryBuilderTreeExpressionActionsContainer(fix, path);
        const icons = Array.from(actionsContainer.querySelectorAll('igx-icon'));
        return icons.find((icon: any) => icon.innerText === iconType) as any;
    }

    /**
     * Get the adding buttons and the cancel button of a group by specifying the
     * path of the group and the index position of the buttons container.
     * (NOTE: The buttons are returned in an array and are sorted in ascending order based on 'X' value.)
     */
    public static getQueryBuilderTreeGroupButtons(fix: ComponentFixture<any>, path: number[], buttonsIndex: number) {
        const group = QueryBuilderFunctions.getQueryBuilderTreeItem(fix, path);
        const childrenContainer = group.querySelector('.igx-filter-tree__expression');
        const buttonsContainers = Array.from(childrenContainer.querySelectorAll(':scope > .igx-filter-tree__buttons'));
        const buttonsContainer: any = buttonsContainers[buttonsIndex];
        const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
        return buttons;
    }

    public static getQueryBuilderGroupContextMenus(fix: ComponentFixture<any>) {
        return fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_GROUP_CONTEXT_MENU}`));
    }

    public static getQueryBuilderGroupContextMenuDropDownItems(fix: ComponentFixture<any>) {
        const dropDownItems = fix.nativeElement.querySelectorAll('igx-drop-down-item')
        return dropDownItems;
    }

    public static verifyContextMenuItemDisabled(fix: ComponentFixture<any>, index: number, disabled: boolean) {
        const contextMenuItems = QueryBuilderFunctions.getQueryBuilderGroupContextMenuDropDownItems(fix);
        expect(contextMenuItems[index].classList.contains(QueryBuilderConstants.CSS_CLASS_DROP_DOWN_ITEM_DISABLED)).toBe(disabled);
    }

    public static clickQueryBuilderGroupContextMenu(fix: ComponentFixture<any>, index = 0) {
        const contextMenuButton = QueryBuilderFunctions.getQueryBuilderGroupContextMenus(fix)[index].queryAll(By.css('.igx-button'))[0].nativeElement;
        contextMenuButton.click();
    }

    public static clickContextMenuItem(fix: ComponentFixture<any>, index: number) {
        const dropDownItems = this.getQueryBuilderGroupContextMenuDropDownItems(fix);
        dropDownItems[index].click();
    }

    /*
    * Get tabbable elements in a container element. Result is returned as node elements ordered they way they will be tabbed
    */
    public static getTabbableElements(inElement: HTMLElement) {
        const focusableElements =
            'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';

        return Array.prototype.filter.call(
            inElement.querySelectorAll(focusableElements),
            element => {
                return (element.offsetWidth > 0 || element.offsetHeight > 0);
            }
        );
    }

    public static clickQueryBuilderInitialAddConditionBtn(fix: ComponentFixture<any>, level = 0) {
        const btn = this.getQueryBuilderInitialAddConditionBtn(fix, level);
        btn.click();
    }

    /**
     * Click the entity select for the expression that is currently in edit mode.
     */
    public static clickQueryBuilderEntitySelect(fix: ComponentFixture<any>, level = 0) {
        const entityInputGroup = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix, level).querySelector('igx-input-group') as HTMLElement;
        entityInputGroup.click();
    }

    /**
     * Click the fields combo for the expression that is currently in edit mode.
     */
    public static clickQueryBuilderFieldsCombo(fix: ComponentFixture<any>, level = 0) {
        const fieldInputGroup = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix, level).querySelector('igx-input-group') as HTMLElement;
        fieldInputGroup.click();
    }

    /**
     * Click the column select for the expression that is currently in edit mode.
     */
    public static clickQueryBuilderColumnSelect(fix: ComponentFixture<any>, level = 0) {
        const columnInputGroup = QueryBuilderFunctions.getQueryBuilderColumnSelect(fix, level).querySelector('igx-input-group') as HTMLElement;
        columnInputGroup.click();
    }

    /**
     * Click the operator select for the expression that is currently in edit mode.
     */
    public static clickQueryBuilderOperatorSelect(fix: ComponentFixture<any>, level = 0) {
        const operatorInputGroup = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix, level).querySelector('igx-input-group') as HTMLElement
        operatorInputGroup.click();
    }

    /**
     * Click the value input for the expression that is currently in edit mode.
     * (NOTE: The value input could be either an input group or a date picker.)
     */
    public static clickQueryBuilderValueInput(fix: ComponentFixture<any>, dateType = false) {
        // Could be either an input group or a date picker.
        const valueInput = QueryBuilderFunctions.getQueryBuilderValueInput(fix, dateType) as HTMLElement;
        valueInput.click();
    }

    /**
     * Click the the select dropdown's element that is positioned at the specified 'index'.
     * (NOTE: This method presumes that the select dropdown is already opened.)
     */
    public static clickQueryBuilderSelectDropdownItem(queryBuilderElement: HTMLElement, index: number) {
        const selectDropdownItems = Array.from(QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement));
        const item = selectDropdownItems[index] as HTMLElement;
        item.click();
    }

    /**
     * Click the commit button of the expression that is currently in edit mode.
     */
    public static clickQueryBuilderExpressionCommitButton(fix: ComponentFixture<any>, level = 0) {
        const commitButton = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix, level);
        commitButton.click();
    }

    /**
     * (Double)Click the underlying chip of the expression that is located on the provided 'path'.
     */
    public static clickQueryBuilderTreeExpressionChip(fix: ComponentFixture<any>, path: number[], level = 0) {
        const chip = QueryBuilderFunctions.getQueryBuilderTreeExpressionChip(fix, path, level) as HTMLElement;

        chip.click();
    }

    /**
     * Click the remove icon of the expression that is located on the provided 'path'.
     */
    public static clickQueryBuilderTreeExpressionChipRemoveIcon(fix: ComponentFixture<any>, path: number[]) {
        const chip = QueryBuilderFunctions.getQueryBuilderTreeExpressionChip(fix, path) as HTMLElement;
        ControlsFunction.clickChipRemoveButton(chip);
    }

    /**
     * Click the specified icon (add, close) of the expression that is located on the provided 'path'.
     */
    public static clickQueryBuilderTreeExpressionChipIcon(fix: ComponentFixture<any>, path: number[], iconType: string) {
        const chipIcon = QueryBuilderFunctions.getQueryBuilderTreeExpressionIcon(fix, path, iconType);
        chipIcon.click();
    }

    /*
    * Hit a keyboard button upon element, wait for the desired time and detect changes
    */
    //TODO maybe move to more commonly used class
    public static hitKeyUponElementAndDetectChanges(fix: ComponentFixture<any>, key: string, elem: HTMLElement, waitT: number = null) {
        UIInteractions.triggerKeyDownEvtUponElem(key, elem, true);
        tick(waitT);
        fix.detectChanges();
    }

    /**
     * Verifies the type of the operator line ('and' or 'or').
     * (NOTE: The 'operator' argument must be a string with a value that is either 'and' or 'or'.)
     */
    public static verifyOperatorLine(operatorLine: HTMLElement, operator: string) {
        expect(operator === 'and' || operator === 'or').toBe(true, 'operator must be \'and\' or \'or\'');

        if (operator === 'and') {
            expect(operatorLine.classList.contains(QueryBuilderConstants.QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS)).toBe(true, 'incorrect operator line');
            expect(operatorLine.classList.contains(QueryBuilderConstants.QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS)).toBe(false, 'incorrect operator line');
        } else {
            expect(operatorLine.classList.contains(QueryBuilderConstants.QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS)).toBe(false, 'incorrect operator line');
            expect(operatorLine.classList.contains(QueryBuilderConstants.QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS)).toBe(true, 'incorrect operator line');
        }
    }

    public static verifyEditModeQueryExpressionInputStates(fix,
        entitySelectEnabled: boolean,
        fieldComboEnabled: boolean,
        columnSelectEnabled?: boolean,
        operatorSelectEnabled?: boolean,
        valueInputEnabled?: boolean,
        commitButtonEnabled?: boolean,
        level = 0) {
        // Verify the entity select state.
        const entityInputGroup = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix, level).querySelector('igx-input-group');
        expect(!entityInputGroup.classList.contains('igx-input-group--disabled')).toBe(entitySelectEnabled,
            'incorrect entity select state');
        // Verify the fields combo state.
        const fieldInputGroup = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix, level).querySelector('igx-input-group');
        expect(!fieldInputGroup.classList.contains('igx-input-group--disabled')).toBe(fieldComboEnabled,
            'incorrect fields combo state');

        if (columnSelectEnabled || operatorSelectEnabled || valueInputEnabled || commitButtonEnabled) {
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, columnSelectEnabled, operatorSelectEnabled, valueInputEnabled, commitButtonEnabled, level);
        }
    };

    public static verifyEditModeExpressionInputStates(fix,
        columnSelectEnabled: boolean,
        operatorSelectEnabled: boolean,
        valueInputEnabled: boolean,
        commitButtonEnabled: boolean,
        level = 0) {
        // Verify the column select state.
        const columnInputGroup = QueryBuilderFunctions.getQueryBuilderColumnSelect(fix, level).querySelector('igx-input-group');
        expect(!columnInputGroup.classList.contains('igx-input-group--disabled')).toBe(columnSelectEnabled,
            'incorrect column select state');

        // Verify the operator select state.
        const operatorInputGroup = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix, level).querySelector('igx-input-group');
        expect(!operatorInputGroup.classList.contains('igx-input-group--disabled')).toBe(operatorSelectEnabled,
            'incorrect operator select state');

        // Verify the value input state.
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false, level);
        const valueInputGroup = Array.from(editModeContainer.querySelectorAll('igx-input-group'))[2];
        expect(!valueInputGroup.classList.contains('igx-input-group--disabled')).toBe(valueInputEnabled,
            'incorrect value input state');

        // Verify commit expression button state
        const commitButton = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix, level);
        ControlsFunction.verifyButtonIsDisabled(commitButton, !commitButtonEnabled);

        // Verify close expression button is enabled.
        const closeButton = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix, level);
        ControlsFunction.verifyButtonIsDisabled(closeButton, false);
    };

    public static verifyQueryEditModeExpressionInputValues(fix,
        entityText: string,
        fieldsText: string,
        columnText?: string,
        operatorText?: string,
        valueText?: string,
        level = 0) {
        const entityInput = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix, level).querySelector('input');
        const fieldInput = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix, level).querySelector('input');
        expect(entityInput.value).toBe(entityText);
        expect(fieldInput.value).toBe(fieldsText);

        if (columnText || operatorText || valueText) {
            QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, columnText, operatorText, valueText, level);
        }
    };

    public static verifyEditModeExpressionInputValues(fix,
        columnText: string,
        operatorText: string,
        valueText: string,
        level = 0) {
        const columnInput = QueryBuilderFunctions.getQueryBuilderColumnSelect(fix, level).querySelector('input');
        const operatorInput = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix, level).querySelector('input');
        const valueInput = QueryBuilderFunctions.getQueryBuilderValueInput(fix, false, level).querySelector('input') as HTMLInputElement;
        expect(columnInput.value).toBe(columnText);
        expect(operatorInput.value).toBe(operatorText);
        expect(valueInput.value).toBe(valueText);
    };

    public static verifyQueryBuilderTabbableElements = (fixture: ComponentFixture<any>) => {
        const tabElements = QueryBuilderFunctions.getTabbableElements(fixture.nativeElement);

        let i = 0;
        tabElements.forEach((element: HTMLElement) => {
            switch (i) {
                case 0: expect(element).toHaveClass('igx-input-group__input'); break;
                case 1: expect(element).toHaveClass('igx-input-group__input'); break;
                case 2: expect(element).toHaveClass('igx-button');
                    expect(element.innerText).toContain('and'); break;
                case 3: expect(element).toHaveClass('igx-chip'); break;
                case 4: expect(element).toHaveClass('igx-icon'); break;
                case 5: expect(element).toHaveClass('igx-chip__remove'); break;
                case 6: expect(element).toHaveClass('igx-chip'); break;
                case 7: expect(element).toHaveClass('igx-icon'); break;
                case 8: expect(element).toHaveClass('igx-chip__remove'); break;
                case 9: expect(element).toHaveClass('igx-chip'); break;
                case 10: expect(element).toHaveClass('igx-icon'); break;
                case 11: expect(element).toHaveClass('igx-chip__remove'); break;
                case 12: expect(element).toHaveClass('igx-button');
                    expect(element.innerText).toContain('Condition'); break;
                case 13: expect(element).toHaveClass('igx-button');
                    expect(element.innerText).toContain('Group'); break;
            }
            i++;
        });
    };

    public static verifyTabbableChipActions = (chipActions: DebugElement) => {
        const tabElements = QueryBuilderFunctions.getTabbableElements(chipActions.nativeElement);

        let i = 0;
        tabElements.forEach((element: HTMLElement) => {
            switch (i) {
                case 0: expect(element.firstChild).toHaveClass('igx-icon');
                    expect(element.firstChild.textContent).toContain('add');
                    break;
            }
            i++;
        });
    };

    public static verifyFocusedChip = (columnText: string, conditionText: string, valueText?: string) => {
        expect(document.activeElement.tagName).toEqual('IGX-CHIP');
        const chipElement = document.activeElement;
        expect((chipElement.querySelector('.igx-filter-tree__expression-column') as HTMLElement).innerText).toEqual(columnText);
        expect((chipElement.querySelector('.igx-filter-tree__expression-condition') as HTMLElement).innerText).toEqual(conditionText);

        if (valueText) {
            expect((chipElement.querySelector('.igx-chip__content') as HTMLElement).innerText).toEqual(valueText);
        }
    }

    public static verifyTabbableConditionEditLineElements = (editLine: DebugElement) => {
        const tabElements = QueryBuilderFunctions.getTabbableElements(editLine.nativeElement);

        let i = 0;
        tabElements.forEach((element: HTMLElement) => {
            switch (i) {
                case 0: expect(element).toHaveClass('igx-input-group__input'); break;
                case 1: expect(element).toHaveClass('igx-input-group__input'); break;
                case 2: expect(element).toHaveClass('igx-icon-button'); break;
                case 3: expect(element).toHaveClass('igx-icon-button'); break;
            }
            i++;
        });
    };

    public static verifyTabbableInConditionDialogElements = (editDialog: DebugElement) => {
        const tabElements = QueryBuilderFunctions.getTabbableElements(editDialog.nativeElement);

        let i = 0;
        tabElements.forEach((element: HTMLElement) => {
            switch (i) {
                case 0: expect(element).toHaveClass('igx-input-group__input'); break;
                case 1: expect(element).toHaveClass('igx-input-group__input'); break;
                case 2: expect(element).toHaveClass('igx-button'); break;
                case 3: expect(element).toHaveClass('igx-chip'); break;
                case 4: expect(element).toHaveClass('igx-icon'); break;
                case 5: expect(element).toHaveClass('igx-chip__remove'); break;
                case 6: expect(element).toHaveClass('igx-chip'); break;
                case 7: expect(element).toHaveClass('igx-icon'); break;
                case 8: expect(element).toHaveClass('igx-chip__remove'); break;
                case 9: expect(element).toHaveClass('igx-button');
                    expect(element.innerText).toContain('Condition');
                    break;
                case 10: expect(element).toHaveClass('igx-button');
                    expect(element.innerText).toContain('Group');
                    break;
            }
            i++;
        });
    };

    public static verifyExpressionChipContent(fix, path: number[], columnText: string, operatorText: string, valueText = undefined, level = 0) {
        const chip = QueryBuilderFunctions.getQueryBuilderTreeExpressionChip(fix, path, level);
        const chipSpans = Array.from(chip.querySelectorAll('span'));
        const columnSpan = chipSpans[0];
        const operatorSpan = chipSpans[1];
        const valueSpan = chipSpans[2];
        expect(columnSpan.textContent.toLowerCase().trim()).toBe(columnText.toLowerCase(), 'incorrect chip column');
        expect(operatorSpan.textContent.toLowerCase().trim()).toBe(operatorText.toLowerCase(), 'incorrect chip operator');
        if (valueSpan != undefined && valueText != undefined) {
            expect(valueSpan.textContent.toLowerCase().trim().replaceAll(/\s/g, '')).toBe(valueText.toLowerCase().replaceAll(/\s/g, ''), 'incorrect chip filter value');
        }
    };

    public static verifyGroupLineCount(fix: ComponentFixture<any>, andLineCount: number = null, orLineCount: number = null) {
        const andLines = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS}`));
        const orLines = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS}`));

        if (andLineCount) expect(andLines.length).toBe(andLineCount, "AND groups not the right count");
        if (orLineCount) expect(orLines.length).toBe(orLineCount, "OR groups not the right count");
    };

    public static verifyRootAndSubGroupExpressionsCount(fix: ComponentFixture<any>, rootDirect: number, rootTotal: number = null, subGroupPath: number[] = null, subGroupDirect: number = null, subGroupTotal: number = null) {
        const rootGroup = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
        expect(rootGroup).not.toBeNull('There is no root group.');
        expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup, true).length).toBe(rootDirect, 'Root direct condition count not correct');
        expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup, false).length).toBe(rootTotal, 'Root direct + child condition count not correct');
        if (subGroupPath) {
            const subGroup = QueryBuilderFunctions.getQueryBuilderTreeItem(fix, subGroupPath) as HTMLElement;
            if (subGroupDirect) expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(subGroup, true).length).toBe(subGroupDirect, 'Child direct condition count not correct');
            if (subGroupTotal) expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(subGroup, false).length).toBe(subGroupTotal, 'Child direct + child condition count not correct');
        }
    };

    public static selectEntityInEditModeExpression(fix: ComponentFixture<any>, dropdownItemIndex: number, level = 0) {
        QueryBuilderFunctions.clickQueryBuilderEntitySelect(fix, level);
        fix.detectChanges();

        const outlet = Array.from(fix.debugElement.nativeElement.querySelectorAll(`.igx-drop-down__list-scroll`)).filter(item => (item as HTMLElement).checkVisibility())[0];
        const item = Array.from((outlet as HTMLElement).querySelectorAll('.igx-drop-down__item'))[dropdownItemIndex] as HTMLElement;
        UIInteractions.simulateClickAndSelectEvent(item)
        tick();
        fix.detectChanges();
    }

    public static selectFieldsInEditModeExpression(fix, deselectItemIndexes, level = 0) {
        QueryBuilderFunctions.clickQueryBuilderFieldsCombo(fix, level);
        fix.detectChanges();

        const outlet = Array.from(fix.debugElement.nativeElement.querySelectorAll(`.igx-drop-down__list-scroll`)).filter(item => (item as HTMLElement).checkVisibility())[0];
        deselectItemIndexes.forEach(index => {
            const item = Array.from((outlet as HTMLElement).querySelectorAll('.igx-drop-down__item'))[index] as HTMLElement;
            UIInteractions.simulateClickAndSelectEvent(item)
            tick();
            fix.detectChanges();
        });

        if (level == 0) {
            //close combo drop-down
            QueryBuilderFunctions.clickQueryBuilderFieldsCombo(fix);
            fix.detectChanges();
        }
    }

    public static selectColumnInEditModeExpression(fix, dropdownItemIndex: number, level = 0) {
        QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix, level);
        fix.detectChanges();

        const searchClass = `${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-${level}`
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${searchClass}`))[0].nativeElement;
        QueryBuilderFunctions.clickQueryBuilderSelectDropdownItem(queryBuilderElement, dropdownItemIndex);
        tick();
        fix.detectChanges();
    }

    public static selectOperatorInEditModeExpression(fix, dropdownItemIndex: number, level = 0) {
        QueryBuilderFunctions.clickQueryBuilderOperatorSelect(fix, level);
        fix.detectChanges();
        const searchClass = `${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-${level}`
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${searchClass}`))[0].nativeElement;
        QueryBuilderFunctions.clickQueryBuilderSelectDropdownItem(queryBuilderElement, dropdownItemIndex);
        tick();
        fix.detectChanges();
        tick(100);
        fix.detectChanges();
    }

    public static addAndValidateChildGroup(fix: ComponentFixture<any>, level: number) {
        // Enter values in the nested query
        QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0, level); // Select 'Products' entity
        tick(100);
        fix.detectChanges();

        // Select return field
        QueryBuilderFunctions.selectFieldsInEditModeExpression(fix, [0], level);
        tick(100);
        fix.detectChanges();

        // Click the initial 'Add Condition' button.
        QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, level);
        tick(100);
        fix.detectChanges();

        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, false, false, false, false, level);

        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, false, false, false, level);

        QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1, level); // Select 'ProductName' column.

        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, true, false, level);

        QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0, level); // Select 'Contains' operator.

        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, true, false, level);

        const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, false, level).querySelector('input');
        UIInteractions.clickAndSendInputElementValue(input, 'a');
        tick(100);
        fix.detectChanges();

        // Verify all inputs
        QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, true, level - 1); // Parent commit button should be disabled
        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, true, true, level);
        QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Products', 'Id', 'ProductName', 'Contains', 'a', level);

        //Commit the populated expression.
        QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix, level);
        fix.detectChanges();
    }

    public static selectEntityAndClickInitialAddCondition(fix: ComponentFixture<any>, entityIndex: number, groupIndex = 0) {
        QueryBuilderFunctions.selectEntityInEditModeExpression(fix, entityIndex);
        tick(100);
        fix.detectChanges();

        // Click the initial 'Add Condition' button.
        QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, groupIndex);
        tick(100);
        fix.detectChanges();
    }

    public static GetChipsContentAsArray(fix: ComponentFixture<any>) {
        const contents: string[] = [];

        const queryTreeElement: HTMLElement = fix.debugElement.queryAll(By.css(QueryBuilderConstants.QUERY_BUILDER_TREE))[0].nativeElement;

        queryTreeElement.querySelectorAll('.igx-chip').forEach(chip => {
            contents.push(QueryBuilderFunctions.getChipContent(chip));
        });

        return contents;
    }

    public static getChipContent(chip: Element): string {
        if (chip.checkVisibility()) {
            let text: string = '';

            Array.from(chip.querySelectorAll('span')).forEach(element => {
                if (element?.textContent) text += element.textContent;
            });

            return text.trim();
        }
    }


    public static getVisibleChips(fixture: ComponentFixture<any>): DebugElement[] {
        return fixture.debugElement.queryAll(By.directive(IgxChipComponent)).filter(chip => chip.nativeElement.offsetHeight > 0);
    }

    public static getDropGhost(fixture: ComponentFixture<any>): Element {
        var expressionsContainer = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fixture);
        return expressionsContainer.querySelector('div.igx-filter-tree__expression-item-drop-ghost');
    }

    public static getDropGhostBounds(fixture: ComponentFixture<any>): DOMRect {
        return QueryBuilderFunctions.getDropGhost(fixture)?.getBoundingClientRect();
    }

    public static getElementCenter(element: HTMLElement) {
        const bounds = element.getBoundingClientRect();
        return {
            X: (bounds.left + bounds.right) / 2,
            Y: (bounds.top + bounds.bottom) / 2
        }
    }

    public static dragMove(dragDirective, X: number, Y: number, pointerUp?: boolean) {
        //mouse down
        dragDirective.onPointerMove({ pointerId: 1, pageX: X, pageY: Y });
        //duplicate the mousemove as dispatched Event, so we can trigger the RxJS listener
        dragDirective.ghostElement.dispatchEvent(new MouseEvent('mousemove', { clientX: X, clientY: Y }));

        //mouse up
        if (pointerUp) {
            wait();
            dragDirective.onPointerUp({ pointerId: 1, pageX: X, pageY: Y });
        }
    }
}
