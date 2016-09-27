import { Component } from "@angular/core";
import { ButtonModule } from "../../src/button/button";

@Component({
    selector: "button-sample",
    template: `
        <h1>Buttons</h1>
        <div>
            <ig-button type="raised">Raised</ig-button>  
        </div>
        <br>
        <div>
            <ig-button type="flat">Flat</ig-button>
        </div>
        <br>
        <div>
            <ig-button type="raised" disabled="true">Disabled</ig-button>
        </div>
    `
})

export class ButtonsSampleComponent { }