import { waitForAsync, TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { FilteringExpressionsTree, FilteringLogic, IExpressionTree, IgxChipComponent, IgxComboComponent, IgxDateFilteringOperand, IgxNumberFilteringOperand, IgxQueryBuilderComponent, IgxQueryBuilderHeaderComponent, IgxQueryBuilderSearchValueTemplateDirective } from 'igniteui-angular';
import { configureTestSuite } from '../test-utils/configure-suite';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { QueryBuilderFunctions, SampleEntities } from './query-builder-functions.spec';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { QueryBuilderSelectors } from './query-builder.common';

describe('IgxQueryBuilder', () => {
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
        IgxComboComponent
      ]
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fix = TestBed.createComponent(IgxQueryBuilderSampleTestComponent);
    fix.detectChanges();
    queryBuilder = fix.componentInstance.queryBuilder;
  }));

  describe('Basic', () => {
    it('Should render empty Query Builder properly.', fakeAsync(() => {
      tick(100);
      fix.detectChanges();
      const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER}`))[0].nativeElement;
      expect(queryBuilderElement).toBeDefined();
      expect(queryBuilderElement.children.length).toEqual(1);

      const queryTreeElement = queryBuilderElement.children[0];
      expect(queryTreeElement).toHaveClass(QueryBuilderSelectors.QUERY_BUILDER_TREE);

      expect(queryBuilder.expressionTree).toBeUndefined();

      expect(queryTreeElement.children.length).toEqual(3);
      const bodyElement = queryTreeElement.children[0];
      expect(bodyElement).toHaveClass(QueryBuilderSelectors.QUERY_BUILDER_BODY);
      expect(bodyElement.children.length).toEqual(1);

      QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, false);
      QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, '', '');

      // Select 'Products' entity
      QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0);
      tick(100);
      fix.detectChanges();

      QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true);
      QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Products', 'Id, ProductName, OrderId, Released');
    }));

    it('Should render Query Builder with initially set expression tree properly.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      const queryTreeElement: HTMLElement = fix.debugElement.queryAll(By.css(QueryBuilderSelectors.QUERY_BUILDER_TREE))[0].nativeElement;
      const bodyElement = queryTreeElement.children[0];
      expect(bodyElement).toHaveClass(QueryBuilderSelectors.QUERY_BUILDER_BODY);
      expect(bodyElement.children.length).toEqual(2);

      // Verify the operator line of the root group is an 'And' line.
      QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement, 'and');
      // all inputs should be displayed correctly
      const selectFromContainer = bodyElement.children[0];
      expect(selectFromContainer).toHaveClass('igx-filter-tree__inputs');
      expect(selectFromContainer.children[0].children[1].tagName).toEqual('IGX-SELECT');
      expect(selectFromContainer.children[1].children[1].tagName).toEqual('IGX-COMBO');
      const queryTreeExpressionContainer = bodyElement.children[1].children[1];
      expect(queryTreeExpressionContainer).toHaveClass('igx-filter-tree');
      expect(queryTreeExpressionContainer.children[1]).toHaveClass('igx-filter-tree__expressions');

      const selectEntity = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix, 0);
      expect(selectEntity.children[0].classList.contains('igx-input-group--disabled')).toBeFalse();

      const fieldsCombo = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix, 0);
      expect(fieldsCombo.children[0].classList.contains('igx-input-group--disabled')).toBeFalse();

      const expressionItems = queryTreeExpressionContainer.children[1].children[1].querySelectorAll(':scope > .igx-filter-tree__expression-item');
      expect(expressionItems.length).toEqual(queryBuilder.expressionTree.filteringOperands.length);
      // entity select should have proper value
      expect(queryBuilder.queryTree.selectedEntity.name).toEqual(queryBuilder.expressionTree.entity);
      // fields input should have proper value
      expect(queryBuilder.queryTree.selectedReturnFields.length).toEqual(4);
      // nested queries should be collapsed
      const nestedQueryTrees = queryTreeExpressionContainer.querySelectorAll(QueryBuilderSelectors.QUERY_BUILDER_TREE);
      for (let i = 0; i < nestedQueryTrees.length; i++) {
        expect(nestedQueryTrees[i].checkVisibility()).toBeFalse();
      }
      // adding buttons should be enabled
      const buttons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
      for (const button of buttons) {
        ControlsFunction.verifyButtonIsDisabled(button as HTMLElement, false);
      }
    }));

    it('Should render combo for main entity return fields and select for nested entity return field.', fakeAsync(() => {
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'OrderId' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'In' operator.

      const mainEntityContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, true, 0);
      const nestedEntityContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fix, true, 1);

      expect(mainEntityContainer.children[1].children[1].tagName).toBe('IGX-COMBO');
      expect(nestedEntityContainer.children[1].children[1].tagName).toBe('IGX-SELECT');
    }));
  });

  describe('Interactions', () => {
    it('Should correctly initialize a newly added \'And\' group.', fakeAsync(() => {
      QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1); // Select 'Orders' entity
      tick(100);
      fix.detectChanges();

      // Click the initial 'Add Condition' button.
      QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
      tick(100);
      fix.detectChanges();

      // Verify there is a new root group, which is empty.
      QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 0, 0);

      // Verify the operator line of the root group is an 'And' line.
      QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement, 'and');

      // Verify the enabled/disabled state of each input of the expression in edit mode.
      QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, false, false, false);

      // Verify the edit inputs are empty.
      QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Orders', 'OrderId, OrderName, OrderDate, Delivered', '', '', '');

      // Verify adding buttons are not displayed
      expect(QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtonsContainer(fix, 0)).toBe(undefined);
    }));

    it(`Should discard newly added group when clicking on the 'cancel' button of its initial condition.`, fakeAsync(() => {
      spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();
      expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalledTimes(0);

      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

      expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalledTimes(1);

      // Verify there is a new root group, which is empty.
      const group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix);
      expect(group).not.toBeNull('There is no root group.');

      // Click on the 'cancel' button
      const closeButton = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
      UIInteractions.simulateClickEvent(closeButton);
      tick(100);
      fix.detectChanges();

      // Verify there is a new root group, which is empty.
      QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 0, 0);
    }));

    it('Should add a new condition to existing group by using add buttons.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();

      // Verify group's children count before adding a new child.
      let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
      QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);


      // Add new 'expression'.
      const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[1];
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

    it(`Should add a new 'Or' group to existing group by using add buttons.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();

      // Verify group's children count before adding a new child.
      let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
      QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);

      // Add new 'Or' group.
      const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[1];
      const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
      (buttons[1] as HTMLElement).click();
      tick();
      fix.detectChanges();

      // Newly added condition should be empty
      QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, false, false, false);
      QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, '', '', '');

      // Verify adding buttons are not displayed
      expect(QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtonsContainer(fix, 0)).toBe(undefined);

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
      QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeGroupOperatorLine(fix, [0]) as HTMLElement, 'or');

      // adding buttons should be enabled
      const addingButtons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
      expect(addingButtons.length).toBe(2);
      for (const button of addingButtons) {
        ControlsFunction.verifyButtonIsDisabled(button as HTMLElement, false);
      }

      group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
      QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 4, 8);
      expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalled();
    }));

    it(`Should add a new 'And' group to existing group by using add buttons.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();

      // Verify group's children count before adding a new child.
      let group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;
      QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 3, 6);

      // Change root group to 'Or' group
      QueryBuilderFunctions.clickQueryBuilderGroupContextMenu(fix, 0);
      tick(100);
      fix.detectChanges();

      QueryBuilderFunctions.clickContextMenuItem(fix, 0);
      tick(100);
      fix.detectChanges();

      // Add new 'And' group.
      const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[1];
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
      QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 4, 8);
      expect(queryBuilder.expressionTreeChange.emit).toHaveBeenCalled();
    }));

    it(`Should remove a condition from an existing group by using the 'close' icon of the respective chip.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
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

      QueryBuilderFunctions.verifyRootAndSubGroupExpressionsCount(fix, 0, 0);
    }));

    it('Should be able to add and define a new group through initial adding button.', fakeAsync(() => {
      expect(fix.componentInstance.queryBuilder.expressionTree).toBeUndefined();
      // Select an entity
      // TO DO: refactor the methods when entity and fields drop-downs are in the correct overlay
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

      // Verify the enabled/disabled state of each input of the expression in edit mode.
      expect(fix.componentInstance.queryBuilder.expressionTree).toBeDefined();
      QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, false, false, false, false);

      // Select fields
      QueryBuilderFunctions.selectFieldsInEditModeExpression(fix, [2, 3])
      tick(100);
      fix.detectChanges();
      QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true);

      // Click the initial 'Add Condition' button.
      QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix);
      tick(100);
      fix.detectChanges();

      //Select Column
      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1);
      QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, true, false);

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
      QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Products', 'Id, ProductName, Released', 'ProductName', 'Contains', 'a');

      //Commit the group
      QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
      tick(100);
      fix.detectChanges();

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
      "conditionName": "contains",
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
    "Released"
  ]
}`);
    }));

    it('Value input should be disabled for unary operator.', fakeAsync(() => {
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

      //Select Column
      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 3);
      QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, false, true);

      //Select Operator
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);
      QueryBuilderFunctions.verifyEditModeQueryExpressionInputStates(fix, true, true, true, true, false, true);
    }));

    it('Fields dropdown should contain proper fields based on the entity.', fakeAsync(() => {
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

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
      const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[0].nativeElement;

      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

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
      const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[0].nativeElement;

      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

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
      const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`))[0].nativeElement;

      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

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

      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1); // Select 'ProductName' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2); // Select 'Starts With' operator.
      const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
      // Verify value input placeholder
      expect(input.placeholder).toEqual('Value');
      // Type Value
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
      "conditionName": "startsWith",
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
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'Id' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2); // Select 'Greater Than' operator
      const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
      // Verify value input placeholder
      expect(input.placeholder).toEqual('Value');
      // Type Value
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
      "conditionName": "greaterThan",
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
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

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
      "conditionName": "equals",
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
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);
      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 3); // Select 'Released' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 1); // Select 'True' operator.

      // Verify value input placeholder
      const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
      // Verify value input placeholder
      expect(input.placeholder).toEqual('Value');

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
      "conditionName": "true",
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
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 2); // Select 'OrderDate' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 9); // Select 'This Year' operator.

      // Verify value input placeholder
      const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
      // Verify value input placeholder
      expect(input.placeholder).toEqual('Select date');

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
      "conditionName": "thisYear",
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
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 2); // Select 'OrderDate' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0); // Select 'Equals' operator.
      QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, true, false);
      const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, true) as HTMLElement;
      input.click();
      fix.detectChanges();

      // Click on 'today' item in calendar.
      const calendar = QueryBuilderFunctions.getQueryBuilderCalendar(fix);
      const todayItem = calendar.querySelector('.igx-days-view__date--current');
      todayItem.firstChild.click();
      tick(100);
      fix.detectChanges();

      QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, true, true);

      flush();
    }));

    it('Should correctly apply an \'in\' column condition through UI.', fakeAsync(() => {
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'OrderId' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'In' operator.

      // Verify operator icon
      const operatorInputGroup = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix).querySelector('igx-input-group') as HTMLElement;
      expect(operatorInputGroup.querySelector('igx-icon').attributes.getNamedItem('ng-reflect-name').nodeValue).toEqual('in');

      const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
      // Verify value input placeholder
      expect(input.placeholder).toEqual('Sub-query results');

      // Verify inputs states
      QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, false);

      // Should render empty query builder tree
      const queryTreeElement = fix.debugElement.queryAll(By.css(QueryBuilderSelectors.QUERY_BUILDER_TREE))[0]
      const nestedTree = queryTreeElement.query(By.css(QueryBuilderSelectors.QUERY_BUILDER_TREE));
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
      "fieldName": "OrderId",
      "condition": {
        "name": "inQuery",
        "isUnary": false,
        "isNestedQuery": true,
        "iconName": "in"
      },
      "conditionName": "inQuery",
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
            "conditionName": "contains",
            "ignoreCase": true,
            "searchVal": "a",
            "searchTree": null
          }
        ],
        "operator": 0,
        "entity": "Products",
        "returnFields": [
          "Id"
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

    it('Should correctly apply a \'not-in\' column condition through UI.', fakeAsync(() => {
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'OrderId' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 11); // Select 'Not-In' operator.

      // Verify operator icon
      const operatorInputGroup = QueryBuilderFunctions.getQueryBuilderOperatorSelect(fix).querySelector('igx-input-group') as HTMLElement;
      expect(operatorInputGroup.querySelector('igx-icon').attributes.getNamedItem('ng-reflect-name').nodeValue).toEqual('not-in');

      const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
      // Verify value input placeholder
      expect(input.placeholder).toEqual('Sub-query results');

      // Verify inputs states
      QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, false);

      // Should render empty query builder tree
      const queryTreeElement = fix.debugElement.queryAll(By.css(QueryBuilderSelectors.QUERY_BUILDER_TREE))[0]
      const nestedTree = queryTreeElement.query(By.css(QueryBuilderSelectors.QUERY_BUILDER_TREE));
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
      "fieldName": "OrderId",
      "condition": {
        "name": "notInQuery",
        "isUnary": false,
        "isNestedQuery": true,
        "iconName": "not-in"
      },
      "conditionName": "notInQuery",
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
            "conditionName": "contains",
            "ignoreCase": true,
            "searchVal": "a",
            "searchTree": null
          }
        ],
        "operator": 0,
        "entity": "Products",
        "returnFields": [
          "Id"
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
        QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

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
        let nestedTree = fix.debugElement.query(By.css(QueryBuilderSelectors.QUERY_BUILDER_TREE));
        expect(nestedTree).toBeDefined();

        //Verify 'NotIn' disables value input and renders empty sub query
        QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, InConditionIndex + 1); // Select 'NotIn' operator.
        QueryBuilderFunctions.verifyEditModeExpressionInputStates(fix, true, true, false, false);
        nestedTree = fix.debugElement.query(By.css(QueryBuilderSelectors.QUERY_BUILDER_TREE));
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

      // Click the edit icon to enter edit mode of the expression.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(200);
      fix.detectChanges();

      //Check for the active element
      const searchValueInput = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
      expect(document.activeElement).toBe(searchValueInput, 'The input should be the active element.');
    }));

    it('Should display add button when hovering a chip.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      // Verify actions container is not visible. (This container contains the 'add' button.)
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

      // Verify adding buttons are enabled
      let buttons = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0);
      for (const button of buttons) {
        ControlsFunction.verifyButtonIsDisabled(button as HTMLElement, false);
      }

      // Enter edit mode
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(50);
      fix.detectChanges();

      // Verify adding buttons are not displayed
      expect(QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtonsContainer(fix, 0)).toBe(undefined);

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

    it('Clicking a condition should put it in edit mode.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
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
      expect(fix.debugElement.query(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();

      // Click the nested query chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();
      // Verify the query is expanded
      expect(fix.debugElement.query(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeTrue();
      // Click a chip in the nested query three to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], 1);
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

    it('Should switch edit mode on click on chip on the same level.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();

      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], 1);
      tick(50);
      fix.detectChanges();
      // Verify inputs values
      QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'ProductName', 'Contains', 'a', 1);

      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], 1);
      tick(50);
      fix.detectChanges();
      // Verify inputs values
      QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'Released', 'True', '', 1);
      QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'ProductName', 'Contains', 'a', 1);
    }));

    it('Should exit edit mode on add, change group buttons, entity and fields select click.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      // Click chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(50);
      fix.detectChanges();

      // Hover exprssion and click add button
      UIInteractions.hoverElement(QueryBuilderFunctions.getQueryBuilderTreeItem(fix, [0]) as HTMLElement);
      tick(50);
      fix.detectChanges();
      (QueryBuilderFunctions.getQueryBuilderTreeExpressionIcon(fix, [0], 'add') as HTMLElement).click();
      tick(50);
      fix.detectChanges();

      expect(queryBuilder.queryTree.hasEditedExpression).toBeFalse();

      // Click chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(50);
      fix.detectChanges();

      // Click change group button
      QueryBuilderFunctions.clickQueryBuilderGroupContextMenu(fix, 0);
      tick(100);
      fix.detectChanges();

      expect(queryBuilder.queryTree.hasEditedExpression).toBeFalse();

      // Click chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(50);
      fix.detectChanges();

      // Click fields select
      QueryBuilderFunctions.clickQueryBuilderFieldsCombo(fix);
      fix.detectChanges();

      expect(queryBuilder.queryTree.hasEditedExpression).toBeFalse();

      // Click chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(50);
      fix.detectChanges();

      // Click entity select
      QueryBuilderFunctions.clickQueryBuilderEntitySelect(fix);
      fix.detectChanges();

      expect(queryBuilder.queryTree.hasEditedExpression).toBeFalse();
    }));

    it('Should show add expression button when there is an expression in add mode.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      // Hover expression and click add button
      UIInteractions.hoverElement(QueryBuilderFunctions.getQueryBuilderTreeItem(fix, [0]) as HTMLElement);
      tick(50);
      fix.detectChanges();
      (QueryBuilderFunctions.getQueryBuilderTreeExpressionIcon(fix, [0], 'add') as HTMLElement).click();
      tick(50);
      fix.detectChanges();

      // Click 'add condition' option
      QueryBuilderFunctions.clickQueryBuilderTreeAddOption(fix, 0);

      // Hover the first chip and verify actions container is visible.
      UIInteractions.hoverElement(QueryBuilderFunctions.getQueryBuilderTreeItem(fix, [0]) as HTMLElement);
      tick(50);
      fix.detectChanges();
      expect(QueryBuilderFunctions.getQueryBuilderTreeExpressionActionsContainer(fix, [0]))
        .not.toBeNull('actions container is not visible');

      // Hover the second chip and verify actions container is visible.
      UIInteractions.hoverElement(QueryBuilderFunctions.getQueryBuilderTreeItem(fix, [1]) as HTMLElement);
      tick(50);
      fix.detectChanges();
      expect(QueryBuilderFunctions.getQueryBuilderTreeExpressionActionsContainer(fix, [1]))
        .not.toBeNull('actions container is not visible');
    }));

    it('Should display an alert dialog when the entity is changed and showEntityChangeDialog is true.', fakeAsync(() => {
      const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER}`))[0].nativeElement;
      const queryTreeElement = queryBuilderElement.querySelector(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`);
      const dialog = queryTreeElement.querySelector('igx-dialog');
      const dialogOutlet = document.querySelector('.igx-dialog__window');
      expect(dialog).toBeDefined();

      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

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
      const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER}`))[0].nativeElement;
      const queryTreeElement = queryBuilderElement.querySelector(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`);
      const dialog = queryTreeElement.querySelector('igx-dialog');
      const dialogOutlet = document.querySelector('.igx-dialog__window');
      expect(dialog).toBeDefined();

      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

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
      const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER}`))[0].nativeElement;
      const queryTreeElement = queryBuilderElement.querySelector(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}`);
      const dialog = queryTreeElement.querySelector('igx-dialog');
      expect(dialog).toBeDefined();

      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

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
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

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

      // Commit the change
      QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);

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

      QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
      tick(100);
      fix.detectChanges();

      // Verify all inputs
      QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Orders', 'OrderId, OrderName, OrderDate, Delivered', '', '', '');
    }));

    it('Should NOT reset all inputs when the entity is not changed.', fakeAsync(() => {
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 0);

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

      // Commit the change
      QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);

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
      QueryBuilderFunctions.verifyQueryEditModeExpressionInputValues(fix, 'Products', 'Id, ProductName, OrderId, Released');
      QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'Id', 'Equals', '1');
    }));

    it(`"commit" button should be enabled/disabled properly when editing an expression.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();

      // Click the 'OrderId' chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(50);
      fix.detectChanges();

      // Verify "commit" button is enabled
      let commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      ControlsFunction.verifyButtonIsDisabled(commitBtn as HTMLElement, false);
      // Delete the value
      let input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, false).querySelector('input');
      UIInteractions.clickAndSendInputElementValue(input, '');
      tick(100);
      fix.detectChanges();
      // Verify "commit" button is disabled
      commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      ControlsFunction.verifyButtonIsDisabled(commitBtn as HTMLElement);
      // Enter some value
      input = QueryBuilderFunctions.getQueryBuilderValueInput(fix, false).querySelector('input');
      UIInteractions.clickAndSendInputElementValue(input, '5');
      tick(100);
      fix.detectChanges();
      // Verify "commit" button is enabled
      commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      ControlsFunction.verifyButtonIsDisabled(commitBtn as HTMLElement, false);
    }));

    it(`Parent "commit" button should be enabled if a child condition is edited.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();

      // Click the parent chip 'Products' to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();

      // Click the child chip 'Released' to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], 1);
      tick(50);
      fix.detectChanges();

      // Change the 'Released' operator
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2, 1); // Select 'False' operator.

      // Verify both parent and child commit buttons are enabled
      let parentCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      let childCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix, 1);

      ControlsFunction.verifyButtonIsDisabled(parentCommitBtn as HTMLElement, false);
      ControlsFunction.verifyButtonIsDisabled(childCommitBtn as HTMLElement, false);

      // Commit the change
      QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix, 1);

      // Click the child chip 'ProductName' to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], 1);
      tick(50);
      fix.detectChanges();

      // Change the 'ProductName' column to 'Id'
      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0, 1);

      // Verify input values
      QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'Id', 'Equals', '', 1);

      // Verify parent and child commit buttons are disabled
      parentCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      childCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix, 1);

      ControlsFunction.verifyButtonIsDisabled(parentCommitBtn as HTMLElement, false);
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

    it(`Clicking parent "commit" button should properly exit edit mode of inner query.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();

      // Click the parent chip 'Products' to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();

      // Click the child chip 'Released' to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], 1);
      tick(50);
      fix.detectChanges();

      // Change the 'Released' operator
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 2, 1); // Select 'False' operator.

      // Commit the change through the parent
      QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
      tick(50);
      fix.detectChanges();

      // Verify the changes in the child query are commited
      let exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree.filteringOperands[0]);
      expect(exprTree).toBe(`{"fieldName":"OrderId","condition":{"name":"inQuery","isUnary":false,"isNestedQuery":true,"iconName":"in"},"conditionName":"inQuery","searchVal":null,"searchTree":{"filteringOperands":[{"fieldName":"ProductName","condition":{"name":"contains","isUnary":false,"iconName":"filter_contains"},"conditionName":"contains","searchVal":"a"},{"fieldName":"Released","condition":{"name":"false","isUnary":true,"iconName":"filter_false"},"conditionName":"false","searchVal":null,"searchTree":null}],"operator":0,"entity":"Products","returnFields":["Id"]}}`);
      // Enter edit mode again
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();

      // Click the child chip 'ProductName' to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], 1);
      tick(50);
      fix.detectChanges();

      // Change the 'ProductName' column to 'Id'
      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0, 1);

      // Verify input values
      QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'Id', 'Equals', '', 1);

      // Verify parent and child commit buttons are disabled
      const parentCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      const childCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix, 1);

      ControlsFunction.verifyButtonIsDisabled(parentCommitBtn as HTMLElement, false);
      ControlsFunction.verifyButtonIsDisabled(childCommitBtn as HTMLElement);

      // Commit the parent
      QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
      tick(50);
      fix.detectChanges();

      // Verify the changes in the child query are discarded
      exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree.filteringOperands[0]);
      expect(exprTree).toBe(`{"fieldName":"OrderId","condition":{"name":"inQuery","isUnary":false,"isNestedQuery":true,"iconName":"in"},"conditionName":"inQuery","searchVal":null,"searchTree":{"filteringOperands":[{"fieldName":"ProductName","condition":{"name":"contains","isUnary":false,"iconName":"filter_contains"},"conditionName":"contains","searchVal":"a"},{"fieldName":"Released","condition":{"name":"false","isUnary":true,"iconName":"filter_false"},"conditionName":"false","searchVal":null,"searchTree":null}],"operator":0,"entity":"Products","returnFields":["Id"]}}`);
    }));

    it('Should collapse nested query when it is committed.', fakeAsync(() => {
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'OrderId' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'In' operator.

      QueryBuilderFunctions.addAndValidateChildGroup(fix, 1);

      // Verify that the nested query is expanded
      expect(fix.debugElement.query(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeTrue();

      QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fix);
      tick(100);
      fix.detectChanges();

      // Verify that the nested query is collapsed
      expect(fix.debugElement.query(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();
    }));

    it(`Should discard the changes in the fields if 'close' button of nested query condition is clicked.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();
      // Verify parent chip expression
      QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'OrderId', 'In', 'Products / Id');

      // Click the parent chip 'Products' to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
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

    it('Should be able to open edit mode on click, close the edited condition on "close" button click and not commit it.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();

      //Enter edit mode
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(200);
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

    it(`Should focus edited expression chip after click on the 'commit'/'discard' button.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();

      // Click the 'OrderId' chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(100);
      fix.detectChanges();

      // Click on the 'commit' button
      const commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      commitBtn.click();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();
      // Verify focused chip
      QueryBuilderFunctions.verifyFocusedChip('OrderId', 'Greater Than', '3');

      // Click the 'OrderId' chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(100);
      fix.detectChanges();

      // Click on the 'discard' button
      const closeBtn = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
      closeBtn.click();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();
      // Verify focused chip
      QueryBuilderFunctions.verifyFocusedChip('OrderId', 'Greater Than', '3');
    }));

    it(`Should focus proper expression chip after switching edit mode and click on the 'commit'/'discard' button.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();

      // Click the 'OrderDate' chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [2]);
      tick(100);
      fix.detectChanges();

      // Click the 'OrderId' chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
      tick(100);
      fix.detectChanges();

      // Click on the 'commit' button
      const commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      commitBtn.click();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();
      // Verify focused chip
      QueryBuilderFunctions.verifyFocusedChip('OrderId', 'Greater Than', '3');
    }));

    it('Should focus added through group add buttons expression chip if it is commited.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();

      const group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;

      // Add new 'expression'.
      const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[1];
      const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
      (buttons[0] as HTMLElement).click();
      tick();
      fix.detectChanges();

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 3); // Select 'Delivered' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 1); // Select 'True' operator.
      tick(100);
      fix.detectChanges();

      // Click on the 'commit' button
      const commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      commitBtn.click();
      fix.detectChanges();
      tick(300);
      fix.detectChanges();

      // Verify focused chip
      QueryBuilderFunctions.verifyFocusedChip('Delivered', 'True');
    }));

    it('Should NOT focus an expression chip if added expression is discarded.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();

      const group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;

      // Add new 'expression'.
      const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[1];
      const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
      (buttons[0] as HTMLElement).click();
      tick();
      fix.detectChanges();

      // Click on the 'close' button
      const closeBtn = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
      closeBtn.click();
      fix.detectChanges();
      tick(300);
      fix.detectChanges();

      // Verify chip is not focused
      expect(document.activeElement.tagName).toEqual('BODY');
    }));

    it('Should not make bug where existing inner query is leaking to a newly created one.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      tick(100);
      fix.detectChanges();

      const group = QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement;

      // Add new 'expression'.
      const buttonsContainer = Array.from(group.querySelectorAll('.igx-filter-tree__buttons'))[1];
      const buttons = Array.from(buttonsContainer.querySelectorAll('button'));
      (buttons[0] as HTMLElement).click();
      tick();
      fix.detectChanges();

      // Add condition with 'in' operator to open inner query
      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'OrderName' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'Contains' operator.
      tick(100);
      fix.detectChanges();

      //New empty inner query should be displayed
      const queryBuilderElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER}`))[0].nativeElement;
      const bodyElement = queryBuilderElement.children[0].children[0];
      const actionArea = bodyElement.children[0].querySelector('.igx-query-builder__root-actions');
      expect(actionArea).toBeNull();
      expect(bodyElement.children[1].children[1].children[1].children[1].children[6].children[1]).toHaveClass(QueryBuilderSelectors.QUERY_BUILDER_TREE);
      expect(bodyElement.children[1].children[1].children[1].children[1].children[6].children[1].children.length).toEqual(3);
      const tree = bodyElement.children[1].children[1].children[1].children[1].children[6].children[1].querySelector('.igx-filter-tree__expression');
      expect(tree).toBeNull();
    }));

    it('canCommit should return the correct validity state of currently edited condition.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
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
      // Verify the Query Builder validity state while adding a condition.
      QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1); // Select 'Orders' entity
      tick(100);
      fix.detectChanges();
      expect(queryBuilder.canCommit()).withContext('Entity selected').toBeTrue();

      // Click the 'Add condition' button.
      QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
      tick(100);
      fix.detectChanges();
      expect(queryBuilder.canCommit()).withContext('Add condition clicked').toBeTrue();

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 1);
      expect(queryBuilder.canCommit()).withContext('Column selected').toBeFalse();
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 0);
      expect(queryBuilder.canCommit()).withContext('Operator contains selected').toBeFalse();
      const input = QueryBuilderFunctions.getQueryBuilderValueInput(fix).querySelector('input');
      UIInteractions.clickAndSendInputElementValue(input, 'a');
      tick(100);
      fix.detectChanges();
      expect(queryBuilder.canCommit()).withContext('Search value filled').toBeTrue();

      // Click on the 'cancel' button
      const closeButton = QueryBuilderFunctions.getQueryBuilderExpressionCloseButton(fix);
      UIInteractions.simulateClickEvent(closeButton);
      tick(100);
      fix.detectChanges();
      expect(queryBuilder.canCommit()).withContext('Entity remains selected').toBeTrue();

      // Verify the Query Builder validity state for UNARY condition.
      QueryBuilderFunctions.clickQueryBuilderInitialAddConditionBtn(fix, 0);
      tick(100);
      fix.detectChanges();
      expect(queryBuilder.canCommit()).withContext('Add condition clicked again').toBeTrue();
      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 3);
      expect(queryBuilder.canCommit()).withContext('Column selected again').toBeTrue();
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 1);
      expect(queryBuilder.canCommit()).withContext('Unary operator selected').toBeTrue();
    }));

    it('Should be able to commit nested query without where condition.', fakeAsync(() => {
      QueryBuilderFunctions.selectEntityAndClickInitialAddCondition(fix, 1);

      QueryBuilderFunctions.selectColumnInEditModeExpression(fix, 0); // Select 'OrderId' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fix, 10); // Select 'In' operator.

      let commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      ControlsFunction.verifyButtonIsDisabled(commitBtn as HTMLElement, true);

      // Enter values in the nested query
      QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0, 1); // Select 'Products' entity
      tick(100);
      fix.detectChanges();

      commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      ControlsFunction.verifyButtonIsDisabled(commitBtn as HTMLElement, true);

      // Select return field
      QueryBuilderFunctions.selectFieldsInEditModeExpression(fix, [0], 1);
      tick(100);
      fix.detectChanges();

      commitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      ControlsFunction.verifyButtonIsDisabled(commitBtn as HTMLElement, false);

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
        "name": "inQuery",
        "isUnary": false,
        "isNestedQuery": true,
        "iconName": "in"
      },
      "conditionName": "inQuery",
      "ignoreCase": true,
      "searchVal": null,
      "searchTree": {
        "filteringOperands": [],
        "operator": 0,
        "entity": "Products",
        "returnFields": [
          "Id"
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

    it(`Should be able to enter edit mode from condition in an inner query.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(100);
      fix.detectChanges();

      // Click the child chip 'Released' to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], 1);
      tick(50);
      fix.detectChanges();

      // Verify both parent and child commit buttons are enabled
      const parentCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix);
      const childCommitBtn = QueryBuilderFunctions.getQueryBuilderExpressionCommitButton(fix, 1);

      ControlsFunction.verifyButtonIsDisabled(parentCommitBtn as HTMLElement, false);
      ControlsFunction.verifyButtonIsDisabled(childCommitBtn as HTMLElement, false);

      // Verify inputs values on both levels
      QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'OrderId', 'In', '', 0);
      QueryBuilderFunctions.verifyEditModeExpressionInputValues(fix, 'Released', 'True', '', 1);
    }));

    it(`Should be able to switch group condition and ungroup from group context menu.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTreeWithSubGroup();
      fix.detectChanges();

      // Verify there is one subgroup
      expect(queryBuilder.expressionTree.filteringOperands.filter(o => o instanceof FilteringExpressionsTree).length).toBe(1);

      // Verify the operator of the subgroup is an 'And' line.
      QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeRootGroupOperatorLine(fix) as HTMLElement, 'and');
      QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeGroupOperatorLine(fix, [0]) as HTMLElement, 'or');

      // Click the 'OR' subgroup button
      QueryBuilderFunctions.clickQueryBuilderGroupContextMenu(fix, 2);
      tick(100);
      fix.detectChanges();

      // Click the 'Switch to AND' drop down item
      QueryBuilderFunctions.clickContextMenuItem(fix, 0);
      tick(100);
      fix.detectChanges();

      // Verify the operator of the subgroup is an 'And' line.
      QueryBuilderFunctions.verifyOperatorLine(QueryBuilderFunctions.getQueryBuilderTreeGroupOperatorLine(fix, [0]) as HTMLElement, 'and');

      // Click the 'AND' subgroup button
      QueryBuilderFunctions.clickQueryBuilderGroupContextMenu(fix, 2);
      tick(100);
      fix.detectChanges();

      // Click the 'Ungroup' drop down item
      QueryBuilderFunctions.clickContextMenuItem(fix, 1);
      tick(100);
      fix.detectChanges();

      // Verify there are no subgroups anymore
      expect(queryBuilder.expressionTree.filteringOperands.filter(o => o instanceof FilteringExpressionsTree).length).toBe(0);
    }));

    it('Should disable changing a selected entity when "disableEntityChange"=true', () => {
      queryBuilder.disableEntityChange = true;
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTreeWithSubGroup();
      fix.detectChanges();

      const selectEntity = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix, 0);
      expect(selectEntity.children[0].classList.contains('igx-input-group--disabled')).toBeTrue();
    });

    it('Should disable changing a selected entity when "disableEntityChange"=true only after initial selection', fakeAsync(() => {
      queryBuilder.disableEntityChange = true;
      fix.detectChanges();

      const selectEntity = QueryBuilderFunctions.getQueryBuilderEntitySelect(fix, 0);
      expect(selectEntity.children[0].classList.contains('igx-input-group--disabled')).toBeFalse();
      QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0, 0);

      expect(selectEntity.children[0].classList.contains('igx-input-group--disabled')).toBeTrue();
    }));

    it('Should disable changing the selected fields when "disableReturnFieldsChange"=true', () => {
      queryBuilder.disableReturnFieldsChange = true;
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTreeWithSubGroup();
      fix.detectChanges();

      const fieldsCombo = QueryBuilderFunctions.getQueryBuilderFieldsCombo(fix, 0);
      expect(fieldsCombo.children[0].classList.contains('igx-input-group--disabled')).toBeTrue();
    });

    it(`Should show 'Ungroup' as disabled in root group context menu.`, fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTreeWithSubGroup();
      fix.detectChanges();

      // Click the 'AND' root group button
      QueryBuilderFunctions.clickQueryBuilderGroupContextMenu(fix, 0);
      tick(100);
      fix.detectChanges();

      // Verify 'Ungroup' is disabled
      QueryBuilderFunctions.verifyContextMenuItemDisabled(fix, 1, true);

      // Click the 'OR' subgroup button
      QueryBuilderFunctions.clickQueryBuilderGroupContextMenu(fix, 2);
      tick(100);
      fix.detectChanges();

      // Verify 'Ungroup' is enabled
      QueryBuilderFunctions.verifyContextMenuItemDisabled(fix, 1, false);
    }));
  });

  describe('API', () => {
    beforeEach(fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      spyOn(queryBuilder.expressionTreeChange, 'emit').and.callThrough();
    }));

    it(`Should commit the changes in a valid edited condition when the 'commit' method is called.`, fakeAsync(() => {
      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
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
      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1]);
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
      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();
      expect(queryBuilder.canCommit()).toBeTrue();

      // Start editing expression in the nested query
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [1], 1);
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
      expect(fix.debugElement.query(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();

      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();

      // Start editing expression in the nested query
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0], 1);
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
      expect(fix.debugElement.query(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_TREE}--level-1`)).nativeElement.checkVisibility()).toBeFalse();

      // Expand the nested query by putting it in edit mode
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();

      // Verify edited expressions
      QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'Id', 'Equals', '1', 1);
      QueryBuilderFunctions.verifyExpressionChipContent(fix, [1], 'Released', 'True', undefined, 1);

      // close chip 
      queryBuilder.discard();
      tick(100);
      fix.detectChanges();

      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();

      QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1, 1);
      tick(100);
      fix.detectChanges();

      // Confirm the change
      const dialogOutlet: HTMLElement = fix.debugElement.queryAll(By.css(`.igx-dialog`))[0].nativeElement;
      const confirmButton = Array.from(dialogOutlet.querySelectorAll('button'))[1];
      expect(confirmButton.innerText).toEqual('Confirm');
      confirmButton.click();
      tick(100);
      fix.detectChanges();

      // Discard the changes
      queryBuilder.discard();
      tick(100);
      fix.detectChanges();

      // Expand the nested query by putting it in edit mode
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [0]);
      tick(50);
      fix.detectChanges();

      // Verify edited expressions
      QueryBuilderFunctions.verifyExpressionChipContent(fix, [0], 'Id', 'Equals', '1', 1);
      QueryBuilderFunctions.verifyExpressionChipContent(fix, [1], 'Released', 'True', undefined, 1);
    }));

    it('Should NOT throw errors when an invalid condition is committed through API.', fakeAsync(() => {
      spyOn(console, 'error');
      // Click the existing chip to enter edit mode.
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fix, [2]);
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
    it('Should navigate with Tab/Shift+Tab through entity and fields inputs, chips, their respective drop & delete icons and operator drop-down button', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      QueryBuilderFunctions.verifyQueryBuilderTabbableElements(fix);
    }));

    it('Should navigate with Tab/Shift+Tab through chips" "edit", "cancel" buttons, fields of a condition in edit mode.', fakeAsync(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      const chip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[0];

      QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', chip.nativeElement, 200);

      // const chipActions = fix.debugElement.query(By.css('.igx-filter-tree__expression-actions'));
      // QueryBuilderFunctions.verifyTabbableChipActions(chipActions);

      // // Open Edit mode and check condition line elements
      // QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', chipActions.children[0].nativeElement, 200);

      const editLine = fix.debugElement.queryAll(By.css('.igx-filter-tree__inputs'))[1];
      QueryBuilderFunctions.verifyTabbableConditionEditLineElements(editLine);

      const editDialog = fix.debugElement.queryAll(By.css(`.${QueryBuilderSelectors.QUERY_BUILDER_BODY}`))[1];
      QueryBuilderFunctions.verifyTabbableInConditionDialogElements(editDialog);
    }));

    it('Should start editing a condition when pressing \'Enter\' on its respective chip.', fakeAsync(() => {
      //!Both Enter and Space should work
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      const chip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[0];

      QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, ' ', chip.nativeElement, 200);

      let editLine = fix.debugElement.queryAll(By.css('.igx-filter-tree__inputs'))[1];
      QueryBuilderFunctions.verifyTabbableConditionEditLineElements(editLine);

      // Discard the changes
      queryBuilder.discard();
      tick(100);
      fix.detectChanges();

      QueryBuilderFunctions.hitKeyUponElementAndDetectChanges(fix, 'Enter', chip.nativeElement, 200);

      editLine = fix.debugElement.queryAll(By.css('.igx-filter-tree__inputs'))[1];
      QueryBuilderFunctions.verifyTabbableConditionEditLineElements(editLine);
    }));

    it('Should remove a chip in when pressing \'Enter\' on its \'remove\' icon.', fakeAsync(() => {
      //!Both Enter and Space should work
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();

      // Verify there are three chip expressions.
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

  describe('Templates', () => {
    let fixture: ComponentFixture<IgxQueryBuilderCustomTemplateSampleTestComponent>;
    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(IgxQueryBuilderCustomTemplateSampleTestComponent);
      fixture.detectChanges();
      queryBuilder = fixture.componentInstance.queryBuilder;
    }));

    it('Should render custom header properly.', () => {
      expect(QueryBuilderFunctions.getQueryBuilderHeaderText(fixture)).toBe('Custom Title');
    });

    it('Should render custom input template properly.', fakeAsync(() => {
      //Enter edit mode
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fixture, [0]);
      tick(200);
      fixture.detectChanges();

      const editModeContainer = QueryBuilderFunctions.getQueryBuilderEditModeContainer(fixture, false);
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

    it('Should apply field formatter properly.', fakeAsync(() => {
      // Add new expression
      const btn = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fixture, 0)[0] as HTMLElement;
      btn.click();
      fixture.detectChanges();

      // Populate edit inputs.
      QueryBuilderFunctions.selectColumnInEditModeExpression(fixture, 0); // Select 'OrderId' column.
      QueryBuilderFunctions.selectOperatorInEditModeExpression(fixture, 0); // Select 'Equals' operator.

      // Verify combo template is displayed
      let editModeContainer = Array.from(QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fixture).querySelectorAll('.igx-filter-tree__inputs'))[1];
      let combo = editModeContainer.querySelector('.igx-combo');
      expect(combo).toBeDefined();

      // Open the combo
      (combo.querySelector('igx-input-group') as HTMLElement).click();
      tick();
      fixture.detectChanges();
      // Select item
      const outlet = Array.from(document.querySelectorAll(`.igx-drop-down__list-scroll`))
        .filter(item => (item as HTMLElement).checkVisibility())[0] as HTMLElement;

      const comboItem = outlet.querySelectorAll(`.igx-drop-down__item`)[0] as HTMLElement;
      comboItem.click();
      tick();
      fixture.detectChanges();

      // Commit the expression
      QueryBuilderFunctions.clickQueryBuilderExpressionCommitButton(fixture);
      fixture.detectChanges();
      // Verify chips
      QueryBuilderFunctions.verifyExpressionChipContent(fixture, [0], 'OrderId', 'Greater Than', '3');
      QueryBuilderFunctions.verifyExpressionChipContent(fixture, [1], 'OrderId', 'Equals', '0');

      // Enter edit mode
      QueryBuilderFunctions.clickQueryBuilderTreeExpressionChip(fixture, [1]);
      tick(50);
      fixture.detectChanges();
      // Verify inputs values
      editModeContainer = Array.from(QueryBuilderFunctions.getQueryBuilderExpressionsContainer(fixture).querySelectorAll('.igx-filter-tree__inputs'))[1];
      const selects = Array.from(editModeContainer.querySelectorAll('igx-select'));
      combo = editModeContainer.querySelector('.igx-combo');
      expect(selects[0].querySelector('input').value).toBe('OrderId');
      expect(selects[1].querySelector('input').value).toBe('Equals');
      expect(combo.querySelector('input').value).toBe('A');
    }));
  });

  describe('Localization', () => {
    it('Should correctly change resource strings for Query Builder.', fakeAsync(() => {
      queryBuilder.resourceStrings = Object.assign({}, queryBuilder.resourceStrings, {
        igx_query_builder_filter_operator_and: 'My and',
        igx_query_builder_filter_operator_or: 'My or',
        igx_query_builder_and_label: 'My and',
        igx_query_builder_or_label: 'My or',
        igx_query_builder_switch_group: 'My switch to {0}',
        igx_query_builder_add_condition_root: 'My condition',
        igx_query_builder_add_group_root: 'My group',
        igx_query_builder_ungroup: 'My ungroup',
        igx_query_builder_dialog_title: 'My Confirmation',
        igx_query_builder_dialog_message: 'My changing entity message',
        igx_query_builder_dialog_checkbox_text: 'My do not show this dialog again',
        igx_query_builder_dialog_cancel: 'My Cancel',
        igx_query_builder_dialog_confirm: 'My Confirm',
        igx_query_builder_drop_ghost_text: 'My Drop here to insert'
      });
      fix.detectChanges();

      // Select 'Orders' entity
      QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 1);
      tick(100);
      fix.detectChanges();

      expect((QueryBuilderFunctions.getQueryBuilderInitialAddConditionBtn(fix, 0) as HTMLElement).querySelector('span').innerText)
        .toBe('My condition');

      // Click the 'My and' group button
      QueryBuilderFunctions.clickQueryBuilderGroupContextMenu(fix);
      tick(100);
      fix.detectChanges();

      expect((QueryBuilderFunctions.getQueryBuilderGroupContextMenuDropDownItems(fix)[0]).querySelector('span').innerText)
        .toBe('My switch to MY OR');
      expect((QueryBuilderFunctions.getQueryBuilderGroupContextMenuDropDownItems(fix)[1]).querySelector('span').innerText)
        .toBe('My ungroup');

      // Show changing entity alert dialog
      QueryBuilderFunctions.selectEntityInEditModeExpression(fix, 0);
      tick(100);
      fix.detectChanges();
      const dialogOutlet = document.querySelector('.igx-dialog__window');
      expect(dialogOutlet).toBeDefined();

      expect(dialogOutlet.querySelector('.igx-dialog__window-title').textContent.trim()).toBe('My Confirmation');
      expect(dialogOutlet.querySelector('.igx-query-builder-dialog').children[0].textContent.trim()).toBe('My changing entity message');
      expect(dialogOutlet.querySelector('.igx-query-builder-dialog').children[1].textContent.trim()).toBe('My do not show this dialog again');
      expect(dialogOutlet.querySelector('.igx-dialog__window-actions').children[0].textContent.trim()).toBe('My Cancel');
      expect(dialogOutlet.querySelector('.igx-dialog__window-actions').children[1].textContent.trim()).toBe('My Confirm');

      //Drag ghost text check
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTree();
      fix.detectChanges();
      const draggedChip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[3].componentInstance;
      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 10, 10, false);
      const dropGhost = QueryBuilderFunctions.getDropGhost(fix) as HTMLElement;
      expect(draggedChip.dragDirective.ghostElement).toBeTruthy();
      expect(dropGhost).toBeDefined();
      expect(dropGhost.innerText).toBe('My Drop here to insert');
    }));
  }); 

  describe('Drag and drop', () => {
    const ROW_HEIGHT = 40;
    const DROP_CONDITION_HERE = "Drop here to insert";
    let chipComponents = [];
    beforeEach(() => {
      queryBuilder.expressionTree = QueryBuilderFunctions.generateExpressionTreeWithSubGroup();
      fix.detectChanges();

      chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
    });

    it('Should render ghost when mouse drag operation starts.', () => {
      const draggedChip = chipComponents[1].componentInstance;

      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 100, 10, false);
      const dropGhost = QueryBuilderFunctions.getDropGhost(fix) as HTMLElement;

      expect(draggedChip.dragDirective.ghostElement).toBeTruthy();
      expect(dropGhost).toBeDefined();
      expect(dropGhost.innerText).toBe(DROP_CONDITION_HERE);
    });

    it('Should collapse the condition when mouse drag operation starts.', () => {
      const secondChip = chipComponents[1].componentInstance;

      UIInteractions.moveDragDirective(fix, secondChip.dragDirective, 100, 10, false);
      expect(chipComponents[1].nativeElement.getBoundingClientRect().height).toBe(0);
    });

    it('Should render drop ghost properly when mouse dragged.', fakeAsync(() => {
      const draggedChip = chipComponents[1].componentInstance;
      const draggedChipCenter = QueryBuilderFunctions.getElementCenter(draggedChip.chipArea.nativeElement);
      const dragDir = draggedChip.dragDirective;

      let X = 100, Y = 95;

      //pickup chip
      dragDir.onPointerDown({ pointerId: 1, pageX: draggedChipCenter.X, pageY: draggedChipCenter.Y });
      fix.detectChanges();

      //trigger ghost
      QueryBuilderFunctions.dragMove(dragDir, draggedChipCenter.X + 10, draggedChipCenter.Y + 10);
      fix.detectChanges();

      spyOn(dragDir.ghostElement, 'dispatchEvent').and.callThrough();

      const ghostPositionVisits: boolean[] = [false, false, false, false, false, false, false, false]

      let i = 0, pass = 1, inc = 1;

      //Drag ghost up and down four times and check if drop ghost is rendered in the expected positions
      while (pass <= 4) {
        i += inc;
        Y += 5 * inc;

        QueryBuilderFunctions.dragMove(dragDir, X, Y);
        tick(10);
        fix.detectChanges();

        const dropGhost = QueryBuilderFunctions.getDropGhost(fix);
        const prevElement = dropGhost && dropGhost.previousElementSibling ? QueryBuilderFunctions.getChipContent(dropGhost.previousElementSibling) : null;
        const nextElement = dropGhost && dropGhost.nextElementSibling ? QueryBuilderFunctions.getChipContent(dropGhost.nextElementSibling) : null;

        if (i < 8 && !ghostPositionVisits[0]) {
          tick(50);
          if (!dropGhost) ghostPositionVisits[0] = true;
        }

        if (i > 6 && i < 23 && !ghostPositionVisits[1]) {
          if (dropGhost && !prevElement && nextElement == "OrderName  Equals  foo") ghostPositionVisits[1] = true;
        }

        if (i > 20 && i < 35 && !ghostPositionVisits[2]) {
          if (dropGhost && prevElement == "OrderName  Equals  foo" && !nextElement) ghostPositionVisits[2] = true;
        }

        if (i > 31 && i < 40 && !ghostPositionVisits[3]) {
          if (dropGhost && !prevElement && nextElement == "OrderName  Ends With  a") ghostPositionVisits[3] = true;
        }

        if (i > 36 && i < 47 && !ghostPositionVisits[4]) {
          if (dropGhost && prevElement == "OrderName  Ends With  a" && !nextElement) ghostPositionVisits[4] = true;
        }

        if (i > 44 && i < 57 && !ghostPositionVisits[5]) {
          if (dropGhost && prevElement == "OrderDate  Today" && !nextElement) ghostPositionVisits[5] = true;
        }

        if (i > 54 && i < 64 && !ghostPositionVisits[6]) {
          if (pass > 2 || (dropGhost && prevElement == "or  OrderName  Ends With  a  OrderDate  Today" && !nextElement)) ghostPositionVisits[6] = true;
        }

        if (i > 62 && !ghostPositionVisits[7]) {
          tick(50);
          if (!dropGhost) ghostPositionVisits[7] = true;
        }

        //When dragged to the end, check results and reverse direction for next pass
        if (i === 65 || i === 0) {
          expect(ghostPositionVisits).not.toContain(false,
            `Ghost was not rendered on position(s) ${ghostPositionVisits.reduce((arr, e, ix) => ((e == false) && arr.push(ix), arr), []).toString()} on pass:${pass}`);

          ghostPositionVisits.fill(false);
          pass++;
          inc *= -1;
          if (pass % 2 === 0) Y -= ROW_HEIGHT;
          if (pass % 2 !== 0) Y += ROW_HEIGHT;

          //go to the left and test the whole chip div as well(blank space to the right)
          if (pass == 3) X += 400;
        }
      }

    }));

    it('Should position drop ghost below the target condition on dragging down.', () => {
      const draggedChip = chipComponents[0].componentInstance;
      const draggedChipCenter = QueryBuilderFunctions.getElementCenter(draggedChip.chipArea.nativeElement);
      const dragDir = draggedChip.dragDirective;

      //pickup chip
      dragDir.onPointerDown({ pointerId: 1, pageX: draggedChipCenter.X, pageY: draggedChipCenter.Y });
      fix.detectChanges();

      //trigger ghost
      QueryBuilderFunctions.dragMove(dragDir, draggedChipCenter.X, draggedChipCenter.Y + 10);
      fix.detectChanges();

      const dropGhost = QueryBuilderFunctions.getDropGhost(fix);

      expect(dropGhost).not.toBe(null);
      const dropGhostBounds = dropGhost.getBoundingClientRect();
      const targetChipBounds = chipComponents[1].nativeElement.getBoundingClientRect();
      expect(dropGhostBounds.x).toBe(targetChipBounds.x);
      expect(dropGhostBounds.y).toBeCloseTo(targetChipBounds.y + ROW_HEIGHT);
    });

    it('Should position drop ghost above the target condition on dragging up.', fakeAsync(() => {
      const draggedChip = chipComponents[1].componentInstance;
      const draggedChipCenter = QueryBuilderFunctions.getElementCenter(draggedChip.chipArea.nativeElement);
      const dragDir = draggedChip.dragDirective;

      //pickup chip
      dragDir.onPointerDown({ pointerId: 1, pageX: draggedChipCenter.X, pageY: draggedChipCenter.Y });
      fix.detectChanges();

      //trigger ghost
      QueryBuilderFunctions.dragMove(dragDir, draggedChipCenter.X, draggedChipCenter.Y - 30);
      tick(50);
      fix.detectChanges();

      const dropGhost = QueryBuilderFunctions.getDropGhost(fix);

      expect(dropGhost).not.toBe(null);
      const dropGhostBounds = dropGhost.getBoundingClientRect();
      const targetChipBounds = chipComponents[0].nativeElement.getBoundingClientRect();
      expect(dropGhostBounds.x).toBe(targetChipBounds.x);
      expect(dropGhostBounds.y).toBeCloseTo(targetChipBounds.y + ROW_HEIGHT);
    }));

    it('Should position drop ghost at the top inside the inner group when dragged over the first inner level condition.', () => {
      const secondChip = chipComponents[0].componentInstance;
      const secondChipElem = secondChip.chipArea.nativeElement;

      const dragDir = secondChip.dragDirective;
      UIInteractions.moveDragDirective(fix, dragDir, 100, 4 * secondChipElem.offsetHeight, false);

      const dropGhostBounds = QueryBuilderFunctions.getDropGhostBounds(fix);
      const targetChipBounds = chipComponents[4].nativeElement.getBoundingClientRect();
      expect(dropGhostBounds.x).toBe(targetChipBounds.x);
      expect(dropGhostBounds.y).toBeCloseTo(targetChipBounds.y + ROW_HEIGHT);
    });

    it('Should position drop ghost outside the inner group aligned with the outer level conditions when the top inner level condition is dragged up.', () => {
      const draggedChip = chipComponents[4].componentInstance; // "OrderName Ends With a" chip
      const draggedChipCenter = QueryBuilderFunctions.getElementCenter(draggedChip.chipArea.nativeElement);
      const dragDir = draggedChip.dragDirective;

      //pickup chip
      dragDir.onPointerDown({ pointerId: 1, pageX: draggedChipCenter.X, pageY: draggedChipCenter.Y });
      fix.detectChanges();

      //drag
      QueryBuilderFunctions.dragMove(dragDir, draggedChipCenter.X, draggedChipCenter.Y - 2 * ROW_HEIGHT, false);
      fix.detectChanges();

      const dropGhostBounds = QueryBuilderFunctions.getDropGhostBounds(fix);
      const targetChipBounds = chipComponents[1].nativeElement.getBoundingClientRect(); // "OrderId in Products/OrderId" chip
      expect(dropGhostBounds.x).toBe(targetChipBounds.x);
      expect(dropGhostBounds.y).toBeCloseTo(targetChipBounds.y + ROW_HEIGHT);
    });

    it('Should position drop ghost below the inner group aligned with the outer level conditions when the bottom inner level condition is dragged down.', () => {
      const draggedChip = chipComponents[5].componentInstance; // "OrderDate Today" chip
      const dragDir = draggedChip.dragDirective;
      UIInteractions.moveDragDirective(fix, dragDir, -50, 10, false);

      const dropGhostBounds = QueryBuilderFunctions.getDropGhostBounds(fix);
      const previousLevelChipBounds = chipComponents[1].nativeElement.getBoundingClientRect(); // "OrderId in Products/OrderId" chip
      expect(dropGhostBounds.x).toBe(previousLevelChipBounds.x);
      const innerGroupElement = QueryBuilderFunctions.getQueryBuilderTreeChildGroups(QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement)[0];
      const innerGroupBounds = innerGroupElement.getBoundingClientRect();
      expect(Math.abs(dropGhostBounds.top - innerGroupBounds.bottom)).toBeLessThan(20);
    });

    it('Should hide drop ghost on dragging the mouse far down outside the query builder.', () => {
      const draggedChip = chipComponents[0].componentInstance;
      const draggedChipElem = draggedChip.chipArea.nativeElement;

      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 0, 10 * draggedChipElem.offsetHeight, false);

      const dropGhost = QueryBuilderFunctions.getDropGhost(fix);
      expect(dropGhost).toBe(null);
      expect(QueryBuilderFunctions.getVisibleChips(fix).length).toBe(3);
    });

    it('Should drop the condition above the target condition on dragging up.', fakeAsync(() => {
      const secondChip = chipComponents[1].componentInstance; // "OrderId In Products/ OrderId" chip

      expect(QueryBuilderFunctions.getChipContent(chipComponents[0].nativeElement)).toBe("OrderName  Equals  foo");
      const draggedChipCenter = QueryBuilderFunctions.getElementCenter(secondChip.chipArea.nativeElement);
      const dragDir = secondChip.dragDirective;

      //pickup chip
      dragDir.onPointerDown({ pointerId: 1, pageX: draggedChipCenter.X, pageY: draggedChipCenter.Y });
      fix.detectChanges();

      //drag
      QueryBuilderFunctions.dragMove(dragDir, draggedChipCenter.X, draggedChipCenter.Y - 2 * ROW_HEIGHT, true);
      fix.detectChanges();

      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);
      expect(QueryBuilderFunctions.getChipContent(chipComponents[0].nativeElement)).toBe("OrderId  In Products / OrderId");
      expect(QueryBuilderFunctions.getChipContent(chipComponents[1].nativeElement)).toBe("OrderName  Equals  foo");
    }));

    it('Should drop the condition below the target condition on dragging down.', fakeAsync(() => {
      const secondChip = chipComponents[0].componentInstance; // "OrderName Equals foo" chip
      const secondChipElem = secondChip.nativeElement;

      expect(QueryBuilderFunctions.getChipContent(chipComponents[0].nativeElement)).toBe("OrderName  Equals  foo");

      UIInteractions.moveDragDirective(fix, secondChip.dragDirective, 0, secondChipElem.offsetHeight, true);
      tick(50);
      fix.detectChanges();
      QueryBuilderFunctions.verifyFocusedChip('OrderName', 'Equals', 'foo');

      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);
      expect(QueryBuilderFunctions.getChipContent(chipComponents[0].nativeElement)).toBe("OrderId  In Products / OrderId");
      expect(QueryBuilderFunctions.getChipContent(chipComponents[1].nativeElement)).toBe("OrderName  Equals  foo");
    }));

    it('Should drop the condition inside the inner group when dropped over the group.', fakeAsync(() => {
      const draggedChip = chipComponents[0].componentInstance; // "OrderName Equals foo" chip
      const draggedChipElem = draggedChip.nativeElement;

      const dragDir = draggedChip.dragDirective;
      UIInteractions.moveDragDirective(fix, dragDir, 50, 2 * draggedChipElem.offsetHeight + 25, true);
      tick(50);
      fix.detectChanges();
      QueryBuilderFunctions.verifyFocusedChip('OrderName', 'Equals', 'foo');

      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);
      const droppedChipBounds = chipComponents[1].nativeElement.getBoundingClientRect();
      const targetChipBounds = chipComponents[2].nativeElement.getBoundingClientRect();
      expect(droppedChipBounds.x).toBe(targetChipBounds.x);
      expect(droppedChipBounds.y).toBeCloseTo(targetChipBounds.y - ROW_HEIGHT);

      expect(QueryBuilderFunctions.getChipContent(chipComponents[0].nativeElement)).toBe("OrderId  In Products / OrderId");
      expect(QueryBuilderFunctions.getChipContent(chipComponents[1].nativeElement)).toBe("OrderName  Equals  foo");
    }));

    it('Should drop the condition outside the inner group aligned with the outer level conditions when dropped above the inner group.', fakeAsync(() => {
      const draggedChip = chipComponents[5].componentInstance; // "OrderDate  Today" chip
      const draggedChipElem = draggedChip.nativeElement;

      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 0, -3.5 * draggedChipElem.offsetHeight, true);
      tick(50);
      fix.detectChanges();
      QueryBuilderFunctions.verifyFocusedChip('OrderDate', 'Today');

      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);
      const droppedChipBounds = chipComponents[2].nativeElement.getBoundingClientRect();
      const targetChipBounds = chipComponents[1].nativeElement.getBoundingClientRect(); // "OrderId in Products/OrderId" chip
      expect(droppedChipBounds.x).toBe(targetChipBounds.x);
      expect(droppedChipBounds.y).toBeCloseTo(targetChipBounds.y + ROW_HEIGHT);

      expect(QueryBuilderFunctions.getChipContent(chipComponents[0].nativeElement)).toBe("OrderName  Equals  foo");
      expect(QueryBuilderFunctions.getChipContent(chipComponents[1].nativeElement)).toBe("OrderId  In Products / OrderId");
      expect(QueryBuilderFunctions.getChipContent(chipComponents[2].nativeElement)).toBe("OrderDate  Today");
    }));

    it('Should drop the condition at the last position of the root group when dropped above the buttons.', fakeAsync(() => {
      const draggedChip = chipComponents[5].componentInstance; // "OrderDate  Today" chip
      const draggedChipCenter = QueryBuilderFunctions.getElementCenter(draggedChip.chipArea.nativeElement);
      const dragDir = draggedChip.dragDirective;

      //pickup chip
      dragDir.onPointerDown({ pointerId: 1, pageX: draggedChipCenter.X, pageY: draggedChipCenter.Y });
      fix.detectChanges();

      //trigger ghost
      QueryBuilderFunctions.dragMove(dragDir, draggedChipCenter.X + 10, draggedChipCenter.Y + 10);
      fix.detectChanges();

      spyOn(dragDir.ghostElement, 'dispatchEvent').and.callThrough();

      const addConditionButton = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0)[0] as HTMLElement;
      const addConditionButtonCenter = QueryBuilderFunctions.getElementCenter(addConditionButton);

      //move over +Condition
      QueryBuilderFunctions.dragMove(dragDir, addConditionButtonCenter.X, addConditionButtonCenter.Y);

      const dropGhost = QueryBuilderFunctions.getDropGhost(fix) as HTMLElement;
      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);
      expect(QueryBuilderFunctions.getElementCenter(dropGhost).Y).toBeGreaterThan(QueryBuilderFunctions.getElementCenter(chipComponents[2].nativeElement).Y)
      expect(QueryBuilderFunctions.getElementCenter(dropGhost).Y).toBeLessThan(QueryBuilderFunctions.getElementCenter(addConditionButton).Y)

      //drop condition
      dragDir.onPointerUp({ pointerId: 1, pageX: addConditionButtonCenter.X, pageY: addConditionButtonCenter.Y });
      tick(20);
      fix.detectChanges();

      const exprTree = JSON.stringify(fix.componentInstance.queryBuilder.expressionTree, null, 2);
      expect(exprTree).toBe(`{
  "filteringOperands": [
    {
      "fieldName": "OrderName",
      "condition": {
        "name": "equals",
        "isUnary": false,
        "iconName": "filter_equal"
      },
      "conditionName": "equals",
      "searchVal": "foo"
    },
    {
      "fieldName": "OrderId",
      "condition": {
        "name": "inQuery",
        "isUnary": false,
        "isNestedQuery": true,
        "iconName": "in"
      },
      "conditionName": "inQuery",
      "searchTree": {
        "filteringOperands": [
          {
            "fieldName": "Id",
            "condition": {
              "name": "equals",
              "isUnary": false,
              "iconName": "filter_equal"
            },
            "conditionName": "equals",
            "searchVal": 123
          },
          {
            "fieldName": "ProductName",
            "condition": {
              "name": "equals",
              "isUnary": false,
              "iconName": "filter_equal"
            },
            "conditionName": "equals",
            "searchVal": "abc"
          }
        ],
        "operator": 0,
        "entity": "Products",
        "returnFields": [
          "OrderId"
        ]
      }
    },
    {
      "filteringOperands": [
        {
          "fieldName": "OrderName",
          "condition": {
            "name": "endsWith",
            "isUnary": false,
            "iconName": "filter_ends_with"
          },
          "conditionName": "endsWith",
          "searchVal": "a"
        }
      ],
      "operator": 1,
      "entity": "Orders",
      "returnFields": [
        "*"
      ]
    },
    {
      "fieldName": "OrderDate",
      "condition": {
        "name": "today",
        "isUnary": true,
        "iconName": "filter_today"
      },
      "conditionName": "today"
    }
  ],
  "operator": 0,
  "entity": "Orders",
  "returnFields": [
    "*"
  ]
}`);
    }));

    it('Should remove the inner group when the last condition is dragged out.', fakeAsync(() => {
      const draggedChip = chipComponents[5].componentInstance; // "OrderDate  Today" chip
      const heightOffset = draggedChip.nativeElement.offsetHeight;

      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 0, -4 * heightOffset, true);
      tick(50);
      fix.detectChanges();
      QueryBuilderFunctions.verifyFocusedChip('OrderDate', 'Today');

      UIInteractions.moveDragDirective(fix, chipComponents[4].componentInstance.dragDirective, 0, -4 * heightOffset, true);
      tick(50);
      fix.detectChanges();
      QueryBuilderFunctions.verifyFocusedChip('OrderName', 'Ends With', 'a');

      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);

      const firstChipBounds = chipComponents[0].nativeElement.getBoundingClientRect();
      const droppedChipBounds = chipComponents[3].nativeElement.getBoundingClientRect();
      expect(QueryBuilderFunctions.getQueryBuilderTreeChildGroups(QueryBuilderFunctions.getQueryBuilderTreeRootGroup(fix) as HTMLElement).length).toBe(0);
      expect(droppedChipBounds.x).toBeCloseTo(firstChipBounds.x);
      expect(chipComponents.length).toBe(4);
    }));

    it('Should drop the condition above the currently edited condition on dragging up.', fakeAsync(() => {
      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);
      const draggedChip = chipComponents[3].componentInstance; // "OrderDate  Today" chip
      const draggedChipElem = draggedChip.nativeElement;

      chipComponents[2].nativeElement.click();

      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 0, -2.5 * draggedChipElem.offsetHeight, true);
      tick(50);
      fix.detectChanges();
      QueryBuilderFunctions.verifyFocusedChip('OrderDate', 'Today');

      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);
      expect(QueryBuilderFunctions.getChipContent(chipComponents[2].nativeElement)).toBe("OrderDate  Today");
    }));

    it('Should be able to drag a top-level condition while a sub-query is expanded.', () => {
      chipComponents[1].nativeElement.click();

      const draggedChip = chipComponents[0].componentInstance;
      const draggedChipElem = draggedChip.nativeElement;

      expect(draggedChip.draggable).toBeTrue();
      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 0, draggedChipElem.offsetHeight, false);
      expect(QueryBuilderFunctions.getDropGhost(fix)).not.toBe(null);
    });

    it('Should allow dragging a sub-query condition while a sub-query is expanded.', () => {
      chipComponents[1].nativeElement.click();

      const draggedChip = chipComponents[2].componentInstance;
      const draggedChipElem = draggedChip.nativeElement;

      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 0, draggedChipElem.offsetHeight, false);
      expect(QueryBuilderFunctions.getDropGhost(fix)).not.toBe(null);
    });

    it('Should successfully rearrange sub-query conditions via mouse drag.', fakeAsync(() => {
      chipComponents[1].nativeElement.click();

      const draggedChip = chipComponents[2].componentInstance;
      const draggedChipElem = draggedChip.nativeElement;

      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 0, draggedChipElem.offsetHeight, true);
      tick(50);
      fix.detectChanges();
      QueryBuilderFunctions.verifyFocusedChip('Id', 'Equals', '123');

      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);
      expect(chipComponents.length).toBe(5);
      expect(QueryBuilderFunctions.getChipContent(chipComponents[1].nativeElement)).toBe("ProductName  Equals  abc");
      expect(QueryBuilderFunctions.getChipContent(chipComponents[2].nativeElement)).toBe("Id  Equals  123");
    }));

    it('Should not allow dragging a sub-query condition outside the sub-query.', () => {
      chipComponents[1].nativeElement.click();

      const draggedChip = chipComponents[2].componentInstance;
      const draggedChipElem = draggedChip.nativeElement;

      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 0, -10 * draggedChipElem.offsetHeight, false);

      expect(QueryBuilderFunctions.getVisibleChips(fix).length).toBe(4);
      expect(QueryBuilderFunctions.getDropGhost(fix)).toBe(null);
    });

    it('Should successfully drop a condition inside a newly created group.', fakeAsync(() => {
      var addGroupButton = QueryBuilderFunctions.getQueryBuilderTreeRootGroupButtons(fix, 0).pop();
      QueryBuilderFunctions.verifyGroupLineCount(fix, 2, 1);

      (addGroupButton as HTMLElement).click();
      const draggedChip = chipComponents.pop().componentInstance;
      const draggedChipElem = draggedChip.nativeElement;
      UIInteractions.moveDragDirective(fix, draggedChip.dragDirective, 0, 3 * draggedChipElem.offsetHeight, true);
      tick(300);
      fix.detectChanges();
      QueryBuilderFunctions.verifyFocusedChip('OrderDate', 'Today');

      chipComponents = QueryBuilderFunctions.getVisibleChips(fix);
      expect(chipComponents.length).toBe(4);
      QueryBuilderFunctions.verifyGroupLineCount(fix, 2, 2);
      const newGroup = QueryBuilderFunctions.getQueryBuilderAllGroups(fix).pop();
      const newGroupConditions = newGroup.querySelectorAll('igx-chip');
      expect(newGroupConditions.length).toBe(1);
      expect(QueryBuilderFunctions.getChipContent(newGroupConditions[0])).toBe("OrderDate  Today");
    }));

    it('Should render drop ghost properly when keyboard dragged.', fakeAsync(() => {
      const draggedIndicator = fix.debugElement.queryAll(By.css('.igx-drag-indicator'))[1];
      const tree = fix.debugElement.query(By.css('.igx-filter-tree'));

      draggedIndicator.triggerEventHandler('focus', {});
      draggedIndicator.nativeElement.focus();

      spyOn(tree.nativeElement, 'dispatchEvent').and.callThrough();
      const dropGhostContent = QueryBuilderFunctions.GetChipsContentAsArray(fix)[1];

      //pass 1 down to bottom
      let keyPress = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      for (let i = 0; i <= 5; i++) {
        tree.nativeElement.dispatchEvent(keyPress);
        tick(20);
        fix.detectChanges();

        const dropGhost = QueryBuilderFunctions.getDropGhost(fix);
        const prevElement = dropGhost && dropGhost.previousElementSibling ? QueryBuilderFunctions.getChipContent(dropGhost.previousElementSibling) : null;
        const nextElement = dropGhost && dropGhost.nextElementSibling ? QueryBuilderFunctions.getChipContent(dropGhost.nextElementSibling) : null;
        const newChipContents = QueryBuilderFunctions.GetChipsContentAsArray(fix);

        switch (true) {
          case i === 0:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toBeNull();
            expect(nextElement).toEqual("OrderName  Ends With  a");
            expect(newChipContents[4]).toBe(dropGhostContent);
            break;
          case i === 1:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toEqual("OrderName  Ends With  a");
            expect(nextElement).toBeUndefined();
            expect(newChipContents[5]).toBe(dropGhostContent);
            break;
          case i === 2:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toEqual("OrderDate  Today");
            expect(nextElement).toBeUndefined();
            expect(newChipContents[6]).toBe(dropGhostContent);
            break;
          case i >= 3:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toEqual("or  OrderName  Ends With  a  OrderDate  Today");
            expect(nextElement).toBeNull();
            expect(newChipContents[6]).toBe(dropGhostContent);
            break;
        }
      }

      //pass 2 up to top
      keyPress = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      for (let i = 0; i <= 10; i++) {
        tree.nativeElement.dispatchEvent(keyPress);
        tick(20);
        fix.detectChanges();

        const dropGhost = QueryBuilderFunctions.getDropGhost(fix);
        const prevElement = dropGhost && dropGhost.previousElementSibling ? QueryBuilderFunctions.getChipContent(dropGhost.previousElementSibling) : null;
        const nextElement = dropGhost && dropGhost.nextElementSibling ? QueryBuilderFunctions.getChipContent(dropGhost.nextElementSibling) : null;
        const newChipContents = QueryBuilderFunctions.GetChipsContentAsArray(fix);

        switch (true) {
          case i === 0:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toEqual("OrderDate  Today");
            expect(nextElement).toBeUndefined();
            expect(newChipContents[6]).toBe(dropGhostContent);
            break;
          case i === 1:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toBeUndefined();
            expect(nextElement).toEqual("OrderDate  Today");
            expect(newChipContents[5]).toBe(dropGhostContent);
            break;
          case i === 2:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toBeNull();
            expect(nextElement).toEqual("OrderName  Ends With  a");
            expect(newChipContents[4]).toBe(dropGhostContent);
            break;
          case i === 3:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toBeUndefined();
            expect(nextElement).toEqual("or  OrderName  Ends With  a  OrderDate  Today");
            expect(newChipContents[4]).toBe(dropGhostContent);
            break;
          case i >= 4:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toBeNull();
            expect(nextElement).toEqual("OrderName  Equals  foo");
            expect(newChipContents[0]).toBe(dropGhostContent);
            break;
        }
      }

      //pass 3 down to bottom again
      keyPress = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      for (let i = 0; i <= 10; i++) {
        tree.nativeElement.dispatchEvent(keyPress);
        tick(20);
        fix.detectChanges();

        const dropGhost = QueryBuilderFunctions.getDropGhost(fix);
        const prevElement = dropGhost && dropGhost.previousElementSibling ? QueryBuilderFunctions.getChipContent(dropGhost.previousElementSibling) : null;
        const nextElement = dropGhost && dropGhost.nextElementSibling ? QueryBuilderFunctions.getChipContent(dropGhost.nextElementSibling) : null;
        const newChipContents = QueryBuilderFunctions.GetChipsContentAsArray(fix);

        switch (true) {
          case i === 0:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toEqual("OrderName  Equals  foo");
            expect(nextElement).toBeUndefined();
            expect(newChipContents[1]).toBe(dropGhostContent);
            break;
          case i === 1:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toBeNull();
            expect(nextElement).toEqual("OrderName  Ends With  a");
            expect(newChipContents[4]).toBe(dropGhostContent);
            break;
          case i === 2:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toEqual("OrderName  Ends With  a");
            expect(nextElement).toBeUndefined();
            expect(newChipContents[5]).toBe(dropGhostContent);
            break;
          case i === 3:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toEqual("OrderDate  Today");
            expect(nextElement).toBeUndefined();
            expect(newChipContents[6]).toBe(dropGhostContent);
            break;
          case i >= 4:
            expect(dropGhost).toBeDefined();
            expect(prevElement).toEqual("or  OrderName  Ends With  a  OrderDate  Today");
            expect(nextElement).toBeNull();
            expect(newChipContents[6]).toBe(dropGhostContent);
            break;
        }
      }
    }));
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
         <igx-query-builder-header [title]="'Custom Title'"></igx-query-builder-header>
         <ng-template #searchValueTemplate
                        igxQueryBuilderSearchValue
                        let-searchValue
                        let-selectedField = "selectedField"
                        let-selectedCondition = "selectedCondition"
                        let-defaultSearchValueTemplate = "defaultSearchValueTemplate">
            @if (selectedField?.field === 'OrderId' && selectedCondition === 'greaterThan'){
                <input type="text" class="custom-class" required [(ngModel)]="searchValue.value"/>
                <p class="selectedField">{{selectedField.field}}</p>
                <p class="selectedCondition">{{selectedCondition}}</p>
            } @else if (selectedField?.field === 'OrderId' && selectedCondition === 'equals') {
                <igx-combo [data]="comboData" [(ngModel)]="searchValue.value"
                    (selectionChanging)="handleChange($event, selectedField, searchValue)" [displayKey]="'field'">
                </igx-combo>
            } @else {
                <ng-container #defaultTemplate *ngTemplateOutlet="defaultSearchValueTemplate"></ng-container>
            }
        </ng-template>
     </igx-query-builder>
    `,
  standalone: true,
  imports: [
    IgxQueryBuilderComponent,
    IgxQueryBuilderHeaderComponent,
    IgxQueryBuilderSearchValueTemplateDirective,
    IgxComboComponent,
    NgTemplateOutlet,
    FormsModule
  ]
})
export class IgxQueryBuilderCustomTemplateSampleTestComponent implements OnInit {
  @ViewChild(IgxQueryBuilderComponent) public queryBuilder: IgxQueryBuilderComponent;
  @ViewChild('searchValueTemplate', { read: IgxQueryBuilderSearchValueTemplateDirective, static: true })
  public searchValueTemplate: IgxQueryBuilderSearchValueTemplateDirective;
  public entities: Array<any>;
  public expressionTree: IExpressionTree;
  public comboData: any[];


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

    this.comboData = [
      { id: 0, field: 'A' },
      { id: 1, field: 'B' }
    ];
  }

  public handleChange(ev, selectedField, searchVal) {
    if (selectedField.field === 'OrderId') {
      searchVal.value = ev.newValue[0];
      selectedField.formatter = (value: any, rowData: any) => rowData === 'equals' ? (Array.from(value)[0] as any).id : value;
    }
  }
}
