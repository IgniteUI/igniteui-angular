import { Component } from "@angular/core";
import { ButtonModule } from "../../src/button/button";

@Component({
    selector: "button-sample",
    template: `
        <h3>Buttons</h3>
        <div>
            <span igButton="flat">Flat</span>
        </div>
        <br>
        <div>
            <span igButton="raised">Raised</span>  
        </div>
        <br>
        <div>
            <span igButton="gradient">Gradient</span>
        </div>
        <br>
        <div>
            <span igButton="raised" disabled>Disabled</span>
        </div>
        <br>
        <div>
            <a igButton="fab">
                <i class="material-icons">alarm_add</i>
            </a>
        </div>
        <div style="display: flex; flex-wrap: row; padding: 10px 0">
            <a igButton="icon">
                <i class="material-icons">search</i>
            </a>
            <a igButton="icon">
                <i class="material-icons">favorite</i>
            </a>
            <a igButton="icon">
                <i class="material-icons">more_vert</i>
            </a>
        </div>
    `
})

export class ButtonsSampleComponent { }