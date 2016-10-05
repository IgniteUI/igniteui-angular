import { Component } from "@angular/core";
import { ButtonModule } from "../../src/button/button";

@Component({
    selector: "button-sample",
    template: `
        <h1>Buttons</h1>
        <div>
            <ig-button type="flat">Flat</ig-button>
        </div>
        <br>
        <div>
            <ig-button type="raised">Raised</ig-button>  
        </div>
        <br>
        <div>
            <ig-button type="gradient">Gradient</ig-button>
        </div>
        <br>
        <div>
            <ig-button type="raised" disabled>Disabled</ig-button>
        </div>
        <br>
        <div>
            <ig-button type="fab">
                <i class="material-icons">alarm_add</i>
            </ig-button>
        </div>
    `
})

export class ButtonsSampleComponent { }