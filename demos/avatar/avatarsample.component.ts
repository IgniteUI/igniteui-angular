import { Component, ViewChild, QueryList, ViewChildren } from "@angular/core";
import { AvatarModule, Avatar } from "zero-blocks/main";
import { BadgeModule, Badge } from "zero-blocks/main";

@Component({
    selector: "avatar-sample",
    styles: [`
        td {
            padding: 5px;
        }
    `],
    templateUrl: 'demos/avatar/avatarsample.component.html'

})
export class AvatarSampleComponent {
    // Collection of avatars
    @ViewChildren(Avatar) avatar;
    initials: string = 'ZK';
    bgColor: string = '#0375be';
    src: string = '';
    roundShape: string = "true";

    constructor() {
        //this.setImageSource();
        this.setImageSource();
    }

    setImageSource() {
        this.src = "http://lorempixel.com/300/300/people/" + Math.floor((Math.random() * 10) + 1);
    }

    public changeLink() {
        // for more avatars
        for (let each of this.avatar.toArray()) {
            if(each.src) {
                each.srcImage = "http://lorempixel.com/300/300/people/" + Math.floor((Math.random() * 10) + 1);
            }
        }
    }
}