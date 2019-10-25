import { Component } from '@angular/core';

@Component({
    selector: 'app-hierarchical-grid-sample',
    styleUrls: ['hierarchical-grid-master-detail.sample.css'],
    templateUrl: 'hierarchical-grid-master-detail.sample.html'
})
export class HierarchicalGridMasterDetailSampleComponent {
    localData = [];

    constructor() {
        this.localData = this.generateDataUneven(100, 3);
    }

    generateDataUneven(count: number, level: number, parendID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
            if (level > 0) {
                // Have child grids for row with even id less rows by not multiplying by 2
                children = this.generateDataUneven(((i % 2) + 1) * Math.round(count / 3), currLevel - 1, rowID);
            }
            const category = i % 4 !== 0 ?
            {
                CategoryID: i,
                CategoryName: 'Beverages ' + i,
                Description: 'Soft drinks, coffees, teas, beers, and ales'
            } : null;
            const suppliers = [];
            for (let j = 0; j < 4; j++) {
                suppliers.push({Name: 'Supplier ' + j, Details:
                `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                 dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in reprehenderit in voluptate
                velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`});
            }
            prods.push({
                ID: rowID,
                Category: category,
                Suppliers: suppliers,
                ChildLevels: currLevel,
                ProductName: 'Product: A' + i,
                Col1: i,
                Col2: i,
                Col3: i,
                childData: children,
                childData2: children,
                hasChild: true
            });
        }
        return prods;
    }
}
