import { Component,  ViewChild, QueryList, ViewChildren } from "@angular/core";
import { AvatarModule, Avatar } from "../../src/avatar/avatar";

@Component({
    selector: "avatar-sample",
    template:`
        <h3>Avatars</h3>
        <div style="width: 600px;">
            <ig-avatar [source]="source" [roundShape]="roundShape">
            </ig-avatar>

            <ig-avatar [source]="source">
            </ig-avatar>

            <ig-avatar source="https://unsplash.it/60/60?image=55">
            </ig-avatar>

            <ig-avatar source="https://unsplash.it/60/60?image=55" [initials]="initials"
                [bgColor]="bgColor" [roundShape]="roundShape">
            </ig-avatar>

            <ig-avatar initials="RK" bgColor="lightgreen">
            </ig-avatar>

            <ig-avatar initials="AA" bgColor="pink" roundShape="true">
            </ig-avatar>

            <br />

            <ig-avatar initials="ZK" width="100" roundShape="true"
                bgColor="lightgreen" >
            </ig-avatar>

            <ig-avatar initials="HA" width="100"
                bgColor="paleturquoise" >
            </ig-avatar>

            <ig-avatar initials="PP" width="100" textColor="lightyellow"
                roundShape="true" bgColor="lightcoral" >
            </ig-avatar>
        </div>
        <button (click)="changeLink()">Change Image</button>
    `
})
export class AvatarSampleComponent {
    //@ViewChild(Avatar) avatar: Avatar;
    // Collection of avatars
    @ViewChildren(Avatar) avatar;
    initials: string = 'ZK';
    bgColor: string = 'lightblue';
    source: string = '';
    roundShape: string = "false";

    constructor(){
        //this.setImageSource();
        this.setImageSource();
    }

    setImageSource(){
        this.source = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);
    }

    public changeLink() {
        //this.avatar.srcImage = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);

        // for more avatars
        for(let each of this.avatar.toArray()){
            each.srcImage = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);
        }
    }
}