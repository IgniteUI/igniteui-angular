import { Component, AfterViewInit } from "@angular/core";
import { IgxButtonModule } from "../../../src/button/button.directive";

@Component({
    selector: "button-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html'
})
export class ButtonsSampleComponent {

        ngAfterViewInit() {
        debugger;
    }
}