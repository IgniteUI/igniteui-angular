import { Component } from "@angular/core";

@Component({
    selector: 'app-hierarchical-grid-sample',
    styleUrls: ['hierarchical-grid.sample.css'],
    templateUrl: 'hierarchical-grid.sample.html'
})
export class HierarchicalGridSampleComponent {
    localData = [];

    constructor() {
        for (let i = 0; i < 10000; i++) {
            let prods = [];
            for (let j = 0; j < 100; j++) {
                prods.push({ID: j, ProductName: "A" + i + "_" + "j"});
            }
            this.localData.push({ ID: i, Name: 'A' + i, Products: prods});
        }
    }
}
