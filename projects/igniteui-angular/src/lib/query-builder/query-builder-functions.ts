import { DebugElement } from '@angular/core';
import { ComponentFixture, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FilteringExpressionsTree, FilteringLogic, IgxStringFilteringOperand, IgxBooleanFilteringOperand, IgxNumberFilteringOperand, IgxIconComponent, IgxDateFilteringOperand } from 'igniteui-angular';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { UIInteractions } from '../test-utils/ui-interactions.spec';

const QUERY_BUILDER_CLASS = 'igx-query-builder';
const QUERY_BUILDER_HEADER = 'igx-query-builder__header';
const QUERY_BUILDER_TREE = 'igx-query-builder-tree';
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
        tree.filteringOperands.push({
            field: 'OrderDate',
            condition: IgxDateFilteringOperand.instance().condition('after'),
            conditionName: 'after',
            searchVal: new Date()
        });
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
    public static getQueryBuilderExpressionsContainer(fix: ComponentFixture<any>, level = 0) {
        const searchClass = level === 0 ? QUERY_BUILDER_CLASS : `${QUERY_BUILDER_TREE}--level-${level}`
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${searchClass}`))[0].nativeElement;
        const exprContainer = queryBuilderElement.querySelector('.igx-query-builder__main');
        return exprContainer;
    }

    public static clickQueryBuilderInitialAddGroupButton(fix: ComponentFixture<any>, buttonIndex: number, level = 0) {
        const exprContainer = this.getQueryBuilderExpressionsContainer(fix, level);
        const andOrAddGroupButton = exprContainer.querySelectorAll('button')[buttonIndex] as HTMLElement;
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

    public static getQueryBuilderEditModeContainer(fix: ComponentFixture<any>, entityContainer = true, level = 0) {
        const exprContainer = QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix, level);
        const editModeContainers = Array.from(exprContainer.querySelectorAll('.igx-filter-tree__inputs'));
        const entityEditModeContainer = editModeContainers.find(container => container.querySelector('igx-combo'));
        const conditionEditModeContainer = editModeContainers.find(container => container.querySelector('igx-select') && !container.querySelector('igx-combo'));
        return entityContainer ? entityEditModeContainer : conditionEditModeContainer;
    }

    public static getQueryBuilderEntitySelect(fix: ComponentFixture<any>, level = 0) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, true, level);
        const entitySelect = editModeContainer.querySelector('igx-select');
        return entitySelect;
    }

    public static getQueryBuilderFieldsCombo(fix: ComponentFixture<any>, level = 0) {
        const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, true, level);
        const fieldCombo = editModeContainer.querySelector('igx-combo');
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
            return icon.name === 'check';
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

    public static getQueryBuilderCalendar(fix: ComponentFixture<any>) {
        const calendar = fix.debugElement.queryAll(By.css(`.igx-calendar`))[0].nativeElement;
        return calendar;
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
        commitButtonEnabled: boolean,
        level = 0) {
        // Verify the entity select state.
        const entityInputGroup = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix, level).querySelector('igx-input-group');
        expect(!entityInputGroup.classList.contains('igx-input-group--disabled')).toBe(entitySelectEnabled,
            'incorrect entity select state');
        // Verify the fields combo state.
        const fieldInputGroup = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix, level).querySelector('igx-input-group');
        expect(!fieldInputGroup.classList.contains('igx-input-group--disabled')).toBe(fieldComboEnabled,
            'incorrect fields combo state');

        QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, columnSelectEnabled, operatorSelectEnabled, valueInputEnabled, commitButtonEnabled, level);
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
        columnText: string,
        operatorText: string,
        valueText: string,
        level = 0) {
        const entityInput = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix, level).querySelector('input');
        const fieldInput = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix, level).querySelector('input');
        QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, columnText, operatorText, valueText, level);
        expect(entityInput.value).toBe(entityText);
        expect(fieldInput.value).toBe(fieldsText);
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

    public static verifyGroupContextMenuVisibility = (fix: ComponentFixture<any>, shouldBeVisible: boolean) => {
        if (shouldBeVisible) {
            const wrapper = fix.debugElement.queryAll(By.css('.igx-overlay__wrapper'));
            expect(wrapper.length).toBeGreaterThan(0, 'context menu wrapper missing');
            const contextMenu = wrapper[0].nativeElement.querySelector('.igx-filter-contextual-menu');
            const contextMenuRect = contextMenu.getBoundingClientRect();
            expect(contextMenu.classList.contains('igx-toggle--hidden')).toBe(false, 'incorrect context menu visibility');
            expect(contextMenuRect.width === 0 && contextMenuRect.height === 0).toBe(false, 'incorrect context menu dimensions');
        } else {
            const wrapper = fix.debugElement.queryAll(By.css('.igx-overlay__wrapper'));
            expect(wrapper.length).toBeLessThanOrEqual(0);
        }
    };

    public static verifyChipSelectedState = (chip: DebugElement, shouldBeSelected: boolean) => {
        if (shouldBeSelected)
            expect(chip.attributes['ng-reflect-selected'] === 'true').toBeTruthy("Chip should have been selected");
        else
            expect(chip.attributes['ng-reflect-selected'] === 'true').toBeFalsy("Chip should have been deselected");
    };

    public static verifyQueryBuilderTabbableElements = (fixture: ComponentFixture<any>) => {
        const tabElements = QueryBuilderFunctions.getTabbableElements(fixture.nativeElement);

            let i = 0;
            tabElements.forEach((element: HTMLElement) => {
                switch (i) {
                    case 0: expect(element).toHaveClass('igx-filter-tree__line--and'); break;
                    case 1: expect(element).toHaveClass('igx-input-group__input'); break;
                    case 2: expect(element).toHaveClass('igx-input-group__input'); break;
                    case 3: expect(element).toHaveClass('igx-chip'); break;
                    case 4: expect(element).toHaveClass('igx-chip__remove'); break;
                    case 5: expect(element).toHaveClass('igx-chip'); break;
                    case 6: expect(element).toHaveClass('igx-chip__remove'); break;
                    case 7: expect(element).toHaveClass('igx-chip'); break;
                    case 8: expect(element).toHaveClass('igx-chip__remove'); break;
                    case 9: expect(element).toHaveClass('igx-button');
                        expect(element.innerText).toContain('Condition'); break;
                    case 10: expect(element).toHaveClass('igx-button');
                        expect(element.innerText).toContain('"And" Group'); break;
                    case 11: expect(element).toHaveClass('igx-button');
                        expect(element.innerText).toContain('"Or" Group'); break;
                }
                i++;
            });
    };

    public static verifyTabbableChipActions = (chipActions: DebugElement) => {
        const tabElements = QueryBuilderFunctions.getTabbableElements(chipActions.nativeElement);

        let i = 0;
        tabElements.forEach((element: HTMLElement) => {                
            switch(i){
                case 0: expect(element).toHaveClass('igx-icon'); 
                        expect(element.innerText).toContain('edit');
                break;
                case 1: expect(element).toHaveClass('igx-icon'); 
                        expect(element.innerText).toContain('add');
                break;
                }
            i++;
        });
    };

    public static verifyTabbableConditionEditLineElements = (editLine: DebugElement) => {
        const tabElements = QueryBuilderFunctions.getTabbableElements(editLine.nativeElement);

        let i = 0;
        tabElements.forEach((element: HTMLElement) => {                
            switch(i){
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
            switch(i){
                case 0: expect(element).toHaveClass('igx-filter-tree__line--and'); break;
                case 1: expect(element).toHaveClass('igx-input-group__input'); break;
                case 2: expect(element).toHaveClass('igx-input-group__input'); break;
                case 3: expect(element).toHaveClass('igx-chip'); break;
                case 4: expect(element).toHaveClass('igx-chip__remove'); break;
                case 5: expect(element).toHaveClass('igx-chip'); break;
                case 6: expect(element).toHaveClass('igx-chip__remove'); break;
                case 7: expect(element).toHaveClass('igx-button');
                        expect(element.innerText).toContain('Condition'); 
                        break;
                case 8: expect(element).toHaveClass('igx-button');
                        expect(element.innerText).toContain('"And" Group'); 
                        break;
                case 9: expect(element).toHaveClass('igx-button');
                        expect(element.innerText).toContain('"Or" Group'); 
                        break;
            }
            i++;
        });
    };
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

    /*
    * Hit a keyboard button upon element, wait for the desired time and detect changes
    */
    //TODO maybe move to more commonly used class
    public static hitKeyUponElementAndDetectChanges(fix: ComponentFixture<any>, key: string, elem: DebugElement, wait: number = null) {
        UIInteractions.triggerKeyDownEvtUponElem(key, elem.nativeElement, true);
        tick(wait);
        fix.detectChanges();
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
        //close combo drop-down
        QueryBuilderFunctions.clickQueryBuilderFieldsCombo(fix);
        fix.detectChanges();
    }

    public static selectColumnInEditModeExpression(fix, dropdownItemIndex: number, level = 0) {
        QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix, level);
        fix.detectChanges();

        const searchClass = level === 0 ? QUERY_BUILDER_CLASS : `${QUERY_BUILDER_TREE}--level-${level}`
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${searchClass}`))[0].nativeElement;
        QueryBuilderFunctions.clickQueryBuilderSelectDropdownItem(queryBuilderElement, dropdownItemIndex);
        tick();
        fix.detectChanges();
    }

    public static selectOperatorInEditModeExpression(fix, dropdownItemIndex: number, level = 0) {
        QueryBuilderFunctions.clickQueryBuilderOperatorSelect(fix, level);
        fix.detectChanges();
        const searchClass = level === 0 ? QUERY_BUILDER_CLASS : `${QUERY_BUILDER_TREE}--level-${level}`
        const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${searchClass}`))[0].nativeElement;
        QueryBuilderFunctions.clickQueryBuilderSelectDropdownItem(queryBuilderElement, dropdownItemIndex);
        tick();
        fix.detectChanges();
    }

    public static addChildGroup(fix: ComponentFixture<any>, groupType: number, level: number) {
        // Click the initial 'Add Or Group' button.
        QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, groupType, level);
        tick(100);
        fix.detectChanges();

        QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0, level); // Select 'Products' entity
        tick(100);
        fix.detectChanges();

        QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1, level); // Select 'ProductName' column.
        QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0, level); // Select 'Contains' operator.
        const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, false, level).querySelector('input');
        UIInteractions.clickAndSendInputElementValue(input, 'a');
        tick(100);
        fix.detectChanges();

        //Commit the populated expression.
        QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix, level);
        fix.detectChanges();
    }

    public static addAndValidateChildGroup(fix: ComponentFixture<any>, groupType: number, level: number) {
        // Click the initial 'Add Or Group' button.
        QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, groupType, level);
        tick(100);
        fix.detectChanges();

        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, false, false, false, false, false, level);
        // Enter values in the nested query
        QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0, level); // Select 'Products' entity
        tick(100);
        fix.detectChanges();

        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, false, false, false, level);

        QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1, level); // Select 'ProductName' column.

        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, false, false, level);

        QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0, level); // Select 'Contains' operator.

        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, true, false, level);

        const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, false, level).querySelector('input');
        UIInteractions.clickAndSendInputElementValue(input, 'a');
        tick(100);
        fix.detectChanges();

        // Verify all inputs
        QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, false, level - 1); // Parent commit button should be disabled
        QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, true, true, level);
        QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Products', 'Id, ProductName, OrderId, Released', 'ProductName', 'Contains', 'a', level);

        //Commit the populated expression.
        QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix, level);
        fix.detectChanges();
    }
}
