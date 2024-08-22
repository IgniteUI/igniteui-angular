import { waitForAsync, TestBed, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { FilteringExpressionsTree, FilteringLogic, IExpressionTree, IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxNumberFilteringOperand, IgxQueryBuilderComponent, IgxQueryBuilderHeaderComponent, IgxStringFilteringOperand } from 'igniteui-angular';
import { configureTestSuite } from '../test-utils/configure-suite';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ControlsFunction } from '../test-utils/controls-functions.spec';
import { QueryBuilderFunctions } from './query-builder-functions';

const QUERY_BUILDER_CLASS = 'igx-query-builder';
const QUERY_BUILDER_HEADER = 'igx-query-builder__header';
const QUERY_BUILDER_BODY = 'igx-query-builder__main';
const QUERY_BUILDER_TREE = 'igx-query-builder-tree';
const QUERY_BUILDER_HEADER_TAG = "IGX-QUERY-BUILDER-HEADER";
const QUERY_BUILDER_EXPRESSION_ITEM_CLASS = 'igx-filter-tree__expression-item';
const CHIP_SELECT_CLASS = '.igx-chip__select';
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

            expect(QueryBuilderFunctions.getQueryBuilderFilteringHeaderText(fix)).toBe(' Query Builder ');
            expect(QueryBuilderFunctions.getQueryBuilderFilteringHeaderLegendItemAnd(fix).textContent).toBe('and');
            expect(QueryBuilderFunctions.getQueryBuilderFilteringHeaderLegendItemOr(fix).textContent).toBe('or');
            const queryTreeElement = queryBuilderElement.children[1];
            expect(queryTreeElement).toHaveClass(QUERY_BUILDER_CLASS);

            expect(queryBuilder.expressionTree).toBeUndefined();

            expect(queryTreeElement.children.length).toEqual(3);
            const bodyElement = queryTreeElement.children[0];
            expect(bodyElement).toHaveClass(QUERY_BUILDER_BODY);
            expect(bodyElement.children.length).toEqual(4);

            // initial add "'and'/'or' group " buttons should be displayed
            expect(bodyElement.querySelectorAll(':scope > button').length).toEqual(2);
            // empty filtering tree message should be displayed
            expect(bodyElement.children[2]).toHaveClass('igx-filter-empty');
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
    });

    describe('Interactions', () => {
        it('', () => { });
    });

    describe('Keyboard navigation', () => {
        it('', () => { });
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
         <igx-query-builder-header [title]="'Custom Title'" [showLegend]="false"></igx-query-builder-header>
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
