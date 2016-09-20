import { Component } from "@angular/core";
import { TabBarModule } from "../../src/tabbar/tab";


@Component({
    selector: "tabbar-sample",
    template: `
        <h3>TabBar</h3>
        <ig-tab-bar>
            <ig-tab label="Tab 1"><h1>Tab 1 Content</h1></ig-tab>
            <ig-tab label="Tab 2"><h1>Tab 2 Content</h1></ig-tab>
        </ig-tab-bar>
    `
})
export class TabBarSampleComponent { }
