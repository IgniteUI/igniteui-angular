import { Component } from "@angular/core";
import { ButtonModule } from "../../src/button/button";

@Component({
    selector: "button-sample",
    template: `
        <h3>Buttons</h3>
        <div style="width: 120px; margin: 10px">
            <span igButton="flat" igRipple>Flat</span>
        </div>
        <br>
        <div style="width: 120px; margin: 10px">
            <span igButton="raised" igRipple>Raised</span>  
        </div>
        <br>
        <div style="width: 120px; margin: 10px">
            <span igButton="raised" igButtonColor="#FBB13C" igButtonBackground="#340068" igRipple="white">Raised</span>  
        </div>
        <br>
        <div style="width: 120px; margin: 10px">
            <span igButton="raised" igButtonColor="yellow" igButtonBackground="black" igRipple="yellow">Test</span>
        </div>
        <br>
        <div style="width: 120px; margin: 10px">
            <span igButton="gradient" igRipple>Gradient</span>
        </div>
        <br>
        <div style="width: 120px; margin: 10px">
            <span igButton="raised" disabled>Disabled</span>
        </div>
        <br>
        <div style="margin: 10px; margin: 10px">
            <span igButton="fab" igRipple="black">
                <i class="material-icons">add</i>
            </span>
        </div>
        <br>
        <div style="margin: 10px; margin: 10px">
            <span igButton="fab" igButtonColor="#484848" igButtonBackground="white" igRipple="#484848">
                <i class="material-icons">edit</i>
            </span>
        </div>
        <div style="display: flex; flex-wrap: row; padding: 10px 0">
            <span igButton="icon" igRipple igRippleCentered="true">
                <i class="material-icons">search</i>
            </span>
            <span igButton="icon" igRipple igButtonColor="#E41C77" igRippleCentered="true">
                <i class="material-icons">favorite</i>
            </span>
            <span igButton="icon" igRipple igRippleCentered="true">
                <i class="material-icons">more_vert</i>
            </span>
        </div>
    `
})

export class ButtonsSampleComponent { }