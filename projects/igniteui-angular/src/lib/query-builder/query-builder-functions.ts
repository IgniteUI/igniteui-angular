import { DebugElement } from '@angular/core';
import { ComponentFixture, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FilteringExpressionsTree, FilteringLogic, IgxStringFilteringOperand, IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxIconComponent } from 'igniteui-angular';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { UIInteractions } from '../test-utils/ui-interactions.spec';

const QUERY_BUILDER_CLASS = 'igx-query-builder';
const QUERY_BUILDER_HEADER = 'igx-query-builder__header';
const QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS = 'igx-filter-tree__line--and';
const QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS = 'igx-filter-tree__line--or';
const QUERY_BUILDER_OPERATOR_LINE_SELECTED_CSS_CLASS = 'igx-filter-tree__line--selected';
const CSS_CLASS_DROPDOWN_LIST_SCROLL = 'igx-drop-down__list-scroll';

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

    public static getQueryBuilderHeader(fix: ComponentFixture<any>) {
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
        const header = queryBuilderElement.querySelector(`.${QUERY_BUILDER_HEADER}`);
        return header;
    }

    public static getQueryBuilderHeaderText(fix: ComponentFixture<any>) {
        const header = QueryBuilderFunctions.getQueryBuilderHeader(fix);
        const title = header.querySelector('.ig-typography__h6');
        return title.textContent;
    }

    public static getQueryBuilderHeaderLegendItemAnd(fix: ComponentFixture<any>) {
        const header = QueryBuilderFunctions.getQueryBuilderHeader(fix);
        const andLegendItem = header.querySelector('.igx-builder-legend__item--and');
        return andLegendItem;
    }

    public static getQueryBuilderHeaderLegendItemOr(fix: ComponentFixture<any>) {
        const header = QueryBuilderFunctions.getQueryBuilderHeader(fix);
        const orLegendItem = header.querySelector('.igx-builder-legend__item--or');
        return orLegendItem;
    }

    /**
     * Get the expressions container that contains all groups and expressions.
     */
    public static getQueryBuilderExpressionsContainer(fix: ComponentFixture<any>) {
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
        const exprContainer = queryBuilderElement.querySelector('.igx-query-builder__main');
        return exprContainer;
    }

    public static clickQueryBuilderInitialAddGroupButton(fix: ComponentFixture<any>, buttonIndex: number) {
        const exprContainer = this.getQueryBuilderExpressionsContainer(fix);
        const andOrAddGroupButton = exprContainer.querySelectorAll(':scope > button')[buttonIndex] as HTMLElement;
        andOrAddGroupButton.click();
    }

    public static getQueryBuilderAllGroups(fix: ComponentFixture<any>): any[] {
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
        const allGroups = Array.from(QueryBuilderFunctions.getQueryBuilderTreeChildGroups(queryBuilderElement, false));
        return allGroups;
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

    public static getQueryBuilderEditModeContainer(fix: ComponentFixture<any>, entityContainer = true) {
        const exprContainer = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix);
        const editModeContainers = Array.from(exprContainer.querySelectorAll('.igx-filter-tree__inputs'));
        const entityEditModeContainer = editModeContainers.find(container => container.querySelector('igx-combo'));
        const conditionEditModeContainer = editModeContainers.find(container => container.querySelector('igx-select') && !container.querySelector('igx-combo'));
        return entityContainer ? entityEditModeContainer : conditionEditModeContainer;
    }

    public static getQueryBuilderEntitySelect(fix: ComponentFixture<any>) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix);
        const entitySelect = editModeContainer.querySelector('igx-select');
        return entitySelect;
    }

    public static getQueryBuilderFieldsCombo(fix: ComponentFixture<any>) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix);
        const fieldCombo = editModeContainer.querySelector('igx-combo');
        return fieldCombo;
    }

    public static getQueryBuilderColumnSelect(fix: ComponentFixture<any>) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false);
        const selects = Array.from(editModeContainer.querySelectorAll('igx-select'));
        const columnSelect = selects[0];
        return columnSelect;
    }

    public static getQueryBuilderOperatorSelect(fix: ComponentFixture<any>) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false);
        const selects = Array.from(editModeContainer.querySelectorAll('igx-select'));
        const operatorSelect = selects[1];
        return operatorSelect;
    }

    public static getQueryBuilderValueInput(fix: ComponentFixture<any>, dateType = false) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false);
        const input = dateType ?
            editModeContainer.querySelector('igx-date-picker').querySelector('input') :
            Array.from(editModeContainer.querySelectorAll('igx-input-group'))[2];
        return input;
    }

    public static getQueryBuilderExpressionCommitButton(fix: ComponentFixture<any>) {
        const actionButtons = fix.debugElement.queryAll(By.css('.igx-filter-tree__inputs-actions > button'));
        const commitButton = actionButtons.find((el: DebugElement) => {
            const icon = el.query(By.directive(IgxIconComponent)).componentInstance;
            return icon.name === 'check';
        }).nativeElement;

        return commitButton;
    }

    public static getQueryBuilderExpressionCloseButton(fix: ComponentFixture<any>) {
        const actionButtons = fix.debugElement.queryAll(By.css('.igx-filter-tree__inputs-actions > button'));
        const closeButton = actionButtons.find((el: DebugElement) => {
            const icon = el.query(By.directive(IgxIconComponent)).componentInstance;
            return icon.name === 'close';
        }).nativeElement;

        return closeButton;
    }

    /**
     * Get the adding buttons and the cancel button of the root group by specifying the
     * index position of the buttons container.
     */
    public static getQueryBuilderTreeRootGroupButtons(fix: ComponentFixture<any>, buttonsIndex: number) {
        const group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
        const childrenContainer = group.querySelector('.igx-filter-tree__expression');
        const buttonsContainers = Array.from(childrenContainer.querySelectorAll(':scope > .igx-filter-tree__buttons'));
        const buttonsContainer: any = buttonsContainers[buttonsIndex];
        const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
        return buttons;
    }

    public static getQueryBuilderOutlet(queryBuilderElement: HTMLElement) {
        const outlet = queryBuilderElement.querySelector('.igx-query-builder__outlet');
        return outlet;
    }

    public static getQueryBuilderSelectDropdown(queryBuilderElement: HTMLElement) {
        const outlet = QueryBuilderFunctions.getQueryBuilderOutlet(queryBuilderElement);
        const selectDropdown = outlet.querySelector(`.${CSS_CLASS_DROPDOWN_LIST_SCROLL}`);
        return selectDropdown;
    }

    public static getQueryBuilderSelectDropdownItems(queryBuilderElement: HTMLElement) {
        const selectDropdown = QueryBuilderFunctions.getQueryBuilderSelectDropdown(queryBuilderElement);
        const items = Array.from(selectDropdown.querySelectorAll('.igx-drop-down__item'));
        return items;
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

    public static verifyEditModeQueryExpressionInputStates(fix,
        entitySelectEnabled: boolean,
        fieldComboEnabled: boolean,
        columnSelectEnabled: boolean,
        operatorSelectEnabled: boolean,
        valueInputEnabled: boolean,
        commitButtonEnabled: boolean) {
        // Verify the entity select state.
        const entityInputGroup = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix).querySelector('igx-input-group');
        expect(!entityInputGroup.classList.contains('igx-input-group--disabled')).toBe(entitySelectEnabled,
            'incorrect entity select state');
        // Verify the fields combo state.
        const fieldInputGroup = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix).querySelector('igx-input-group');
        expect(!fieldInputGroup.classList.contains('igx-input-group--disabled')).toBe(fieldComboEnabled,
            'incorrect fields combo state');

        QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, columnSelectEnabled, operatorSelectEnabled, valueInputEnabled, commitButtonEnabled);
    };

    public static verifyEditModeExpressionInputStates(fix,
        columnSelectEnabled: boolean,
        operatorSelectEnabled: boolean,
        valueInputEnabled: boolean,
        commitButtonEnabled: boolean) {
        // Verify the column select state.
        const columnInputGroup = QueryBuilderFunctions.getQueryBuilderColumnSelect(fix).querySelector('igx-input-group');
        expect(!columnInputGroup.classList.contains('igx-input-group--disabled')).toBe(columnSelectEnabled,
            'incorrect column select state');

        // Verify the operator select state.
        const operatorInputGroup = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix).querySelector('igx-input-group');
        expect(!operatorInputGroup.classList.contains('igx-input-group--disabled')).toBe(operatorSelectEnabled,
            'incorrect operator select state');

        // Verify the value input state.
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, false);
        const valueInputGroup = Array.from(editModeContainer.querySelectorAll('igx-input-group'))[2];
        expect(!valueInputGroup.classList.contains('igx-input-group--disabled')).toBe(valueInputEnabled,
            'incorrect value input state');

        // Verify commit expression button state
        const commitButton = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
        ControlsFunction.verifyButtonIsDisabled(commitButton, !commitButtonEnabled);

        // Verify close expression button is enabled.
        const closeButton = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
        ControlsFunction.verifyButtonIsDisabled(closeButton, false);
    };

    public static verifyQueryEditModeExpressionInputValues(fix,
        entityText: string,
        fieldsText: string,
        columnText: string,
        operatorText: string,
        valueText: string) {
        const entityInput = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix).querySelector('input');
        const fieldInput = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix).querySelector('input');
        QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, columnText, operatorText, valueText);
        expect(entityInput.value).toBe(entityText);
        expect(fieldInput.value).toBe(fieldsText);
    };

    public static verifyEditModeExpressionInputValues(fix,
        columnText: string,
        operatorText: string,
        valueText: string) {
        const columnInput = QueryBuilderFunctions.getQueryBuilderColumnSelect(fix).querySelector('input');
        const operatorInput = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix).querySelector('input');
        const valueInput = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input') as HTMLInputElement;
        expect(columnInput.value).toBe(columnText);
        expect(operatorInput.value).toBe(operatorText);
        expect(valueInput.value).toBe(valueText);
    };

    
    public static verifyGroupContextMenuVisibility = (fix: ComponentFixture<any>, shouldBeVisible: boolean) => {
        if(shouldBeVisible){
            const wrapper = fix.debugElement.queryAll(By.css('.igx-overlay__wrapper'));
            expect(wrapper.length).toBeGreaterThan(0, 'context menu wrapper missing');
            const contextMenu = wrapper[0].nativeElement.querySelector('.igx-filter-contextual-menu');
            const contextMenuRect = contextMenu.getBoundingClientRect();
            expect(contextMenu.classList.contains('igx-toggle--hidden')).toBe(false, 'incorrect context menu visibility');
            expect(contextMenuRect.width === 0 && contextMenuRect.height === 0).toBe(false, 'incorrect context menu dimensions');
        }
        else {
            const wrapper = fix.debugElement.queryAll(By.css('.igx-overlay__wrapper'));
            expect(wrapper.length).toBeLessThanOrEqual(0);
        }
    };

    public static verifyChipSelectedState = (chip: DebugElement, shouldBeSelected: boolean) => {
        if(shouldBeSelected)
            expect(chip.attributes['ng-reflect-selected'] === 'true').toBeTruthy("Chip should have been selected");
        else 
            expect(chip.attributes['ng-reflect-selected'] === 'true').toBeFalsy("Chip should have been deselected");
    };

    /**
     * Click the entity select for the expression that is currently in edit mode.
     */
    public static clickQueryBuilderEntitySelect(fix: ComponentFixture<any>) {
        const entityInputGroup = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix).querySelector('igx-input-group') as HTMLElement;
        entityInputGroup.click();
    }

    /**
     * Click the fields combo for the expression that is currently in edit mode.
     */
    public static clickQueryBuilderFieldsCombo(fix: ComponentFixture<any>) {
        const fieldInputGroup = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix).querySelector('igx-input-group') as HTMLElement;
        fieldInputGroup.click();
    }

    /**
     * Click the column select for the expression that is currently in edit mode.
     */
    public static clickQueryBuilderColumnSelect(fix: ComponentFixture<any>) {
        const columnInputGroup = QueryBuilderFunctions.getQueryBuilderColumnSelect(fix).querySelector('igx-input-group') as HTMLElement;
        columnInputGroup.click();
    }

    /**
     * Click the operator select for the expression that is currently in edit mode.
     */
    public static clickQueryBuilderOperatorSelect(fix: ComponentFixture<any>) {
        const operatorInputGroup = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix).querySelector('igx-input-group') as HTMLElement
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
    public static clickQueryBuilderExpressionCommitButton(fix: ComponentFixture<any>) {
        const commitButton = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
        commitButton.click();
    }

    /*
    * Hit a keyboard button upon element, wait for the desired time and detect changes
    */
    //TODO maybe move to more commonly used class
    public static hitKeyUponElementAndDetectChanges(fix: ComponentFixture<any>, key: string, elem: DebugElement, wait: number = null){
        UIInteractions.triggerKeyDownEvtUponElem(' ', elem.nativeElement, true);
        tick(wait);
        fix.detectChanges();
    }    

    public static selectEntityInEditModeExpression(fix, dropdownItemIndex: number) {
        QueryBuilderFunctions.clickQueryBuilderEntitySelect(fix);
        fix.detectChanges();

        const outlet = fix.debugElement.query(By.css(`.igx-drop-down__list-scroll`)).nativeElement;
        const item = Array.from(outlet.querySelectorAll('.igx-drop-down__item'))[dropdownItemIndex] as HTMLElement;
        UIInteractions.simulateClickAndSelectEvent(item)
        tick();
        fix.detectChanges();
    }

    public static selectFieldsInEditModeExpression(fix, deselectItemIndexes) {
        QueryBuilderFunctions.clickQueryBuilderFieldsCombo(fix);
        fix.detectChanges();

        const outlet = fix.debugElement.queryAll(By.css(`.igx-drop-down__list-scroll`))[1].nativeElement;
        deselectItemIndexes.forEach(index => {
            const item = Array.from(outlet.querySelectorAll('.igx-drop-down__item'))[index] as HTMLElement;
            UIInteractions.simulateClickAndSelectEvent(item)
            tick();
            fix.detectChanges();
        });
        //close combo drop-down
        QueryBuilderFunctions.clickQueryBuilderFieldsCombo(fix);
        fix.detectChanges();
    }

    public static selectColumnInEditModeExpression(fix, dropdownItemIndex: number) {
        QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix);
        fix.detectChanges();

        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
        QueryBuilderFunctions.clickQueryBuilderSelectDropdownItem(queryBuilderElement, dropdownItemIndex);
        tick();
        fix.detectChanges();
    }

    public static selectOperatorInEditModeExpression(fix, dropdownItemIndex: number) {
        QueryBuilderFunctions.clickQueryBuilderOperatorSelect(fix);
        fix.detectChanges();

        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
        QueryBuilderFunctions.clickQueryBuilderSelectDropdownItem(queryBuilderElement, dropdownItemIndex);
        tick();
        fix.detectChanges();
    }
}
