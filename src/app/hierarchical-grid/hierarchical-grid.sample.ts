import { Component } from "@angular/core";

@Component({
    selector: 'app-hierarchical-grid-sample',
    styleUrls: ['hierarchical-grid.sample.css'],
    templateUrl: 'hierarchical-grid.sample.html'
})
export class HierarchicalGridSampleComponent {
    localData = [];

    constructor() {
        this.localData.push({ ID: -1, Name: ''});
        for (let i = 0; i < 10000; i++) {
            let prods = [];
            for (let j = 0; j < 3; j++) {
                prods.push({
                ID: j, ProductName: "A" + i + "_" + "j",
                SubProducts: [{ID: -2, ProductName: 'Test', SubSubProducts: [{ID: 100, ProductName: 'Test2'}]}]});
            }
            this.localData.push({ ID: i, Name: 'A' + i, Products: prods});
        }
    }
}
