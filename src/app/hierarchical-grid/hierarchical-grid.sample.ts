import { Component, ViewChild } from "@angular/core";
import { IgxRowIslandComponent, IgxHierarchicalGridComponent, IPathSegment } from 'igniteui-angular';

@Component({
    selector: 'app-hierarchical-grid-sample',
    styleUrls: ['hierarchical-grid.sample.css'],
    templateUrl: 'hierarchical-grid.sample.html'
})
export class HierarchicalGridSampleComponent {
    localData = [];
    isRowSelectable = false;
    firstLevelExpanded = false;
    rootExpanded = false;

    @ViewChild('layout1')
    layout1: IgxRowIslandComponent;

    @ViewChild('hGrid')
    hGrid: IgxHierarchicalGridComponent;


    constructor() {
        // this.localData.push({ ID: -1, Name: ''});
        // for (let i = 0; i < 10000; i++) {
        //     const prods = [];
        //     for (let j = 0; j < 3; j++) {
        //         prods.push({
        //         ID: j, ProductName: 'A' + i + '_' + j,
        //         SubProducts: [{ID: -2, ProductName: 'Test', SubSubProducts: [{ID: 100, ProductName: 'Test2'}]}]});
        //     }
        //     this.localData.push({ ID: i, Name: 'A' + i, Products: prods});
        // }

        this.localData = this.generateDataUneven(100, 3);
    }

    generateData(count: number, level: number) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
           if (level > 0 ) {
               children = this.generateData(count / 2 , currLevel - 1);
           }
           prods.push({
            ID: i, ChildLevels: currLevel,  ProductName: 'Product: A' + i, 'Col1': i,
            'Col2': i, 'Col3': i, childData: children, childData2: children });
        }
        return prods;
    }

    generateDataUneven(count: number, level: number, parendID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
            if (level > 0 ) {
               // Have child grids for row with even id less rows by not multiplying by 2
               children = this.generateDataUneven((i % 2 + 1) * Math.round(count / 3) , currLevel - 1, rowID);
            }
            prods.push({
                ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, 'Col1': i,
                'Col2': i, 'Col3': i, childData: children, childData2: children });
        }
        return prods;
    }

    setterChange() {
       this.layout1.rowSelectable = !this.layout1.rowSelectable;
    }

    setterBindingChange() {
        this.isRowSelectable = !this.isRowSelectable;
    }

    toggleRootLevel() {
        this.rootExpanded = !this.rootExpanded;
    }

    toggleFirstIsland() {
        this.firstLevelExpanded = !this.firstLevelExpanded;
    }

    testApis() {
    }
}
