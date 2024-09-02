import { waitForAsync, TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { FilteringExpressionsTree, FilteringLogic, IExpressionTree, IgxBooleanFilteringOperand, IgxChipComponent, IgxDateFilteringOperand, IgxNumberFilteringOperand, IgxQueryBuilderComponent, IgxQueryBuilderHeaderComponent, IgxStringFilteringOperand } from 'igniteui-angular';
import { configureTestSuite } from '../test-utils/configure-suite';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { QueryBuilderFunctions } from './query-builder-functions';
import { UIInteractions } from '../test-utils/ui-interactions.spec';

const QUERY_BUILDER_CLASS = 'igx-query-builder';
const QUERY_BUILDER_BODY = 'igx-query-builder__main';
const QUERY_BUILDER_TREE = 'igx-query-builder-tree';
const CHIP_SELECT_CLASS = '.igx-chip__select';
const QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS = 'igx-filter-tree__line--and';
const QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS = 'igx-filter-tree__line--or';

describe('IgxQueryBuilder', () => {
    configureTestSuite();
    let fix: ComponentFixture<IgxQueryBuiderSampleTestComponent>;
    let queryBuilder: IgxQueryBuilderComponent;
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxQueryBuilderComponent,
                IgxQueryBuiderSampleTestComponent,
                IgxQueryBuiderCustomHeaderSampleTestComponent,
                IgxQueryBuiderExprTreeSampleTestComponent
            ]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(IgxQueryBuiderSampleTestComponent);
        fix.detectChanges();
        queryBuilder = fix.componentInstance.queryBuilder;
    }));

    describe('Basic', () => {
        it('Should render empty Query Builder properly.', () => {
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
            expect(queryBuilderElement).toBeDefined();
            expect(queryBuilderElement.children.length).toEqual(2);

            expect(QueryBuilderFunctions.getQueryBuilderHeaderText(fix)).toBe(' Query Builder ');
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemAnd(fix).textContent).toBe('and');
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemOr(fix).textContent).toBe('or');
            const queryTreeElement = queryBuilderElement.children[1];
            expect(queryTreeElement).toHaveClass(QUERY_BUILDER_TREE);

            expect(queryBuilder.expressionTree).toBeUndefined();

            expect(queryTreeElement.children.length).toEqual(3);
            const bodyElement = queryTreeElement.children[0];
            expect(bodyElement).toHaveClass(QUERY_BUILDER_BODY);
            expect(bodyElement.children.length).toEqual(2);
            expect(bodyElement.children[0]).toHaveClass('igx-query-builder__root');

            const actionArea = bodyElement.children[0].querySelector('.igx-query-builder__root-actions');
            // initial add "'and'/'or' group " buttons should be displayed
            expect(actionArea.querySelectorAll(':scope > button').length).toEqual(2);
            // empty filtering tree message should be displayed
            expect(bodyElement.children[0].children[1]).toHaveClass('igx-filter-empty');
        });

        it('Should render Query Builder with innitially set expression tree properly.', () => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            const queryTreeElement: HTMLElement = fix.debugElement.queryAll(By.css(QUERY_BUILDER_TREE))[0].nativeElement;
            const bodyElement = queryTreeElement.children[0];
            expect(bodyElement).toHaveClass(QUERY_BUILDER_BODY);
            expect(bodyElement.children.length).toEqual(2);
            // initial add "'and'/'or' group " buttons and empty filtering tree message should NOT be displayed
            expect(bodyElement.querySelectorAll(':scope > button').length).toEqual(0);
            expect(bodyElement.children[0]).toHaveClass('igx-filter-tree');

            // Verify the operator line of the root group is an 'And' line.
            QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement, 'and');
            // all inputs should be displayed correctly
            const queryTreeExpressionContainer = bodyElement.children[0].children[1];
            expect(queryTreeExpressionContainer).toHaveClass('igx-filter-tree__expression');
            expect(queryTreeExpressionContainer.children[0]).toHaveClass('igx-filter-tree__inputs');
            expect(queryTreeExpressionContainer.children[0].children[0].tagName).toEqual('IGX-SELECT');
            expect(queryTreeExpressionContainer.children[0].children[1].tagName).toEqual('IGX-COMBO');

            const expressionItems = queryTreeExpressionContainer.querySelectorAll(':scope > .igx-filter-tree__expression-item');
            expect(expressionItems.length).toEqual(queryBuilder.expressionTree.filteringOperands.length);
            // entity select should have proper value
            expect(queryBuilder.queryTree.selectedEntity.name).toEqual(queryBuilder.expressionTree.entity);
            // fields input should have proper value
            expect(queryBuilder.queryTree.selectedReturnFields.length).toEqual(3);
            // nested queries should be collapsed
            const nestedQueryTrees = queryTreeExpressionContainer.querySelectorAll(QUERY_BUILDER_TREE);
            for (let i = 0; i < nestedQueryTrees.length; i++) {
                expect(nestedQueryTrees[i].checkVisibility()).toBeFalse();
            }
            // adding buttons should be enabled
            const buttons = queryTreeExpressionContainer.querySelector(':scope > .igx-filter-tree__buttons').querySelectorAll(':scope > button');
            for (let i = 0; i++; i < buttons.length) {
                ControlsFunction.verifyButtonIsDisabled(buttons[i] as HTMLElement, false);
            }
        });

        it('Should render custom header properly.', () => {
            const fixture = TestBed.createComponent(IgxQueryBuiderCustomHeaderSampleTestComponent);
            fixture.detectChanges();

            expect(QueryBuilderFunctions.getQueryBuilderHeaderText(fixture)).toBe(' Custom Title ');
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemAnd(fixture)).toBeNull();
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemOr(fixture)).toBeNull();

            fixture.componentInstance.showLegend = true;
            fixture.detectChanges();
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemAnd(fixture).textContent).toBe('and');
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemOr(fixture).textContent).toBe('or');
        });
    });

    describe('Interactions', () => {
        it('Should correctly initialize a newly added \'And\' group.', fakeAsync(() => {
            // Click the initial 'Add And Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Verify there is a new root group, which is empty.
            const group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
            expect(group).not.toBeNull('There is no root group.');
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group as HTMLElement).length).toBe(0, 'The group has children.');

            // Verify the operator line of the root group is an 'And' line.
            QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement, 'and');

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, false, false, false, false, false);

            // Verify the edit inputs are empty.
            QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, '', '', '', '', '');

            // Verify adding buttons are disabled.
            const buttons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                ControlsFunction.verifyButtonIsDisabled(button as HTMLElement);
            }
        }));

        it('Should correctly initialize a newly added \'Or\' group.', fakeAsync(() => {
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 1);
            tick(100);
            fix.detectChanges();

            // Verify there is a new root group, which is empty.
            const group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
            expect(group).not.toBeNull('There is no root group.');
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group as HTMLElement).length).toBe(0, 'The group has children.');

            // Verify the operator line of the root group is an 'Or' line.
            QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement, 'or');

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, false, false, false, false, false);

            // Verify the edit inputs are empty.
            QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, '', '', '', '', '');

            // Verify adding buttons are disabled.
            const buttons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                ControlsFunction.verifyButtonIsDisabled(button as HTMLElement);
            }
        }));

        it(`Should discard newly added group when clicking on the 'cancel' button of its initial condition.`, fakeAsync(() => {
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 1);
            tick(100);
            fix.detectChanges();

            // Verify there is a new root group, which is empty.
            let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
            expect(group).not.toBeNull('There is no root group.');

            // Click on the 'cancel' button
            const closeButton = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
            UIInteractions.simulateClickEvent(closeButton);
            tick(100);
            fix.detectChanges();

            // Verify there is a new root group, which is empty.
            group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
            expect(group).toBeNull();
        }));

        it('Should add a new condition to existing group by using add buttons.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Verify group's children count before adding a new child.
            let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, true).length).toBe(3);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, false).length).toBe(6);

            // Add new 'expression'.
            const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[0];
            const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
            (buttons[0] as HTMLElement).click();
            tick();
            fix.detectChanges();

            // Newly added condition should be empty
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, false, false, false);
            QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, '', '', '');

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'OrderName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, true).length).toBe(4);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, false).length).toBe(7);
        }));

        it(`Should add a new 'And' group to existing group by using add buttons.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Verify group's children count before adding a new child.
            let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, true).length).toBe(3);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, false).length).toBe(6);

            // Add new 'And' group.
            const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[0];
            const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
            (buttons[1] as HTMLElement).click();
            tick();
            fix.detectChanges();

            // Newly added condition should be empty
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, false, false, false);
            QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, '', '', '');

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'OrderName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            // Verify the operator line of the new group is an 'And' line.
            QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeGroupOperatorLine(fix, [0]) as HTMLElement, 'and');

            group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, true).length).toBe(4);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, false).length).toBe(8);
        }));

        it(`Should add a new 'Or' group to existing group by using add buttons.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Verify group's children count before adding a new child.
            let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, true).length).toBe(3);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, false).length).toBe(6);

            // Add new 'Or' group.
            const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[0];
            const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
            (buttons[2] as HTMLElement).click();
            tick();
            fix.detectChanges();

            // Newly added condition should be empty
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, false, false, false);
            QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, '', '', '');

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'OrderName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            // Verify the operator line of the new group is an 'Or' line.
            QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeGroupOperatorLine(fix, [0]) as HTMLElement, 'or');

            group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, true).length).toBe(4);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(group, false).length).toBe(8);
        }));

        it(`Should remove a condition from an existing group by using the 'close' icon of the respective chip.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Verify tree layout before deleting chips.
            let rootGroup = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup, true).length).toBe(3);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup, false).length).toBe(6);

            // Delete a chip and verify layout.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipRemoveIcon(fix, [0]);
            tick(100);
            fix.detectChanges();

            rootGroup = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup, true).length).toBe(2);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup, false).length).toBe(2);

            // Delete a chip and verify layout.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipRemoveIcon(fix, [1]);
            tick(100);
            flush();
            fix.detectChanges();
            rootGroup = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup, true).length).toBe(1);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(rootGroup, false).length).toBe(1);

            // Verify remaining chip's content.
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'OrderId', 'Greater Than', '3');

            // Delete the last chip and verify that the group is deleted as well.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipRemoveIcon(fix, [0]);
            tick(100);
            flush();
            fix.detectChanges();

            rootGroup = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;;
            expect(rootGroup).toBeNull();
        }));

        it('Should be able to add and define a new group through initial adding button.', fakeAsync(() => {
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 1);
            tick(100);
            fix.detectChanges();

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            expect(fix.componentInstance.queryBuilder.expressionTree).toBeUndefined();
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, false, false, false, false, false);

            // Select an entity
            // TO DO: refactor the methods when entity and fields drop-downs are in the correct overlay
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0);
            tick(100);
            fix.detectChanges();
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, false, false, false);
            // Select fields
            QueryBuilderFunctions.selectFieldsInEditModeExpression(fix, [2, 3])
            tick(100);
            fix.detectChanges();
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, false, false, false);

            //Select Column
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1);
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, false, false);

            //Select Operator
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, true, false);

            //Type Value
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, true, true);

            // Verify all inputs values
            QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Products', 'Id, Released', 'ProductName', 'Contains', 'a');

            //Commit the group
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);

            //Verify that expressionTree is correct
            const exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree, null, 2);
            expect(exprTree).toBe(`{
  "filteringOperands": [
    {
      "field": "ProductName",
      "condition": {
        "name": "contains",
        "isUnary": false,
        "iconName": "filter_contains"
      },
      "conditionName": null,
      "ignoreCase": true,
      "searchVal": "a",
      "searchTree": null
    }
  ],
  "operator": 1,
  "entity": "Products",
  "returnFields": [
    "Id",
    "Released"
  ]
}`);
        }));

        it('Value input should be disabled for unary operator.', fakeAsync(() => {
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 1);
            tick(100);
            fix.detectChanges();

            // Select an entity
            // TO DO: refactor the methods when entity and fields drop-downs are in the correct overlay
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0);
            tick(100);
            fix.detectChanges();

            //Select Column
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 3);
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, false, false);

            //Select Operator
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);
            QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, false, true);
        }));

        it('Fields dropdown should contain proper fields based on the entity.', fakeAsync(() => {
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select an entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0);
            tick(100);
            fix.detectChanges();

            // Open fields dropdown and verify the items.
            QueryBuilderFunctions.clickQueryBuilderFieldsCombo(fix);
            fix.detectChanges();

            // TO DO: refactor when overlay issue is fixed
            const outlet = fix.debugElement.queryAll(By.css(`.igx-drop-down__list-scroll`))[1].nativeElement;
            const dropdownItems = Array.from(outlet.querySelectorAll('.igx-drop-down__item'));;
            expect(dropdownItems.length).toBe(5);
            expect((dropdownItems[0] as HTMLElement).innerText).toBe('Select All');
            expect((dropdownItems[1] as HTMLElement).innerText).toBe('Id');
            expect((dropdownItems[2] as HTMLElement).innerText).toBe('ProductName');
            expect((dropdownItems[3] as HTMLElement).innerText).toBe('OrderId');
            expect((dropdownItems[4] as HTMLElement).innerText).toBe('Released');
        }));

        it('Column dropdown should contain proper fields based on the entity.', fakeAsync(() => {
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_TREE}`))[0].nativeElement;
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select an entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1);
            tick(100);
            fix.detectChanges();

            // Open columns dropdown and verify the items.
            QueryBuilderFunctions.clickQueryBuilderColumnSelect(fix);
            fix.detectChanges();
            const dropdownItems = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement);
            expect(dropdownItems.length).toBe(3);
            expect((dropdownItems[0] as HTMLElement).innerText).toBe('OrderId');
            expect((dropdownItems[1] as HTMLElement).innerText).toBe('OrderName');
            expect((dropdownItems[2] as HTMLElement).innerText).toBe('OrderDate');
        }));

        it('Operator dropdown should contain operators based on the column\'s datatype (\'string\' or \'number\' or \'date\').', fakeAsync(() => {
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_TREE}`))[0].nativeElement;
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select an entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1);
            tick(100);
            fix.detectChanges();

            // Select 'string' type column ('OrderName').
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1);
            // Open the operator dropdown and verify they are 'string' specific.
            QueryBuilderFunctions.clickQueryBuilderOperatorSelect(fix);
            fix.detectChanges();
            let dropdownValues: string[] = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement).map((x: any) => x.innerText);
            let expectedValues = ['Contains', 'Does Not Contain', 'Starts With', 'Ends With', 'Equals',
                'Does Not Equal', 'Empty', 'Not Empty', 'Null', 'Not Null', 'In', 'Not In'];
            expect(dropdownValues).toEqual(expectedValues);

            // Close current dropdown by a random select.
            QueryBuilderFunctions.clickQueryBuilderSelectDropdownItem(queryBuilderElement, 0);
            tick();
            fix.detectChanges();

            // Select 'number' type column ('OrderId').
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0);
            // Open the operator dropdown and verify they are 'number' specific.
            QueryBuilderFunctions.clickQueryBuilderOperatorSelect(fix);
            fix.detectChanges();
            dropdownValues = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement).map((x: any) => x.innerText);
            expectedValues = ['Equals', 'Does Not Equal', 'Greater Than', 'Less Than', 'Greater Than Or Equal To',
                'Less Than Or Equal To', 'Empty', 'Not Empty', 'Null', 'Not Null', 'In', 'Not In'];
            expect(dropdownValues).toEqual(expectedValues);

            // Close current dropdown by a random select.
            QueryBuilderFunctions.clickQueryBuilderSelectDropdownItem(queryBuilderElement, 0);
            tick();
            fix.detectChanges();

            // Select 'date' type column ('OrderDate').
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 2);
            // Open the operator dropdown and verify they are 'date' specific.
            QueryBuilderFunctions.clickQueryBuilderOperatorSelect(fix);
            fix.detectChanges();
            dropdownValues = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement).map((x: any) => x.innerText);
            expectedValues = ['Equals', 'Does Not Equal', 'Before', 'After', 'Today', 'Yesterday',
                'This Month', 'Last Month', 'Next Month', 'This Year', 'Last Year',
                'Next Year', 'Empty', 'Not Empty', 'Null', 'Not Null', 'In', 'Not In'];
            expect(dropdownValues).toEqual(expectedValues);
        }));

        it('Operator dropdown should contain operators based on the column\'s datatype (\'boolean\').', fakeAsync(() => {
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_TREE}`))[0].nativeElement;
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select an entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select 'boolean' type column ('Released').
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 3);
            // Open the operator dropdown and verify they are 'boolean' specific.
            QueryBuilderFunctions.clickQueryBuilderOperatorSelect(fix);
            fix.detectChanges();
            const dropdownValues: string[] = QueryBuilderFunctions.getQueryBuilderSelectDropdownItems(queryBuilderElement).map((x: any) => x.innerText);
            const expectedValues = ['All', 'True', 'False', 'Empty', 'Not Empty', 'Null', 'Not Null', 'In', 'Not In'];
            expect(dropdownValues).toEqual(expectedValues);
        }));

        it('Should correctly apply a \'string\' column condition through UI.', fakeAsync(() => {
            // Verify there is no expression.
            expect(queryBuilder.expressionTree).toBeUndefined();

            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0); // Select 'Products' entity
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
            //Type Value
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            //Verify that expressionTree is correct
            const exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree, null, 2);
            expect(exprTree).toBe(`{
  "filteringOperands": [
    {
      "field": "ProductName",
      "condition": {
        "name": "startsWith",
        "isUnary": false,
        "iconName": "filter_starts_with"
      },
      "conditionName": null,
      "ignoreCase": true,
      "searchVal": "a",
      "searchTree": null
    }
  ],
  "operator": 0,
  "entity": "Products",
  "returnFields": [
    "Id",
    "ProductName",
    "OrderId",
    "Released"
  ]
}`);
        }));

        it('Should correctly apply a \'Greater Than\' with \'number\' column condition through UI.', fakeAsync(() => {
            // Verify there is no expression.
            expect(queryBuilder.expressionTree).toBeUndefined();

            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0); // Select 'Products' entity
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'Id' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator
            //Type Value
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '5');
            tick(100);
            fix.detectChanges();

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            //Verify that expressionTree is correct
            const exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree, null, 2);
            expect(exprTree).toBe(`{
  "filteringOperands": [
    {
      "field": "Id",
      "condition": {
        "name": "greaterThan",
        "isUnary": false,
        "iconName": "filter_greater_than"
      },
      "conditionName": null,
      "ignoreCase": true,
      "searchVal": 5,
      "searchTree": null
    }
  ],
  "operator": 0,
  "entity": "Products",
  "returnFields": [
    "Id",
    "ProductName",
    "OrderId",
    "Released"
  ]
}`);
        }));

        it('Should correctly apply a \'Equals\' with \'number\' column condition through UI.', fakeAsync(() => {
            // Verify there is no expression.
            expect(queryBuilder.expressionTree).toBeUndefined();

            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0); // Select 'Products' entity
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'Id' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Equals' operator
            //Type Value
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '5');
            tick(100);
            fix.detectChanges();

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            //Verify that expressionTree is correct
            const exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree, null, 2);
            expect(exprTree).toBe(`{
  "filteringOperands": [
    {
      "field": "Id",
      "condition": {
        "name": "equals",
        "isUnary": false,
        "iconName": "filter_equal"
      },
      "conditionName": null,
      "ignoreCase": true,
      "searchVal": 5,
      "searchTree": null
    }
  ],
  "operator": 0,
  "entity": "Products",
  "returnFields": [
    "Id",
    "ProductName",
    "OrderId",
    "Released"
  ]
}`);
        }));

        it('Should correctly apply a \'boolean\' column condition through UI.', fakeAsync(() => {
            // Verify there is no expression.
            expect(queryBuilder.expressionTree).toBeUndefined();

            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0); // Select 'Products' entity
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 3); // Select 'Released' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 1); // Select 'True' operator.

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            //Verify that expressionTree is correct
            const exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree, null, 2);
            expect(exprTree).toBe(`{
  "filteringOperands": [
    {
      "field": "Released",
      "condition": {
        "name": "true",
        "isUnary": true,
        "iconName": "filter_true"
      },
      "conditionName": null,
      "ignoreCase": true,
      "searchVal": null,
      "searchTree": null
    }
  ],
  "operator": 0,
  "entity": "Products",
  "returnFields": [
    "Id",
    "ProductName",
    "OrderId",
    "Released"
  ]
}`);
        }));

        it('Should correctly apply a \'date\' column condition through UI with unary operator.', fakeAsync(() => {
            // Verify there is no expression.
            expect(queryBuilder.expressionTree).toBeUndefined();

            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1); // Select 'Orders' entity
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 2); // Select 'OrderDate' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 9); // Select 'This Year' operator.

            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, true); // Third input should be disabled for unary operators.
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            //Verify that expressionTree is correct
            const exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree, null, 2);
            expect(exprTree).toBe(`{
  "filteringOperands": [
    {
      "field": "OrderDate",
      "condition": {
        "name": "thisYear",
        "isUnary": true,
        "iconName": "filter_this_year"
      },
      "conditionName": null,
      "ignoreCase": true,
      "searchVal": null,
      "searchTree": null
    }
  ],
  "operator": 0,
  "entity": "Orders",
  "returnFields": [
    "OrderId",
    "OrderName",
    "OrderDate"
  ]
}`);
        }));

        it('Should correctly apply a \'date\' column condition through UI with value from calendar.', fakeAsync(() => {
            // Verify there is no expression.
            expect(queryBuilder.expressionTree).toBeUndefined();

            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1); // Select 'Orders' entity
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 2); // Select 'OrderDate' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Equals' operator.
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, true, false);
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, true) as HTMLElement;
            input.click();
            fix.detectChanges();

            // Click on 'today' item in calendar.
            const calendar = QueryBuilderFunctions.getQueryBuilderCalendar(fix);
            const todayItem = calendar.querySelector('.igx-days-view__date--current');
            todayItem.firstChild.dispatchEvent(new Event('mousedown'));
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, true, true);

            flush();
        }));

        it('Should correctly apply an \'in\' column condition through UI.', fakeAsync(() => {
            // Verify there is no expression.
            expect(queryBuilder.expressionTree).toBeUndefined();

            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1); // Select 'Orders' entity
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'OrderId' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'In' operator.

            // Verify inputs states
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, false);

            // Should render empty query builder tree
            const nestedTree = fix.debugElement.query(By.css(QUERY_BUILDER_TREE));
            expect(nestedTree).toBeDefined();

            QueryBuilderFunctions.addAndValidateChildGroup(fix, 1, 1);

            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, true); // Parent commit button should be enabled
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            //Verify that expressionTree is correct
            const exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree, null, 2);
            expect(exprTree).toBe(`{
  "filteringOperands": [
    {
      "field": "OrderId",
      "condition": {
        "name": "in",
        "isUnary": false,
        "iconName": "in"
      },
      "conditionName": null,
      "ignoreCase": true,
      "searchVal": null,
      "searchTree": {
        "filteringOperands": [
          {
            "field": "ProductName",
            "condition": {
              "name": "contains",
              "isUnary": false,
              "iconName": "filter_contains"
            },
            "conditionName": null,
            "ignoreCase": true,
            "searchVal": "a",
            "searchTree": null
          }
        ],
        "operator": 1,
        "entity": "Products",
        "returnFields": [
          "Id",
          "ProductName",
          "OrderId",
          "Released"
        ]
      }
    }
  ],
  "operator": 0,
  "entity": "Orders",
  "returnFields": [
    "OrderId",
    "OrderName",
    "OrderDate"
  ]
}`);
        }));

        it('Should display an alert dialog when the entity is changed.', fakeAsync(() => {
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
            const queryTreeElement = queryBuilderElement.querySelector(`.${QUERY_BUILDER_TREE}`);
            const dialog = queryTreeElement.querySelector('igx-dialog');
            expect(dialog).toBeDefined();

            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0);
            tick(100);
            fix.detectChanges();

            // Alert dialog should not be opened if there is no previous selection
            expect(dialog.checkVisibility()).toBeFalse();

            // Select entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1);
            tick(100);
            fix.detectChanges();

            // Alert dialog should be opened
            expect(dialog.checkVisibility()).toBeTrue();
        }));

        it('Should reset all inputs when the entity is changed.', fakeAsync(() => {
            pending();
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0);
            tick(100);
            fix.detectChanges();

            //Select Column
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0);

            //Select Operator
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);

            //Type Value
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '1');
            tick(100);
            fix.detectChanges();

            // Verify all inputs values
            QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Products', 'Id, ProductName, OrderId, Released', 'Id', 'Equals', '1');

            // Change the selected entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1);
            tick(100);
            fix.detectChanges();

            // Confirm the change
            const dialogOutlet: HTMLElement = fix.debugElement.queryAll(By.css(`.igx-dialog`))[0].nativeElement;
            const confirmButton = Array.from(dialogOutlet.querySelectorAll('button'))[1];
            expect(confirmButton.innerText).toEqual('Confirm');
            confirmButton.click();
            tick(100);
            fix.detectChanges();

            // Verify all inputs
            QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Orders', 'OrderId, OrderName, OrderDate', '', '', '');
        }));

        it('Should NOT reset all inputs when the entity is changed.', fakeAsync(() => {
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Select entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0);
            tick(100);
            fix.detectChanges();

            //Select Column
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0);

            //Select Operator
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);

            //Type Value
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '1');
            tick(100);
            fix.detectChanges();

            // Verify all inputs values
            QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Products', 'Id, ProductName, OrderId, Released', 'Id', 'Equals', '1');

            // Change the selected entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1);
            tick(100);
            fix.detectChanges();

            // Decline the change
            const dialogOutlet: HTMLElement = fix.debugElement.queryAll(By.css(`.igx-dialog`))[0].nativeElement;
            const cancelButton = Array.from(dialogOutlet.querySelectorAll('button'))[0];
            expect(cancelButton.innerText).toEqual('Cancel');
            cancelButton.click();
            tick(100);
            fix.detectChanges();

            // Verify all inputs
            QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Products', 'Id, ProductName, OrderId, Released', 'Id', 'Equals', '1');
        }));

        it(`Should display 'expand'/'collapse' button properly.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            const queryTreeElement: HTMLElement = fix.debugElement.queryAll(By.css(QUERY_BUILDER_TREE))[0].nativeElement;
            // Nested query tree should have expand collapse button
            const expressionItems = queryTreeElement.querySelectorAll('.igx-filter-tree__expression-item');
            expressionItems.forEach(item => {
                const chip = item.querySelector('igx-chip');
                const conditionType = (chip.querySelector('.igx-filter-tree__expression-condition') as HTMLElement).innerText;
                const toggleButton = item.querySelector('.igx-filter-tree__details-button');
                if (conditionType == 'In' || conditionType == 'Not In') {
                    expect(toggleButton).toBeDefined();
                } else {
                    expect(toggleButton).toBeNull();
                }
            });
        }));

        it('Should collapse nested query when it is commited.', fakeAsync(() => {
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1); // Select 'Orders' entity
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'OrderId' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'In' operator.

            QueryBuilderFunctions.addChildGroup(fix, 0, 1);

            // Verify that the nested query is expanded
            expect(fix.debugElement.query(By.css(`.${QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeTrue();

            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify that the nested query is collapsed
            expect(fix.debugElement.query(By.css(`.${QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();
        }));

        it(`Should toggle the nested query on 'expand'/'collapse' button click.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            expect(fix.debugElement.query(By.css(`.${QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();

            const queryTreeElement: HTMLElement = fix.debugElement.queryAll(By.css(QUERY_BUILDER_TREE))[0].nativeElement;
            // Nested query tree should have expand collapse button
            const expressionItems = Array.from(queryTreeElement.querySelectorAll('.igx-filter-tree__expression-item'));
            const expandableItem = expressionItems.filter(item =>
                (item.querySelector('.igx-filter-tree__expression-condition') as HTMLElement).innerText == 'In' ||
                (item.querySelector('.igx-filter-tree__expression-condition') as HTMLElement).innerText == 'Not In'
            )[0];
            const toggleBtn = expandableItem.querySelector('.igx-filter-tree__details-button') as HTMLElement;
            expect((toggleBtn.querySelector('igx-icon') as HTMLElement).innerText).toBe('unfold_less');
            toggleBtn.click();
            tick(100);
            fix.detectChanges();

            expect((toggleBtn.querySelector('igx-icon') as HTMLElement).innerText).toBe('unfold_more');
            expect(fix.debugElement.query(By.css(`.${QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeTrue();
        }));

        fit('Should create an "and"/"or" group from multiple selected conditions when the respective context menu button is clicked and delete conditions when "delete filters" is clicked.', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxQueryBuiderExprTreeSampleTestComponent);
            tick();
            fixture.detectChanges();

            QueryBuilderFunctions.createGroupFromBottomTwoChips(fixture, "OR")

            //OR group should have been created
            const orLine = fixture.debugElement.queryAll(By.css(`.${QUERY_BUILDER_OPERATOR_LINE_OR_CSS_CLASS}`));
            expect(orLine.length).toBe(1, "OR group was not created");
            
            const orConditions = orLine[0].parent.queryAll(By.directive(IgxChipComponent));
            expect(orConditions[0].nativeElement.innerText).toContain('OrderId\nGreater Than', "Or group not grouping the right chip");
            expect(orConditions[1].nativeElement.innerText).toContain('OrderDate\nAfter', "Or group not grouping the right chip");
            
            QueryBuilderFunctions.createGroupFromBottomTwoChips(fixture, "AND")
            
            //AND group should have been created
            const andLine = fixture.debugElement.queryAll(By.css(`.${QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS}`));
            expect(andLine.length).toBe(3, "AND group was not created");
            
            const andConditions = andLine[2].parent.queryAll(By.directive(IgxChipComponent));
            expect(andConditions[0].nativeElement.innerText).toContain('OrderId\nGreater Than', "Or group not grouping the right chip");
            expect(andConditions[1].nativeElement.innerText).toContain('OrderDate\nAfter', "Or group not grouping the right chip");
            
            //Open Or group context menu
            andLine[2].nativeElement.click();
            tick();
            fixture.detectChanges();

            //Click Delete group
            const contextMenus = QueryBuilderFunctions.getContextMenus(fixture);
            const deleteButton = contextMenus[1].query(By.css('.igx-filter-contextual-menu__delete-btn'));
            deleteButton.nativeElement.click();
            tick();
            fixture.detectChanges();

            //Group's conditions should have been deleted
            const chips = fixture.debugElement.queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toBe(3, "Chips ware not deleted");
        }));
    });

    describe('Keyboard navigation', () => {
        it('Should navigate with Tab/Shift+Tab through entity and fields inputs, chips, their respective delete icons and the operator lines.', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxQueryBuiderExprTreeSampleTestComponent);
            tick();
            fixture.detectChanges();

            QueryBuilderFunctions.verifyQueryBuilderTabbableElements(fixture);
        }));

        it('Should navigate with Tab/Shift+Tab through chips" "edit", "cancel" and "adding" buttons, fields of a condition in edit mode', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxQueryBuiderExprTreeSampleTestComponent);
            tick();
            fixture.detectChanges();

            const chip = fixture.debugElement.queryAll(By.directive(IgxChipComponent))[0];

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, ' ', chip, 200);

            const chipActions = fixture.debugElement.query(By.css('.igx-filter-tree__expression-actions'));
            QueryBuilderFunctions.verifyTabbableChipActions(chipActions);

            // Open Edit mode and check condition line elements
            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, ' ', chipActions.children[0], 200);

            const editLine = fixture.debugElement.queryAll(By.css('.igx-filter-tree__inputs'))[1];
            QueryBuilderFunctions.verifyTabbableConditionEditLineElements(editLine);

            const editDialog = fixture.debugElement.queryAll(By.css(`.${QUERY_BUILDER_BODY}`))[1];
            QueryBuilderFunctions.verifyTabbableInConditionDialogElements(editDialog);
        }));

        it('Should select/deselect a chip when pressing "Enter"/"space" on it.', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxQueryBuiderExprTreeSampleTestComponent);
            tick();
            fixture.detectChanges();

            const chip = fixture.debugElement.queryAll(By.directive(IgxChipComponent))[0];

            QueryBuilderFunctions.verifyChipSelectedState(chip, false);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, ' ', chip, 200);

            QueryBuilderFunctions.verifyChipSelectedState(chip, true);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, ' ', chip, 200);

            QueryBuilderFunctions.verifyChipSelectedState(chip, false);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, 'Enter', chip, 200);

            QueryBuilderFunctions.verifyChipSelectedState(chip, true);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, 'Enter', chip, 200);

            QueryBuilderFunctions.verifyChipSelectedState(chip, false);
        }));

        it('Should select/deselect all child conditions/groups and open/close group context menu when pressing "Enter"/"space" on it.', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxQueryBuiderExprTreeSampleTestComponent);
            tick();
            fixture.detectChanges();

            const line = fixture.debugElement.queryAll(By.css(`.${QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS}`))[0];
            const chips = fixture.debugElement.queryAll(By.directive(IgxChipComponent));

            QueryBuilderFunctions.verifyChipSelectedState(chips[0], false);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3], false);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fixture, false);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, ' ', line);

            QueryBuilderFunctions.verifyChipSelectedState(chips[0], true);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3], true);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fixture, true);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, ' ', line);

            QueryBuilderFunctions.verifyChipSelectedState(chips[0], false);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3], false);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fixture, false);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, 'Enter', line);

            QueryBuilderFunctions.verifyChipSelectedState(chips[0], true);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3], true);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fixture, true);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fixture, 'Enter', line);

            QueryBuilderFunctions.verifyChipSelectedState(chips[0], false);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3], false);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fixture, false);
        }));
    });

    describe('Localization', () => {
        it('', () => { });
    });

    describe('Overlay settings', () => {
        it('', () => { });
    });
});

