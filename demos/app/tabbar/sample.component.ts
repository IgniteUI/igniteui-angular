import { Component } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";

@Component({
    selector: "tabbar-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html'
})
export class TabBarSampleComponent {

    private navItems: Array<Object> = [
            { key:"1", text: "<h1>Hi world</h1>This is some very long string <br> hello world", link: "#" },
            { key:"2", text: "Nav2", link: "#" },
            { key:"3", text: "Nav3", link: "#" },
            { key:"4", text: "Nav4", link: "#" }
        ];
}
