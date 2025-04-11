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
        const albumsTree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Albums', ['Artist']);
        albumsTree.filteringOperands.push({
            fieldName: 'USBillboard200',
            condition: IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo'),
            conditionName: IgxNumberFilteringOperand.instance().condition('lessThanOrEqualTo').name,
            searchVal: 5
        });
        // const toursTree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Tours', ['TouredBy']);
        // toursTree.filteringOperands.push({
        //     fieldName: 'Headliner',
        //     condition: IgxStringFilteringOperand.instance().condition('equals'),
        //     conditionName: IgxStringFilteringOperand.instance().condition('equals').name,
        //     searchVal: 'YES'
        // });
        const artistsTree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'Artists', ['*']);
        artistsTree.filteringOperands.push({
            fieldName: 'Artist',
            condition: IgxStringFilteringOperand.instance().condition('inQuery'),
            conditionName: IgxStringFilteringOperand.instance().condition('inQuery').name,
            searchTree: albumsTree
        });
        this.hierarchicalGrid.advancedFilteringExpressionsTree = artistsTree;
        this.cdr.detectChanges();
    }
}
