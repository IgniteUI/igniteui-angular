import { Component, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import {
    IgxHierarchicalGridComponent,
    IGX_HIERARCHICAL_GRID_DIRECTIVES,
    FilteringExpressionsTree,
    FilteringLogic,
    IgxNumberFilteringOperand,
    IgxStringFilteringOperand
} from 'igniteui-angular';
import { SINGERS } from './data';


@Component({
    selector: 'app-hierarchical-grid-advanced-filtering-sample',
    styleUrls: ['hierarchical-grid-advanced-filtering.sample.scss'],
    templateUrl: 'hierarchical-grid-advanced-filtering.sample.html',
    imports: [IGX_HIERARCHICAL_GRID_DIRECTIVES]
})
export class HierarchicalGridAdvancedFilteringSampleComponent implements AfterViewInit {
    @ViewChild('hierarchicalGrid', { static: true })
    private hierarchicalGrid: IgxHierarchicalGridComponent;

    public localData = [];

    constructor(private cdr: ChangeDetectorRef) {
        this.localData = SINGERS;
    }

    public ngAfterViewInit() {
        const innerTree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Albums', ['Artist']);
        innerTree.filteringOperands.push({
            fieldName: 'USBillboard200',
            condition: IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'),
            conditionName: IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo').name,
            searchVal: 5
        });
        const tree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Artists', ['*']);
        tree.filteringOperands.push({
            fieldName: 'Artist',
            condition: IgxStringFilteringOperand.instance().condition('inQuery'),
            conditionName: IgxStringFilteringOperand.instance().condition('inQuery').name,
            searchTree: innerTree
        });
        this.hierarchicalGrid.advancedFilteringExpressionsTree = tree;
        this.cdr.detectChanges();
    }
}
