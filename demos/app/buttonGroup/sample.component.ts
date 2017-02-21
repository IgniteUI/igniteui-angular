import { Component } from "@angular/core";
import { IgxButtonGroupModule } from "../../../src/buttonGroup/buttonGroup.component";
import { IgxDirectivesModule } from "../../../src/modules";
import { IgxButton } from "../../../src/button/button.directive";

@Component({
    selector: "buttongroup-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html'
})

export class ButtonGroupSampleComponent {
    multi = 5 < 7;
    constructor() {
    }
    public get buttons(): Array<any> {
        let buttons = [];                
            buttons.push(
                {type: "raised", ripple: "white", selected: true, label: "Bold"},
                {type: "flat", ripple: "#494949", label: "Italic"},
                {type: "raised", ripple: "white", label: "Underlined"},
            );
        return buttons;
    };
}