@Component({
    template: `
     <igx-query-builder #queryBuilder [entities]="this.entities">
     </igx-query-builder>
    `,
    standalone: true,
    imports: [
        IgxQueryBuilderComponent
    ]
})
export class IgxQueryBuiderSampleTestComponent implements OnInit {
    @ViewChild(IgxQueryBuilderComponent) public queryBuilder: IgxQueryBuilderComponent;
    public entities: Array<any>;

    public ngOnInit(): void {
        this.entities = [
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
                    { field: 'OrderDate', dataType: 'date' }
                ]
            }
        ];
    }
}

@Component({
    template: `
     <igx-query-builder #queryBuilder [entities]="this.entities">
         <igx-query-builder-header [title]="'Custom Title'" [showLegend]="showLegend"></igx-query-builder-header>
     </igx-query-builder>
    `,
    standalone: true,
    imports: [
        IgxQueryBuilderComponent,
        IgxQueryBuilderHeaderComponent
    ]
})
export class IgxQueryBuiderCustomHeaderSampleTestComponent implements OnInit {
    @ViewChild(IgxQueryBuilderComponent) public queryBuilder: IgxQueryBuilderComponent;
    public entities: Array<any>;
    public showLegend = false;

    public ngOnInit(): void {
        this.entities = [
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
                    { field: 'OrderDate', dataType: 'date' }
                ]
            }
        ];
    }
}

@Component({
    template: `
     <igx-query-builder #queryBuilder [entities]="this.entities" [expressionTree]="this.expressionTree">
     </igx-query-builder>
    `,
    standalone: true,
    imports: [
        IgxQueryBuilderComponent
    ]
})
export class IgxQueryBuiderExprTreeSampleTestComponent implements OnInit {
    @ViewChild(IgxQueryBuilderComponent) public queryBuilder: IgxQueryBuilderComponent;
    public entities: Array<any>;
    public fields: Array<any>;
    public expressionTree: IExpressionTree;

    public ngOnInit(): void {
        this.entities = [
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
                    { field: 'OrderDate', dataType: 'date' }
                ]
            }
        ];

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

        this.expressionTree = tree;
    }
}
