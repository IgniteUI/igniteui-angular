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
    //@ViewChild(Avatar) avatar: Avatar;
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
        this.src = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);
    }

    public changeLink() {
        //this.avatar.srcImage = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);

        // for more avatars
        for (let each of this.avatar.toArray()) {
            each.srcImage = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);
        }
    }
}