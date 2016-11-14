import { Component, ViewChild, QueryList, ViewChildren } from "@angular/core";
import { AvatarModule, Avatar } from "../../../src/avatar/avatar";
import { BadgeModule, Badge } from "../../../src/badge/badge";

@Component({
    selector: "avatar-sample",
    moduleId: module.id,
    styles: [`
        td {
            padding: 5px;
        }
    `],
    templateUrl: "./sample.component.html"
})
export class AvatarSampleComponent {
    //@ViewChild(Avatar) avatar: Avatar;
    // Collection of avatars
    @ViewChildren(Avatar) avatar;
    initials: string = 'ZK';
    bgColor: string = '#0375be';
    src: string = '';
    roundShape: string = "true";

    constructor() {
        this.setImageSource();
    }

    setImageSource() {
        this.src = "http://lorempixel.com/300/300/people/" + Math.floor((Math.random() * 5) + 1);
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