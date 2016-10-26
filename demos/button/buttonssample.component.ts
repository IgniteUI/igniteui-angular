import { Component } from "@angular/core";
import { ButtonModule } from "../../src/button/button";

@Component({
    selector: "button-sample",
    template: `
<div id="phoneContainer" class="phone">
    <div id="mobileDiv" class="screen">
        <div>
            <span class="componentTitle">Button</span><br>
            <span class="componentDesc">A directive that applies button functionality to an element.</span><br><br>
            <span igButton="flat" igRipple>Flat</span><br>
            <span igButton="raised" igRipple="white">Raised</span>  
            <span igButton="raised" igButtonColor="#FBB13C" igButtonBackground="#340068" igRipple="white">Raised Custom</span> 
            <span igButton="raised" igButtonColor="yellow" igButtonBackground="black" igRipple="yellow">Raised Custom</span> 
            <span igButton="gradient" igRipple="white">Gradient</span>
            <span igButton="raised" disabled>Disabled</span>
            <div style="display: flex; flex-wrap: row; padding: 10px 10px">
                <span igButton="fab" igRipple="white"><i class="material-icons">add</i></span>
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
        </div>
    </div>
</div>
    `
})

export class ButtonsSampleComponent { }