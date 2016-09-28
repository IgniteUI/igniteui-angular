import { Component } from "@angular/core";
import { AvatarModule } from "../../src/avatar/avatar";

@Component({
    selector: "avatar-sample",
    template:`
        <h3>Avatar</h3>
        <div style="width: 600px;">
            <ig-avatar [hasLabel]="hasLabel" [source]="source">
                <p>Hello World</p>
            </ig-avatar>
        </div>
    `
})
export class AvatarSampleComponent {
    hasLabel = true;
    text: string = '';
    source: string = '';

    constructor(){
        this.setLabelText();
        this.setImageSource();
    }

    setLabelText(){
        this.text = "title text";
    }

    setImageSource(){
        this.source = "https://unsplash.it/60/60?image=56";
    }
}