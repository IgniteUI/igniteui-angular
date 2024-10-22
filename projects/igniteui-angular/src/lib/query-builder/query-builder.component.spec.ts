import { waitForAsync, TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { FilteringExpressionsTree, FilteringLogic, IExpressionTree, IgxChipComponent, IgxDateFilteringOperand, IgxNumberFilteringOperand, IgxQueryBuilderComponent, IgxQueryBuilderHeaderComponent, IgxQueryBuilderSearchValueTemplateDirective, IgxStringFilteringOperand } from 'igniteui-angular';
import { configureTestSuite } from '../test-utils/configure-suite';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { QueryBuilderFunctions, QueryBuilderConstants, SampleEntities } from './query-builder-functions.spec';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { FormsModule } from '@angular/forms';

fdescribe('IgxQueryBuilder', () => {
    configureTestSuite();
    let fix: ComponentFixture<IgxQueryBuilderSampleTestComponent>;
    let queryBuilder: IgxQueryBuilderComponent;
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxQueryBuilderComponent,
                IgxQueryBuilderSampleTestComponent,
                IgxQueryBuilderCustomTemplateSampleTestComponent,
            ]
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fix = TestBed.createComponent(IgxQueryBuilderSampleTestComponent);
        fix.detectChanges();
        queryBuilder = fix.componentInstance.queryBuilder;
    }));

    describe('Basic', () => {
        it('Should render empty Query Builder properly.', () => {
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_CLASS}`))[0].nativeElement;
            expect(queryBuilderElement).toBeDefined();
            expect(queryBuilderElement.children.length).toEqual(2);

            expect(QueryBuilderFunctions.getQueryBuilderHeaderText(fix)).toBe(' Query Builder ');
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemAnd(fix).textContent).toBe('and');
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemOr(fix).textContent).toBe('or');
            const queryTreeElement = queryBuilderElement.children[1];
            expect(queryTreeElement).toHaveClass(QueryBuilderConstants.QUERY_BUILDER_TREE);

            expect(queryBuilder.expressionTree).toBeUndefined();

            expect(queryTreeElement.children.length).toEqual(3);
            const bodyElement = queryTreeElement.children[0];
            expect(bodyElement).toHaveClass(QueryBuilderConstants.QUERY_BUILDER_BODY);
            expect(bodyElement.children.length).toEqual(2);
            expect(bodyElement.children[0]).toHaveClass('igx-query-builder__root');

            const actionArea = bodyElement.children[0].querySelector('.igx-query-builder__root-actions');
            // initial add "'and'/'or' group " buttons should be displayed
            expect(actionArea.querySelectorAll(':scope > button').length).toEqual(2);
            // empty filtering tree message should be displayed
            expect(bodyElement.children[0].children[1]).toHaveClass('igx-filter-empty');
        });

        it('Should render Query Builder with initially set expression tree properly.', () => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            const queryTreeElement: HTMLElement = fix.debugElement.queryAll(By.css(QueryBuilderConstants.QUERY_BUILDER_TREE))[0].nativeElement;
            const bodyElement = queryTreeElement.children[0];
            expect(bodyElement).toHaveClass(QueryBuilderConstants.QUERY_BUILDER_BODY);
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
            expect(queryBuilder.queryTree.selectedReturnFields.length).toEqual(4);
            // nested queries should be collapsed
            const nestedQueryTrees = queryTreeExpressionContainer.querySelectorAll(QueryBuilderConstants.QUERY_BUILDER_TREE);
            for (let i = 0; i < nestedQueryTrees.length; i++) {
                expect(nestedQueryTrees[i].checkVisibility()).toBeFalse();
            }
            // adding buttons should be enabled
            const buttons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                ControlsFunction.verifyButtonIsDisabled(button as HTMLElement, false);
            }
        });

        it('Should render custom header properly.', () => {
            const fixture = TestBed.createComponent(IgxQueryBuilderCustomTemplateSampleTestComponent);
            fixture.detectChanges();

            expect(QueryBuilderFunctions.getQueryBuilderHeaderText(fixture)).toBe(' Custom Title ');
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemAnd(fixture)).toBeNull();
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemOr(fixture)).toBeNull();

            fixture.componentInstance.showLegend = true;
            fixture.detectChanges();
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemAnd(fixture).textContent).toBe('and');
            expect(QueryBuilderFunctions.getQueryBuilderHeaderLegendItemOr(fixture).textContent).toBe('or');
        });

        it('Should render custom input template properly.', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxQueryBuilderCustomTemplateSampleTestComponent);
            fixture.detectChanges();

            //Select chip
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fixture, [0]);
            tick(200);
            fixture.detectChanges();

            //Open edit mode
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipIcon(fixture, [0], 'edit');
            tick(200);
            fixture.detectChanges();

            const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fixture, false, 0);
            const input = editModeContainer.querySelector('input.custom-class') as HTMLInputElement;
            const selectedField = editModeContainer.querySelector('p.selectedField') as HTMLInputElement;
            const selectedCondition = editModeContainer.querySelector('p.selectedCondition') as HTMLInputElement;

            expect(input).toBeDefined();
            expect(input.value).toBe('3');
            expect(selectedField).toBeDefined();
            expect(selectedField.innerText).toBe('OrderId');
            expect(selectedCondition).toBeDefined();
            expect(selectedCondition.innerText).toBe('greaterThan');

            //Edit input value
            UIInteractions.clickAndSendInputElementValue(input, '5');
            tick(100);
            fixture.detectChanges();

            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fixture);
            tick(100);
            fixture.detectChanges();

            //Verify that expressionTree is correct
            const exprTree = JSON.stringify(fixture.componentInstance.queryBuilder.expressionTree, null, 2);
            expect(exprTree).toBe(`{
  "filteringOperands": [
    {
      "fieldName": "OrderId",
      "condition": {
        "name": "greaterThan",
        "isUnary": false,
        "iconName": "filter_greater_than"
      },
      "conditionName": "greaterThan",
      "searchVal": 5,
      "searchTree": null,
      "ignoreCase": true
    }
  ],
  "operator": 0,
  "entity": "Orders",
  "returnFields": [
    "OrderId",
    "OrderName",
    "OrderDate",
    "Delivered"
  ]
}`);
        }));
    });

    describe('Interactions', () => {
        it('Should correctly initialize a newly added \'And\' group.', fakeAsync(() => {
            // Click the initial 'Add And Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            // Verify there is a new root group, which is empty.
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 0, 0);

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
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 0, 0);

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
            spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 1);
            tick(100);
            fix.detectChanges();

            expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalledTimes(0);

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

            spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();

            // Verify group's children count before adding a new child.
            let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);


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
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 4, 7);
            expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalled();
        }));

        it(`Should add a new 'And' group to existing group by using add buttons.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();

            // Verify group's children count before adding a new child.
            let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);

            // Add new 'And' group.
            const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[0];
            const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
            (buttons[1] as HTMLElement).click();
            tick();
            fix.detectChanges();

            // Newly added condition should be empty
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, false, false, false);
            QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, '', '', '');

            // adding buttons and 'end' group button should be disabled
            let addingButtons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            expect(addingButtons.length).toBe(4);
            for (const button of addingButtons) {
                ControlsFunction.verifyButtonIsDisabled(button as HTMLElement);
            }

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

            // adding buttons should be enabled, 'end group' button should be disabled
            addingButtons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            expect(addingButtons.length).toBe(4);
            for (let i = 0; i < addingButtons.length; i++) {
                if (i === 3) {
                    ControlsFunction.verifyButtonIsDisabled(addingButtons[i] as HTMLElement);
                } else {
                    ControlsFunction.verifyButtonIsDisabled(addingButtons[i] as HTMLElement, false);
                }
            }

            // Start adding new condition to the currently added group
            (addingButtons[0] as HTMLElement).click();
            tick();
            fix.detectChanges();
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 2); // Select 'OrderDate' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 4); // Select 'Today' operator.

            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            // expect all adding buttons and 'end group' button to be enabled
            addingButtons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            expect(addingButtons.length).toBe(4);
            for (let i = 0; i < addingButtons.length; i++) {
                ControlsFunction.verifyButtonIsDisabled(addingButtons[i] as HTMLElement, false);
            }

            // Click 'End Group'
            (addingButtons[3] as HTMLElement).click();
            tick();
            fix.detectChanges();

            group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 4, 9);
            expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalled();
        }));

        it(`Should add a new 'Or' group to existing group by using add buttons.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();

            // Verify group's children count before adding a new child.
            let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);

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
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 4, 8);
            expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalled();
        }));

        it(`Should remove a condition from an existing group by using the 'close' icon of the respective chip.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();

            // Verify tree layout before deleting chips.
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);

            // Delete a chip and verify layout.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipRemoveIcon(fix, [0]);
            tick(100);
            fix.detectChanges();

            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 2, 2);
            expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalled();

            // Delete a chip and verify layout.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipRemoveIcon(fix, [1]);
            tick(100);
            flush();
            fix.detectChanges();
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 1, 1);

            // Verify remaining chip's content.
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'OrderId', 'Greater Than', '3');

            // Delete the last chip and verify that the group is deleted as well.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipRemoveIcon(fix, [0]);
            tick(100);
            flush();
            fix.detectChanges();

            const rootGroup = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;;
            expect(rootGroup).toBeNull();
        }));

        it('Should discard the added group when clicking its operator line without having a single expression.', fakeAsync(() => {
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 1);
            tick(100);
            fix.detectChanges();

            let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
            expect(group).not.toBeNull('There is no root group.');

            // Click root group's operator line and verify that the root group and all of its children become selected.
            const rootOperatorLine = QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement;
            rootOperatorLine.click();
            tick(200);
            fix.detectChanges();

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
      "fieldName": "ProductName",
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
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}`))[0].nativeElement;
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
            expect(dropdownItems.length).toBe(4);
            expect((dropdownItems[0] as HTMLElement).innerText).toBe('OrderId');
            expect((dropdownItems[1] as HTMLElement).innerText).toBe('OrderName');
            expect((dropdownItems[2] as HTMLElement).innerText).toBe('OrderDate');
        }));

        it('Operator dropdown should contain operators based on the column\'s datatype (\'string\' or \'number\' or \'date\').', fakeAsync(() => {
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}`))[0].nativeElement;
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
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}`))[0].nativeElement;
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
      "fieldName": "ProductName",
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
      "fieldName": "Id",
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
      "fieldName": "Id",
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
      "fieldName": "Released",
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
      "fieldName": "OrderDate",
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
    "OrderDate",
    "Delivered"
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

            // Verify operator icon
            const operatorInputGroup = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix).querySelector('igx-input-group') as HTMLElement;
            expect(operatorInputGroup.querySelector('igx-icon').attributes.getNamedItem('ng-reflect-name').nodeValue).toEqual('in');

            // Verify inputs states
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, false);

            // Should render empty query builder tree
            const nestedTree = fix.debugElement.query(By.css(QueryBuilderConstants.QUERY_BUILDER_TREE));
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
      "fieldName": "OrderId",
      "condition": {
        "name": "in",
        "isUnary": false,
        "isNestedQuery": true,
        "iconName": "in"
      },
      "conditionName": null,
      "ignoreCase": true,
      "searchVal": null,
      "searchTree": {
        "filteringOperands": [
          {
            "fieldName": "ProductName",
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
    "OrderDate",
    "Delivered"
  ]
}`);
        }));

        it('Should correctly apply an \'not-in\' column condition through UI.', fakeAsync(() => {
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
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 11); // Select 'Not-In' operator.

            // Verify operator icon
            const operatorInputGroup = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix).querySelector('igx-input-group') as HTMLElement;
            expect(operatorInputGroup.querySelector('igx-icon').attributes.getNamedItem('ng-reflect-name').nodeValue).toEqual('not-in');

            // Verify inputs states
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, false);

            // Should render empty query builder tree
            const nestedTree = fix.debugElement.query(By.css(QueryBuilderConstants.QUERY_BUILDER_TREE));
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
      "fieldName": "OrderId",
      "condition": {
        "name": "notIn",
        "isUnary": false,
        "isNestedQuery": true,
        "iconName": "not-in"
      },
      "conditionName": null,
      "ignoreCase": true,
      "searchVal": null,
      "searchTree": {
        "filteringOperands": [
          {
            "fieldName": "ProductName",
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
    "OrderDate",
    "Delivered"
  ]
}`);
        }));

        it('Should disable value fields when isNestedQuery condition is selected', fakeAsync(() => {
            //Run test for all data type fields of the Order entity
            for (let i = 0; i <= 3; i++) {
                QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0); // Click the initial 'Add Or Group' button.
                tick(100);
                fix.detectChanges();

                QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1); // Select 'Orders' entity
                tick(100);
                fix.detectChanges();

                QueryBuilderFunctions.selectColumnInEditModeExpression(fix, i); // Select 'OrderId','OrderName','OrderDate','Delivered' column.

                let InConditionIndex;
                switch (i) {
                    case 0:
                    case 1: InConditionIndex = 10; break;// for string and number
                    case 2: InConditionIndex = 16; break; //for date
                    case 3: InConditionIndex = 7; break; // for boolean
                }

                //Verify 'In' disables value input and renders empty sub query
                QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, InConditionIndex); // Select 'In' operator.
                QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, false);
                let nestedTree = fix.debugElement.query(By.css(QueryBuilderConstants.QUERY_BUILDER_TREE));
                expect(nestedTree).toBeDefined();

                //Verify 'NotIn' disables value input and renders empty sub query
                QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, InConditionIndex + 1); // Select 'NotIn' operator.
                QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, false);
                nestedTree = fix.debugElement.query(By.css(QueryBuilderConstants.QUERY_BUILDER_TREE));
                expect(nestedTree).toBeDefined();

                const closeBtn = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
                closeBtn.click();
                fix.detectChanges();
            }
        }));

        it('Should correctly focus the search value input when editing the filtering expression', fakeAsync(() => {
            //Create dateTime filtering expression
            const tree = new FilteringExpressionsTree(FilteringLogic.And, null, 'Orders', ['OrderId']);
            tree.filteringOperands.push({
                fieldName: 'OrderDate',
                searchVal: new Date('2024-09-17T21:00:00.000Z'),
                conditionName: 'equals',
                condition: IgxDateFilteringOperand.instance().condition('equals')
            });

            queryBuilder.expressionTree = tree;
            fix.detectChanges();

            // Hover the last visible expression chip
            const expressionItem = fix.nativeElement.querySelectorAll(`.${QueryBuilderConstants.QUERY_BUILDER_EXPRESSION_ITEM_CLASS}`)[0];
            expressionItem.dispatchEvent(new MouseEvent('mouseenter'));
            tick(200);
            fix.detectChanges();

            // Click the edit icon to enter edit mode of the expression.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipIcon(fix, [0], 'edit');
            tick(200);
            fix.detectChanges();

            //Check for the active element
            const searchValueInput = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            expect(document.activeElement).toBe(searchValueInput, 'The input should be the active element.');
        }));

        it('Should select/deselect a condition when its respective chip is clicked.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Verify first chip is not selected.
            QueryBuilderFunctions.verifyExpressionChipSelection(fix, [0], false);

            // Click first chip and verify it is selected.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyExpressionChipSelection(fix, [0], true);
            // Verify actions container is visible.
            expect(QueryBuilderFunctions.getQueryBuilderTreeExpressionActionsContainer(fix, [0]))
                .not.toBeNull('actions container is visible');

            // Click first chip again and verify it is not selected.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyExpressionChipSelection(fix, [0], false);
            // Verify actions container is not visible.
            expect(QueryBuilderFunctions.getQueryBuilderTreeExpressionActionsContainer(fix, [0]))
                .toBeNull('actions container is visible');
        }));

        it('Should display edit and add buttons when hovering a chip.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();
            // Verify actions container is not visible. (This container contains the 'edit' and the 'add' buttons.)
            expect(QueryBuilderFunctions.getQueryBuilderTreeExpressionActionsContainer(fix, [0]))
                .toBeNull('actions container is visible');

            // Hover the first chip and verify actions container is visible.
            UIInteractions.hoverElement(QueryBuilderFunctions.getQueryBuilderTreeItem(fix, [0]) as HTMLElement);
            tick(50);
            fix.detectChanges();
            expect(QueryBuilderFunctions.getQueryBuilderTreeExpressionActionsContainer(fix, [0]))
                .not.toBeNull('actions container is not visible');

            // Unhover the first chip and verify actions container is not visible.
            UIInteractions.unhoverElement(QueryBuilderFunctions.getQueryBuilderTreeItem(fix, [0]) as HTMLElement);
            tick(50);
            fix.detectChanges();
            expect(QueryBuilderFunctions.getQueryBuilderTreeExpressionActionsContainer(fix, [0]))
                .toBeNull('actions container is visible');
        }));

        it('Should have disabled adding buttons when an expression is in edit mode.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Verify adding buttons are enabled
            let buttons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                ControlsFunction.verifyButtonIsDisabled(button as HTMLElement, false);
            }

            // Enter edit mode
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], true);
            tick(50);
            fix.detectChanges();

            // Verify adding buttons are disabled
            buttons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                ControlsFunction.verifyButtonIsDisabled(button as HTMLElement);
            }

            // Exit edit mode
            const closeButton = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
            UIInteractions.simulateClickEvent(closeButton);
            tick(100);
            fix.detectChanges();

            // Verify adding buttons are enabled
            buttons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
            for (const button of buttons) {
                ControlsFunction.verifyButtonIsDisabled(button as HTMLElement, false);
            }
        }));

        it('Double-clicking a condition should put it in edit mode.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Double-click the existing chip to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], true);
            tick(50);
            fix.detectChanges();
            // Verify inputs values
            QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'OrderId', 'Greater Than', '3');
            // Edit the operator
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Equals' operator.
            // Commit the change
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();
            // Verify the chip
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [1], 'OrderId', 'Equals', '3');

            // Verify that the nested query is not expanded
            expect(fix.debugElement.query(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();

            // Double-click the nested query chip to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], true);
            tick(50);
            fix.detectChanges();
            // Verify the query is expanded
            expect(fix.debugElement.query(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeTrue();
            // Double-click a chip in the nested query three to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], true, 1);
            tick(50);
            fix.detectChanges();
            // Verify inputs values
            QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'ProductName', 'Contains', 'a', 1);
            // Edit the operator
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2, 1); // Select 'Starts With' operator.
            // Commit the change
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix, 1);
            fix.detectChanges();
            // Verify the chip
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'ProductName', 'Starts With', 'a', 1);
        }));

        it('Should select/deselect all child conditions and groups when clicking a group\'s operator line.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            const childGroup = new FilteringExpressionsTree(FilteringLogic.Or, undefined, undefined);
            childGroup.filteringOperands.push({
                fieldName: 'OrderNameName',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                searchVal: 'a'
            });
            queryBuilder.expressionTree.filteringOperands.push(childGroup);
            fix.detectChanges();
            tick(100);
            fix.detectChanges();
            // Click root group's operator line and verify that the root group and all of its children become selected.
            let rootOperatorLine = QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement;
            rootOperatorLine.click();
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyChildrenSelection(QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix) as HTMLElement, true);

            // Click root group's operator line again and verify that the root group and all of its children become unselected.
            rootOperatorLine = QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement;
            rootOperatorLine.click();
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyChildrenSelection(QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fix) as HTMLElement, false);

            // Click an inner group's operator line and verify its children become selected.
            QueryBuilderFunctions.clickQueryBuilderTreeGroupOperatorLine(fix, [0]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyChildrenSelection(QueryBuilderFunctions.getQueryBuilderTreeItem(fix, [0]) as HTMLElement, true);

            // Click an inner group's operator line again and verify its children become unselected.
            QueryBuilderFunctions.clickQueryBuilderTreeGroupOperatorLine(fix, [0]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyChildrenSelection(QueryBuilderFunctions.getQueryBuilderTreeItem(fix, [0]) as HTMLElement, false);
        }));

        it('Should display an alert dialog when the entity is changed and showEntityChangeDialog is true.', fakeAsync(() => {
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_CLASS}`))[0].nativeElement;
            const queryTreeElement = queryBuilderElement.querySelector(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}`);
            const dialog = queryTreeElement.querySelector('igx-dialog');
            const dialogOutlet = document.querySelector('.igx-dialog__window');
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

            // Show again checkbox should be unchecked
            const checkbox = dialogOutlet.querySelector('igx-checkbox');
            expect(checkbox).toBeDefined();
            expect(checkbox).not.toHaveClass('igx-checkbox--checked');
            expect(queryBuilder.showEntityChangeDialog).toBeTrue();

            // Close dialog
            const cancelButton = Array.from(dialogOutlet.querySelectorAll('button'))[0];
            cancelButton.click();
            tick(100);
            fix.detectChanges();

            // Select entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1);
            tick(100);
            fix.detectChanges();

            // Alert dialog should NOT be opened
            expect(dialog.checkVisibility()).toBeTrue();
        }));

        it('Should not display an alert dialog when the entity changed once showEntityChangeDialog is disabled.', fakeAsync(() => {
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_CLASS}`))[0].nativeElement;
            const queryTreeElement = queryBuilderElement.querySelector(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}`);
            const dialog = queryTreeElement.querySelector('igx-dialog');
            const dialogOutlet = document.querySelector('.igx-dialog__window');
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

            // Check show again checkbox
            const checkbox = dialogOutlet.querySelector('igx-checkbox') as HTMLElement;
            expect(checkbox).toBeDefined();

            checkbox.click();
            tick(100);
            fix.detectChanges();
            expect(checkbox).toHaveClass('igx-checkbox--checked');
            expect(queryBuilder.showEntityChangeDialog).toBeFalse();

            // Close dialog
            const cancelButton = Array.from(dialogOutlet.querySelectorAll('button'))[0];
            cancelButton.click();
            tick(100);
            fix.detectChanges();

            // Select entity
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1);
            tick(100);
            fix.detectChanges();

            // Alert dialog should NOT be opened
            expect(dialog.checkVisibility()).toBeFalse();
        }));

        it('Initially should not display an alert dialog when the entity is changed if hideEntityChangeDialog is disabled through API.', fakeAsync(() => {
            queryBuilder.showEntityChangeDialog = false;
            const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_CLASS}`))[0].nativeElement;
            const queryTreeElement = queryBuilderElement.querySelector(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}`);
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

            // Alert dialog should NOT be opened
            expect(dialog.checkVisibility()).toBeFalse();
        }));

        it('Should reset all inputs when the entity is changed.', fakeAsync(() => {
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
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Verify all inputs
            QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Orders', 'OrderId, OrderName, OrderDate, Delivered', '', '', '');
        }));

        it('Should NOT reset all inputs when the entity is not changed.', fakeAsync(() => {
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

            const queryTreeElement: HTMLElement = fix.debugElement.queryAll(By.css(QueryBuilderConstants.QUERY_BUILDER_TREE))[0].nativeElement;
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

        it(`Parent "commit" button should be disabled if a child condition is edited.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Double-click the parent chip 'Products' to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], true);
            tick(50);
            fix.detectChanges();

            // Double-click the child chip 'Released' to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], true, 1);
            tick(50);
            fix.detectChanges();

            // Change the 'Released' operator
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2, 1); // Select 'False' operator.

            // Verify both parent and child commit buttons are enabled
            let parentCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
            let childCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix, 1);

            ControlsFunction.verifyButtonIsDisabled(parentCommitBtn as HTMLElement);
            ControlsFunction.verifyButtonIsDisabled(childCommitBtn as HTMLElement, false);

            // Commit the change
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix, 1);

            // Double-click the child chip 'ProductName' to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], true, 1);
            tick(50);
            fix.detectChanges();

            // Change the 'ProductName' column to 'Id'
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0, 1);

            // Verify input values
            QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'Id', '', '', 1);

            // Verify parent and child commit buttons are disabled
            parentCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
            childCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix, 1);

            ControlsFunction.verifyButtonIsDisabled(parentCommitBtn as HTMLElement);
            ControlsFunction.verifyButtonIsDisabled(childCommitBtn as HTMLElement);

            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0, 1);
            //Type Value
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, false, 1).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '1');
            tick(100);
            fix.detectChanges();

            // Commit the child
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix, 1);
            tick(50);
            fix.detectChanges();

            // Verify parent is enabled
            parentCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
            ControlsFunction.verifyButtonIsDisabled(parentCommitBtn as HTMLElement, false);
        }));

        it(`'In' condition 'commit' button should be disabled if there are no return fields in the nested query.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Double-click the parent chip 'Products' to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], true);
            tick(50);
            fix.detectChanges();

            let commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
            ControlsFunction.verifyButtonIsDisabled(commitBtn as HTMLElement, false);

            // Deselect all fields
            QueryBuilderFunctions.selectFieldsInEditModeExpression(fix, [0], 1);
            commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
            ControlsFunction.verifyButtonIsDisabled(commitBtn as HTMLElement);

            // Select all fields
            QueryBuilderFunctions.selectFieldsInEditModeExpression(fix, [0], 1);
            commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
            ControlsFunction.verifyButtonIsDisabled(commitBtn as HTMLElement, false);
        }));

        it('Should collapse nested query when it is committed.', fakeAsync(() => {
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
            expect(fix.debugElement.query(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeTrue();

            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            tick(100);
            fix.detectChanges();

            // Verify that the nested query is collapsed
            expect(fix.debugElement.query(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();
        }));

        it(`Should discard the changes in the fields if 'close' button of nested query condition is clicked.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();
            // Verify parent chip expression
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'OrderId', 'In', 'Products / Id');

            // Double-click the parent chip 'Products' to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], true);
            tick(50);
            fix.detectChanges();

            // Select 'Product Name' fields
            QueryBuilderFunctions.selectFieldsInEditModeExpression(fix, [1, 2], 1);
            const closeBtn = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
            closeBtn.click();
            tick(50);
            fix.detectChanges();
            // Verify parent chip expression is not changed
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'OrderId', 'In', 'Products / Id');
        }));

        it(`Should toggle the nested query on 'expand'/'collapse' button click.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            expect(fix.debugElement.query(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();

            const queryTreeElement: HTMLElement = fix.debugElement.queryAll(By.css(QueryBuilderConstants.QUERY_BUILDER_TREE))[0].nativeElement;
            // Nested query tree should have expand collapse button
            const expressionItems = Array.from(queryTreeElement.querySelectorAll('.igx-filter-tree__expression-item'));
            const expandableItem = expressionItems.filter(item =>
                (item.querySelector('.igx-filter-tree__expression-condition') as HTMLElement).innerText == 'In' ||
                (item.querySelector('.igx-filter-tree__expression-condition') as HTMLElement).innerText == 'Not In'
            )[0];
            const toggleBtn = expandableItem.querySelector('.igx-filter-tree__details-button') as HTMLElement;
            expect((toggleBtn.querySelector('igx-icon') as HTMLElement).innerText).toBe('unfold_more');
            toggleBtn.click();
            tick(100);
            fix.detectChanges();

            expect((toggleBtn.querySelector('igx-icon') as HTMLElement).innerText).toBe('unfold_less');
            expect(fix.debugElement.query(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeTrue();
        }));

        it('Should create an "and"/"or" group on context menu button click and delete conditions on "delete filters" click.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            // Verify group types initially
            QueryBuilderFunctions.verifyGroupLineCount(fix, 2, 0);

            QueryBuilderFunctions.createGroupFromBottomTwoChips(fix, "OR")

            //OR group should have been created
            QueryBuilderFunctions.verifyGroupLineCount(fix, 2, 1);
            let childGroup = QueryBuilderFunctions.getQueryBuilderTreeChildGroups(QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement);
            expect(childGroup.length).toBe(1);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(childGroup[0] as HTMLElement).length).toBe(2);

            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 0], 'OrderId', 'Greater Than', undefined);
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 1], 'OrderDate', 'After', undefined);

            QueryBuilderFunctions.createGroupFromBottomTwoChips(fix, "AND")

            //AND group should have been created
            QueryBuilderFunctions.verifyGroupLineCount(fix, 3, 1);

            childGroup = QueryBuilderFunctions.getQueryBuilderTreeChildGroups(QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement);
            expect(childGroup.length).toBe(1);
            expect(QueryBuilderFunctions.getQueryBuilderTreeChildItems(childGroup[0] as HTMLElement).length).toBe(1);

            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 0, 0], 'OrderId', 'Greater Than', undefined);
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0, 0, 1], 'OrderDate', 'After', undefined);

            //Open Or group context menu
            QueryBuilderFunctions.clickQueryBuilderTreeGroupOperatorLine(fix, [0, 0]);
            tick();
            fix.detectChanges();

            //Click Delete group
            const contextMenus = QueryBuilderFunctions.getQueryBuilderContextMenus(fix);
            const deleteButton = QueryBuilderFunctions.getQueryBuilderGroupContextMenuButton(contextMenus[1], 'Delete');
            deleteButton.nativeElement.click();
            tick(200);
            fix.detectChanges();

            //Group's conditions should have been deleted
            const chips = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            expect(chips.length).toBe(3, "Chips ware not deleted");
        }));

        it('Ungroup button of the root group\'s context menu should be disabled.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            // Click root group's operator line.
            const rootOperatorLine = QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement;
            rootOperatorLine.click();
            tick(200);
            fix.detectChanges();

            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);
            const contextMenu = QueryBuilderFunctions.getQueryBuilderContextMenus(fix)[1];

            // Verify the unGroup button is disabled.
            const unGroupButton = QueryBuilderFunctions.getQueryBuilderGroupContextMenuButton(contextMenu, 'UnGroup');
            ControlsFunction.verifyButtonIsDisabled(unGroupButton.nativeElement);
        }));

        it('Should remove a group from the expr tree when clicking "delete" from the context menu.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);

            //create group
            QueryBuilderFunctions.createGroupFromBottomTwoChips(fix, "AND");

            //Click group line
            QueryBuilderFunctions.clickQueryBuilderTreeGroupOperatorLine(fix, [0]);
            tick(200);
            fix.detectChanges();

            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);
            const contextMenu = QueryBuilderFunctions.getQueryBuilderContextMenus(fix)[1];

            //click delete group
            const deleteButton = QueryBuilderFunctions.getQueryBuilderGroupContextMenuButton(contextMenu, 'Delete');
            deleteButton.nativeElement.click();
            tick(200);
            fix.detectChanges();

            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 1, 4);
            QueryBuilderFunctions.verifyGroupLineCount(fix, 2, 0);
        }));

        it('Should be able to open edit mode when condition is selected, close the edited condition on "close" button click and not commit it.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            //Select chip
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
            tick(200);
            fix.detectChanges();

            //Open edit mode
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChipIcon(fix, [1], 'edit');
            tick();
            fix.detectChanges();

            const closeBtn = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);

            // Verify the enabled/disabled state of each input of the expression in edit mode.
            QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, true, true);

            // Verify the edit inputs values.
            QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'OrderId', 'Greater Than', '3');

            //edit condition fields
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'OrderName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.
            const value = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(value, '5');
            tick(200);
            fix.detectChanges();

            //cancel edit
            closeBtn.click();
            tick();
            fix.detectChanges();

            //Verify changes are reverted
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [1], 'OrderId', 'Greater Than', '3');
        }));

        it('Selecting/deselecting multiple conditions should display/hide the (create group)/(delete filters) context menu properly.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, false);

            //select 1
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, false);

            //select 2
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);

            //select 3
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [2]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);

            // Unselecting conditions until one selected remains should hide the context menu

            //deselect 3
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [2]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);

            //deselect 2
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, false);
        }));

        it(`Should show/hide the group's context menu when clicking its operator line and should close the context menu when clicking its close button.`, fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            const rootOperatorLine = QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement;

            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, false);

            //Click line to open menu
            rootOperatorLine.click();
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);

            //Click line to close menu
            rootOperatorLine.click();
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, false);

            //Click line to open menu
            rootOperatorLine.click();
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);

            //Click close button to close menu
            QueryBuilderFunctions.clickQueryBuilderContextMenuCloseButton(fix, 1);
            tick(200);
            fix.detectChanges();

            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, false);
        }));

        it('Should be able to group, change And/Or and un-group conditions.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);
            QueryBuilderFunctions.verifyGroupLineCount(fix, 2, 0);

            //Select condition 1 and 2
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
            tick(200);
            fix.detectChanges();
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);

            //Group them as AND group
            const contextMenu = QueryBuilderFunctions.getQueryBuilderContextMenus(fix)[1];
            const andButton = QueryBuilderFunctions.getQueryBuilderGroupContextMenuButton(contextMenu, 'Create "And" Group');
            andButton.nativeElement.click();
            tick(200);
            fix.detectChanges();

            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 2, 7, [0], 2, 5);
            QueryBuilderFunctions.verifyGroupLineCount(fix, 3, 0);

            //Change group to OR
            QueryBuilderFunctions.clickQueryBuilderTreeGroupOperatorLine(fix, [0]);
            tick(200);
            fix.detectChanges();
            const orButton = QueryBuilderFunctions.getQueryBuilderGroupContextMenuButton(contextMenu, 'Or');
            orButton.nativeElement.click();
            tick();
            fix.detectChanges();
            tick();
            fix.detectChanges();

            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 2, 7, [0], 2, 5);
            QueryBuilderFunctions.verifyGroupLineCount(fix, 2, 1);

            //Un-group OR group
            const unGroupButton = QueryBuilderFunctions.getQueryBuilderGroupContextMenuButton(contextMenu, 'UnGroup');
            unGroupButton.nativeElement.click();
            tick(200);
            fix.detectChanges();

            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);
        }));

        it('canCommit should return the correct validity state of currently edited condition.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            // Double-click the existing chip to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], true);
            tick(50);
            fix.detectChanges();
            expect(queryBuilder.canCommit()).toBeTrue();

            // Verify the Query Builder validity state while editing a condition.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1);
            expect(queryBuilder.canCommit()).toBeFalse();
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);
            expect(queryBuilder.canCommit()).toBeFalse();
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();
            expect(queryBuilder.canCommit()).toBeTrue();
        }));

        it('canCommit should return the correct validity state of currently added condition.', fakeAsync(() => {
            // Click the initial 'Add Or Group' button.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();
            expect(queryBuilder.canCommit()).toBeFalse();

            // Verify the Query Builder validity state while adding a condition.
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1); // Select 'Orders' entity
            tick(100);
            fix.detectChanges();
            expect(queryBuilder.canCommit()).toBeFalse();
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1);
            expect(queryBuilder.canCommit()).toBeFalse();
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);
            expect(queryBuilder.canCommit()).toBeFalse();
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();
            expect(queryBuilder.canCommit()).toBeTrue();

            // Click on the 'cancel' button
            const closeButton = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
            UIInteractions.simulateClickEvent(closeButton);
            tick(100);
            fix.detectChanges();

            // Verify the Query Builder validity state for UNARY condition.
            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1); // Select 'Orders' entity
            tick(100);
            fix.detectChanges();

            expect(queryBuilder.canCommit()).toBeFalse();
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 3);
            expect(queryBuilder.canCommit()).toBeFalse();
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 1);
            expect(queryBuilder.canCommit()).toBeTrue();
        }));
    });

    describe('API', () => {
        beforeEach(fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();
            tick(100);
            fix.detectChanges();

            spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();
        }));

        it(`Should commit the changes in a valid edited condition when the 'commit' method is called.`, fakeAsync(() => {
            // Double-click the existing chip to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], true);
            tick(50);
            fix.detectChanges();

            // Change the current condition
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1);
            expect(queryBuilder.canCommit()).toBeFalse();
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);
            expect(queryBuilder.canCommit()).toBeFalse();
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();

            // Apply the changes
            queryBuilder.commit();
            tick(100);
            fix.detectChanges();

            // Verify expression is commited
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [1], 'OrderName', 'Contains', 'a');

            // Verify event is not fired
            expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalledTimes(0);
        }));

        it(`Should discard the changes in a valid edited condition when the 'discard' method is called.`, fakeAsync(() => {
            // Double-click the existing chip to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], true);
            tick(50);
            fix.detectChanges();

            // Change the current condition
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1);
            expect(queryBuilder.canCommit()).toBeFalse();
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);
            expect(queryBuilder.canCommit()).toBeFalse();
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();

            // Discard the changes
            queryBuilder.discard();
            tick(100);
            fix.detectChanges();

            // Verify expression is not commited
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [1], 'OrderId', 'Greater Than', '3');

            // Verify event is not fired
            expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalledTimes(0);
        }));

        it('Should properly commit/discard changes in nested query.', fakeAsync(() => {
            // Double-click the existing chip to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], true);
            tick(50);
            fix.detectChanges();
            expect(queryBuilder.canCommit()).toBeTrue();

            // Start editing expression in the nested query
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], true, 1);
            tick(50);
            fix.detectChanges();
            expect(queryBuilder.canCommit()).toBeTrue();
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0, 1);
            expect(queryBuilder.canCommit()).toBeFalse();

            // Discard the changes
            queryBuilder.discard();
            tick(100);
            fix.detectChanges();

            // Verify the nested query is collapsed
            expect(fix.debugElement.query(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();

            // Start editing expression in the nested query
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], true, 1);
            tick(50);
            fix.detectChanges();
            expect(queryBuilder.canCommit()).toBeTrue();
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0, 1);
            expect(queryBuilder.canCommit()).toBeFalse();
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0, 1);
            expect(queryBuilder.canCommit()).toBeFalse();
            const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, false, 1).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, '1');
            tick(100);
            fix.detectChanges();
            expect(queryBuilder.canCommit()).toBeTrue();

            // Apply the changes
            queryBuilder.commit();
            tick(100);
            fix.detectChanges();

            // Verify the nested query is collapsed
            expect(fix.debugElement.query(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();

            // Expand the nested query
            const toggleBtn = fix.debugElement.query(By.css('.igx-filter-tree__details-button')).nativeElement;
            toggleBtn.click();
            tick(100);
            fix.detectChanges();

            // Verify edited expressions
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'Id', 'Equals', '1', 1);
            QueryBuilderFunctions.verifyExpressionChipContent(fix, [1], 'Released', 'True', undefined, 1);
        }));

        it('Should NOT throw errors when an invalid condition is committed through API.', fakeAsync(() => {
            spyOn(console, 'error');
            // Double-click the existing chip to enter edit mode.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [2], true);
            tick(50);
            fix.detectChanges();

            // Change the current condition
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1);
            expect(queryBuilder.canCommit()).toBeFalse();

            let errMessage = '';
            // Apply the changes
            try {
                queryBuilder.commit();
                tick(100);
                fix.detectChanges();
            } catch (err) {
                errMessage = err.message;
            }

            expect(errMessage).toBe("Expression tree can't be committed in the current state. Use `canCommit` method to check if the current state is valid.");
        }));
    });

    describe('Keyboard navigation', () => {
        it('Should navigate with Tab/Shift+Tab through entity and fields inputs, chips, their respective delete icons and the operator lines.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            QueryBuilderFunctions.verifyQueryBuilderTabbableElements(fix);
        }));

        it('Should navigate with Tab/Shift+Tab through chips" "edit", "cancel" and "adding" buttons, fields of a condition in edit mode.', fakeAsync(() => {
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            const chip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[0];

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', chip.nativeElement, 200);

            const chipActions = fix.debugElement.query(By.css('.igx-filter-tree__expression-actions'));
            QueryBuilderFunctions.verifyTabbableChipActions(chipActions);

            // Open Edit mode and check condition line elements
            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', chipActions.children[0].nativeElement, 200);

            const editLine = fix.debugElement.queryAll(By.css('.igx-filter-tree__inputs'))[1];
            QueryBuilderFunctions.verifyTabbableConditionEditLineElements(editLine);

            const editDialog = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_BODY}`))[1];
            QueryBuilderFunctions.verifyTabbableInConditionDialogElements(editDialog);
        }));

        it('Should select/deselect a condition when pressing \'Enter\' on its respective chip.', fakeAsync(() => {
            //!Both Enter and Space should work
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            const chip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[0];

            QueryBuilderFunctions.verifyChipSelectedState(chip.nativeElement, false);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', chip.nativeElement, 200);

            QueryBuilderFunctions.verifyChipSelectedState(chip.nativeElement, true);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', chip.nativeElement, 200);

            QueryBuilderFunctions.verifyChipSelectedState(chip.nativeElement, false);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, 'Enter', chip.nativeElement, 200);

            QueryBuilderFunctions.verifyChipSelectedState(chip.nativeElement, true);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, 'Enter', chip.nativeElement, 200);

            QueryBuilderFunctions.verifyChipSelectedState(chip.nativeElement, false);
        }));

        //Should select/deselect all child conditions and groups when pressing \'Enter\' on  a group\'s operator line.
        //Should open the group"s context menu when pressing "Enter"/"space"  on its operator line.
        it('Should select/deselect all child conditions/groups and open/close group context menu when pressing "Enter"/"space" on its operator line.', fakeAsync(() => {
            //!Both Enter and Space should work
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            const line = fix.debugElement.queryAll(By.css(`.${QueryBuilderConstants.QUERY_BUILDER_OPERATOR_LINE_AND_CSS_CLASS}`))[0];
            const chips = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            QueryBuilderFunctions.verifyChipSelectedState(chips[0].nativeElement, false);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3].nativeElement, false);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, false);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', line.nativeElement);

            QueryBuilderFunctions.verifyChipSelectedState(chips[0].nativeElement, true);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3].nativeElement, true);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', line.nativeElement);

            QueryBuilderFunctions.verifyChipSelectedState(chips[0].nativeElement, false);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3].nativeElement, false);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, false);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, 'Enter', line.nativeElement);

            QueryBuilderFunctions.verifyChipSelectedState(chips[0].nativeElement, true);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3].nativeElement, true);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, true);

            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, 'Enter', line.nativeElement);

            QueryBuilderFunctions.verifyChipSelectedState(chips[0].nativeElement, false);
            QueryBuilderFunctions.verifyChipSelectedState(chips[3].nativeElement, false);
            QueryBuilderFunctions.verifyGroupContextMenuVisibility(fix, false);
        }));

        it('Should remove a chip in when pressing \'Enter\' on its \'remove\' icon.', fakeAsync(() => {
            //!Both Enter and Space should work
            queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
            fix.detectChanges();

            // Verify the there are three chip expressions.
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);

            // Press 'Enter' on the remove icon of the second chip.
            const chip = QueryBuilderFunctions.getQueryBuilderTreeExpressionChip(fix, [1]);
            const removeIcon = ControlsFunction.getChipRemoveButton(chip as HTMLElement);
            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, 'Enter', removeIcon);
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 2, 5);

            // Press 'Space' on the remove icon of the second chip.
            const chip2 = QueryBuilderFunctions.getQueryBuilderTreeExpressionChip(fix, [0]);
            const removeIcon2 = ControlsFunction.getChipRemoveButton(chip2 as HTMLElement);
            QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', removeIcon2);
            QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 1, 1);
        }));
    });

    describe('Localization', () => {
        it('Should correctly change resource strings for Query Builder.', fakeAsync(() => {
            queryBuilder.resourceStrings = Object.assign({}, queryBuilder.resourceStrings, {
                igx_query_builder_title: 'My advanced filter',
                igx_query_builder_and_group: 'My and group',
                igx_query_builder_or_group: 'My or group',
                igx_query_builder_end_group: 'My end group',
                igx_query_builder_create_and_group: 'My create and group',
                igx_query_builder_create_or_group: 'My create or group',
                igx_query_builder_filter_operator_and: 'My and',
                igx_query_builder_filter_operator_or: 'My or',
                igx_query_builder_and_label: 'My and',
                igx_query_builder_or_label: 'My or',
                igx_query_builder_add_condition: 'My condition',
                igx_query_builder_ungroup: 'My ungroup',
                igx_query_builder_delete: 'My delete',
                igx_query_builder_delete_filters: 'My delete filters',
                igx_query_builder_initial_text: 'My initial text',
                igx_query_builder_dialog_title: 'My Confirmation',
                igx_query_builder_dialog_message: 'My changing entity message',
                igx_query_builder_dialog_checkbox_text: 'My do not show this dialog again',
                igx_query_builder_dialog_cancel: 'My Cancel',
                igx_query_builder_dialog_confirm: 'My Confirm'
            });
            fix.detectChanges();

            expect(QueryBuilderFunctions.getQueryBuilderHeaderText(fix)).toBe(' My advanced filter ');
            expect((QueryBuilderFunctions.getQueryBuilderHeaderLegendItemAnd(fix) as HTMLElement).innerText).toBe('My and');
            expect((QueryBuilderFunctions.getQueryBuilderHeaderLegendItemOr(fix) as HTMLElement).innerText).toBe('My or');
            expect(QueryBuilderFunctions.getQueryBuilderInitialAddGroupButtons(fix)[0].querySelector('span').innerText)
                .toBe('My and group');
            expect(QueryBuilderFunctions.getQueryBuilderInitialAddGroupButtons(fix)[1].querySelector('span').innerText)
                .toBe('My or group');
            expect((QueryBuilderFunctions.getQueryBuilderEmptyPrompt(fix) as HTMLElement).innerText).toBe('My initial text');

            QueryBuilderFunctions.clickQueryBuilderInitialAddGroupButton(fix, 0);
            tick(100);
            fix.detectChanges();

            expect((QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[0] as HTMLElement).querySelector('span').innerText)
                .toBe('My condition');
            expect((QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[1] as HTMLElement).querySelector('span').innerText)
                .toBe('My and group');
            expect((QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[2] as HTMLElement).querySelector('span').innerText)
                .toBe('My or group');

            // Populate edit inputs.
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0); // Select 'Products'.

            // Show changing entity alert dialog
            QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1);
            tick(100);
            fix.detectChanges();
            const dialogOutlet = document.querySelector('.igx-dialog__window');
            expect(dialogOutlet).toBeDefined();

            expect(dialogOutlet.querySelector('.igx-dialog__window-title').textContent.trim()).toBe('My Confirmation');
            expect(dialogOutlet.querySelector('.igx-query-builder-dialog').children[0].textContent.trim()).toBe('My changing entity message');
            expect(dialogOutlet.querySelector('.igx-query-builder-dialog').children[1].textContent.trim()).toBe('My do not show this dialog again');
            expect(dialogOutlet.querySelector('.igx-dialog__window-actions').children[0].textContent.trim()).toBe('My Cancel');
            expect(dialogOutlet.querySelector('.igx-dialog__window-actions').children[1].textContent.trim()).toBe('My Confirm');

            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.

            let input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            const rootOperatorLine = QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement;
            rootOperatorLine.click();
            fix.detectChanges();

            const buttonGroupItems = Array.from(QueryBuilderFunctions.getQueryBuilderContextMenuButtonGroup(fix).querySelectorAll('.igx-button-group__item-content'));
            expect((buttonGroupItems[0] as HTMLElement).textContent).toBe('My and');
            expect((buttonGroupItems[1] as HTMLElement).textContent).toBe('My or');
            expect((QueryBuilderFunctions.getQueryBuilderContextMenuButtons(fix)[3] as HTMLElement).querySelector('span').innerText)
                .toBe('My ungroup');
            expect((QueryBuilderFunctions.getQueryBuilderContextMenuButtons(fix)[4] as HTMLElement).querySelector('span').innerText)
                .toBe('My delete');

            // Close context menu.
            QueryBuilderFunctions.clickQueryBuilderContextMenuCloseButton(fix);
            fix.detectChanges();

            // Add another expression to root group.
            let btn = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[0] as HTMLElement;
            btn.click();
            fix.detectChanges();

            // Populate edit inputs.
            QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
            QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Contains' operator.

            input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
            UIInteractions.clickAndSendInputElementValue(input, 'a');
            tick(100);
            fix.detectChanges();
            // Commit the populated expression.
            QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
            fix.detectChanges();

            // Select two chips.
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
            QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
            tick(200);
            fix.detectChanges();

            expect((QueryBuilderFunctions.getQueryBuilderContextMenuButtons(fix)[1] as HTMLElement).innerText).toBe('My create and group');
            expect((QueryBuilderFunctions.getQueryBuilderContextMenuButtons(fix)[2] as HTMLElement).innerText).toBe('My create or group');
            expect((QueryBuilderFunctions.getQueryBuilderContextMenuButtons(fix)[3] as HTMLElement).innerText).toBe('My delete filters');

            // Close context menu.
            QueryBuilderFunctions.clickQueryBuilderContextMenuCloseButton(fix);
            tick(100);
            fix.detectChanges();

            // Add an 'or' group to root group.
            btn = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[2] as HTMLElement;
            btn.click();
            tick(100);
            fix.detectChanges();

            const endGroupButton = QueryBuilderFunctions.getQueryBuilderTreeGroupButtons(fix, [0], 0)[3] as HTMLElement;
            expect(endGroupButton.querySelector('span').innerText).toBe('My end group');
        }));
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
export class IgxQueryBuilderSampleTestComponent implements OnInit {
    @ViewChild(IgxQueryBuilderComponent) public queryBuilder: IgxQueryBuilderComponent;
    public entities: Array<any>;

    public ngOnInit(): void {
        this.entities = SampleEntities.map(a => ({ ...a }));
    }
}

@Component({
    template: `
     <igx-query-builder #queryBuilder [entities]="this.entities" [expressionTree]="this.expressionTree">
         <igx-query-builder-header [title]="'Custom Title'" [showLegend]="showLegend"></igx-query-builder-header>
         <ng-template #searchValueTemplate
                        igxQueryBuilderSearchValue
                        let-searchValue
                        let-selectedField = "selectedField"
                        let-selectedCondition = "selectedCondition"
                        let-defaultSearchValueTemplate = "defaultSearchValueTemplate">
            <input type="text" class="custom-class" required [(ngModel)]="searchValue.value"/>
            <p class="selectedField">{{selectedField.field}}</p>
            <p class="selectedCondition">{{selectedCondition}}</p>
        </ng-template>
     </igx-query-builder>
    `,
    standalone: true,
    imports: [
        IgxQueryBuilderComponent,
        IgxQueryBuilderHeaderComponent,
        IgxQueryBuilderSearchValueTemplateDirective,
        FormsModule
    ]
})
export class IgxQueryBuilderCustomTemplateSampleTestComponent implements OnInit {
    @ViewChild(IgxQueryBuilderComponent) public queryBuilder: IgxQueryBuilderComponent;
    @ViewChild('searchValueTemplate', { read: IgxQueryBuilderSearchValueTemplateDirective, static: true })
    public searchValueTemplate: IgxQueryBuilderSearchValueTemplateDirective;
    public entities: Array<any>;
    public showLegend = false;
    public expressionTree: IExpressionTree;


    public ngOnInit(): void {
        this.entities = SampleEntities.map(a => ({ ...a }));

        const tree = new FilteringExpressionsTree(FilteringLogic.And, null, 'Orders', ['*']);
        tree.filteringOperands.push({
            fieldName: 'OrderId',
            condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
            conditionName: 'greaterThan',
            searchVal: 3,
            ignoreCase: true
        });

        this.expressionTree = tree;
    }
}
