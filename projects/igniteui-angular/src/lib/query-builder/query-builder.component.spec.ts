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
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
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
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
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
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QUERY_BUILDER_CLASS}`))[0].nativeElement;
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

            QueryBuilderFunctions.addAndValidateChildGroup(fix, 1);

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
    });

    describe('Keyboard navigation', () => {
        it('Should navigate with Tab/Shift+Tab through entity and fields inputs, chips, their respective delete icons and the operator lines.', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxQueryBuiderExprTreeSampleTestComponent);
            tick();
            fixture.detectChanges();

            const tabElements = QueryBuilderFunctions.getTabbableElements();

            let i = 0;
            while (i) {
                const elementHtml = tabElements[i].outerHTML;

                switch (i) {
                    case 0: expect(elementHtml).toBe('<div tabindex="0" class="igx-filter-tree__line igx-filter-tree__line--and" ng-reflect-ng-class="[object Object]"></div>'); break;
                    case 1: expect(elementHtml).toBe('<input _ngcontent-a-c2154189058="" type="text" igxinput="" readonly="true" role="combobox" aria-haspopup="listbox" class="input igx-input-group__input" ng-reflect-target="[object Object]" ng-reflect-disabled="false" ng-reflect-value="" aria-labelledby="igx-label-0" aria-expanded="false" aria-owns="igx-drop-down-0-list" aria-required="false">'); break;
                    case 2: expect(elementHtml).toBe('<input igxinput="" name="comboInput" type="text" readonly="" role="combobox" aria-haspopup="listbox" ng-reflect-value="" ng-reflect-disabled="false" aria-expanded="false" aria-controls="igx-drop-down-1-list" aria-labelledby="igx-label-1" aria-required="false" class="igx-input-group__input">'); break;
                    case 3: expect(elementHtml).toBe('<igx-chip ng-reflect-target="[object Object]" ng-reflect-data="[object Object]" ng-reflect-removable="true" id="igx-chip-0" role="option" tabindex="0" aria-selected="false" class="igx-chip"><div ghostclass="igx-chip__ghost" igxdrop="" class="igx-chip__item igx-drag igx-drag--select-disabled" ng-reflect-data="[object Object]" ng-reflect-ghost-class="igx-chip__ghost" ng-reflect-ghost-style="[object Object]" droppable="true" style="visibility: visible; transition-duration: 0s;"><div class="igx-chip__start"><!--bindings={\n  "ng-reflect-ng-if": "false"\n}--><span igxprefix="" class="igx-filter-tree__expression-column"> OrderId </span></div><div class="igx-chip__content"><span class="igx-filter-tree__expression-condition"> In </span></div><div class="igx-chip__end"><span igxsuffix=""><strong>Products</strong>&nbsp;/ Id <!--ng-container--><!--bindings={\n  "ng-reflect-ng-if": "[object Object]"\n}--><!--bindings={\n  "ng-reflect-ng-if": "false"\n}--></span><!--bindings={\n  "ng-reflect-ng-if": "true"\n}--><div class="igx-chip__remove" tabindex="0"><igx-icon family="default" name="remove" ng-reflect-family="default" ng-reflect-name="remove" aria-label="remove chip" aria-hidden="true" class="igx-icon material-icons"><!--container-->cancel<!--container--><!--container--></igx-icon><!--bindings={\n  "ng-reflect-ng-template-outlet": "[object Object]"\n}--></div><!--bindings={\n  "ng-reflect-ng-if": "true"\n}--></div></div><!--container--><!--container--><!--container--></igx-chip>'); break;
                    case 4: expect(elementHtml).toBe('<div class="igx-chip__remove" tabindex="0"><igx-icon family="default" name="remove" ng-reflect-family="default" ng-reflect-name="remove" aria-label="remove chip" aria-hidden="true" class="igx-icon material-icons"><!--container-->cancel<!--container--><!--container--></igx-icon><!--bindings={\n  "ng-reflect-ng-template-outlet": "[object Object]"\n}--></div>'); break;
                    case 5: expect(elementHtml).toBe('<igx-chip ng-reflect-target="[object Object]" ng-reflect-data="[object Object]" ng-reflect-removable="true" id="igx-chip-3" role="option" tabindex="0" aria-selected="false" class="igx-chip"><div ghostclass="igx-chip__ghost" igxdrop="" class="igx-chip__item igx-drag igx-drag--select-disabled" ng-reflect-data="[object Object]" ng-reflect-ghost-class="igx-chip__ghost" ng-reflect-ghost-style="[object Object]" droppable="true" style="visibility: visible; transition-duration: 0s;"><div class="igx-chip__start"><!--bindings={\n  "ng-reflect-ng-if": "false"\n}--><span igxprefix="" class="igx-filter-tree__expression-column"> OrderId </span></div><div class="igx-chip__content"><span class="igx-filter-tree__expression-condition"> Greater Than </span></div><div class="igx-chip__end"><span igxsuffix=""><!--bindings={}--> 3 <!--ng-container--><!--bindings={\n  "ng-reflect-ng-if": "true"\n}--></span><!--bindings={\n  "ng-reflect-ng-if": "true"\n}--><div class="igx-chip__remove" tabindex="0"><igx-icon family="default" name="remove" ng-reflect-family="default" ng-reflect-name="remove" aria-label="remove chip" aria-hidden="true" class="igx-icon material-icons"><!--container-->cancel<!--container--><!--container--></igx-icon><!--bindings={\n  "ng-reflect-ng-template-outlet": "[object Object]"\n}--></div><!--bindings={\n  "ng-reflect-ng-if": "true"\n}--></div></div><!--container--><!--container--><!--container--></igx-chip>'); break;
                    case 6: expect(elementHtml).toBe('<div class="igx-chip__remove" tabindex="0"><igx-icon family="default" name="remove" ng-reflect-family="default" ng-reflect-name="remove" aria-label="remove chip" aria-hidden="true" class="igx-icon material-icons"><!--container-->cancel<!--container--><!--container--></igx-icon><!--bindings={\n  "ng-reflect-ng-template-outlet": "[object Object]"\n}--></div>'); break;
                    case 7: expect(elementHtml).toBe('<igx-chip ng-reflect-target="[object Object]" ng-reflect-data="[object Object]" ng-reflect-removable="true" id="igx-chip-4" role="option" tabindex="0" aria-selected="false" class="igx-chip"><div ghostclass="igx-chip__ghost" igxdrop="" class="igx-chip__item igx-drag igx-drag--select-disabled" ng-reflect-data="[object Object]" ng-reflect-ghost-class="igx-chip__ghost" ng-reflect-ghost-style="[object Object]" droppable="true" style="visibility: visible; transition-duration: 0s;"><div class="igx-chip__start"><!--bindings={\n  "ng-reflect-ng-if": "false"\n}--><span igxprefix="" class="igx-filter-tree__expression-column"> OrderDate </span></div><div class="igx-chip__content"><span class="igx-filter-tree__expression-condition"> After </span></div><div class="igx-chip__end"><span igxsuffix=""><!--bindings={}--> Aug 29, 2024 <!--ng-container--><!--bindings={\n  "ng-reflect-ng-if": "true"\n}--></span><!--bindings={\n  "ng-reflect-ng-if": "true"\n}--><div class="igx-chip__remove" tabindex="0"><igx-icon family="default" name="remove" ng-reflect-family="default" ng-reflect-name="remove" aria-label="remove chip" aria-hidden="true" class="igx-icon material-icons"><!--container-->cancel<!--container--><!--container--></igx-icon><!--bindings={\n  "ng-reflect-ng-template-outlet": "[object Object]"\n}--></div><!--bindings={\n  "ng-reflect-ng-if": "true"\n}--></div></div><!--container--><!--container--><!--container--></igx-chip>'); break;
                    case 8: expect(elementHtml).toBe('<div class="igx-chip__remove" tabindex="0"><igx-icon family="default" name="remove" ng-reflect-family="default" ng-reflect-name="remove" aria-label="remove chip" aria-hidden="true" class="igx-icon material-icons"><!--container-->cancel<!--container--><!--container--></igx-icon><!--bindings={\n  "ng-reflect-ng-template-outlet": "[object Object]"\n}--></div>'); break;
                    case 9: expect(elementHtml).toBe('<button type="button" igxbutton="outlined" ng-reflect-type="outlined" ng-reflect-disabled="false" role="button" class="igx-button igx-button--outlined"><igx-icon family="default" name="add" ng-reflect-family="default" ng-reflect-name="add" aria-hidden="true" class="igx-icon material-icons"><!--container-->add<!--container--><!--container--></igx-icon><!--bindings={\n  "ng-reflect-ng-template-outlet": "[object Object]"\n}--><span>Condition</span></button>'); break;
                    case 10: expect(elementHtml).toBe('<button type="button" igxbutton="outlined" ng-reflect-type="outlined" ng-reflect-disabled="false" role="button" class="igx-button igx-button--outlined"><igx-icon family="default" name="add" ng-reflect-family="default" ng-reflect-name="add" aria-hidden="true" class="igx-icon material-icons"><!--container-->add<!--container--><!--container--></igx-icon><!--bindings={\n  "ng-reflect-ng-template-outlet": "[object Object]"\n}--><span>"And" Group</span></button>'); break;
                    case 11: expect(elementHtml).toBe('<button type="button" igxbutton="outlined" ng-reflect-type="outlined" ng-reflect-disabled="false" role="button" class="igx-button igx-button--outlined"><igx-icon family="default" name="add" ng-reflect-family="default" ng-reflect-name="add" aria-hidden="true" class="igx-icon material-icons"><!--container-->add<!--container--><!--container--></igx-icon><!--bindings={\n  "ng-reflect-ng-template-outlet": "[object Object]"\n}--><span>"Or" Group</span></button>'); break;
                    default: i = undefined; break;
                }

                i++;
            }
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
