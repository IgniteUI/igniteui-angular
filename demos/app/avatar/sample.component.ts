import { Component, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { IgxAvatar, IgxAvatarModule } from "../../../src/avatar/avatar.component";
import { IgxBadge, IgxBadgeModule } from "../../../src/badge/badge.component";

@Component({
    moduleId: module.id,
    selector: "avatar-sample",
    styleUrls: ["sample.component.css", "../app.samples.css"],
    templateUrl: "./sample.component.html"
})
export class AvatarSampleComponent {
    // @ViewChild(Avatar) avatar: Avatar;
    // Collection of avatars
    @ViewChildren(IgxAvatar) public avatar;
    public initials: string = "ZK";
    public bgColor: string = "#0375be";
    public src: string = "";
    public roundShape: string = "true";

    constructor() {
        this.setImageSource();
    }

    public setImageSource() {
        this.src = "http://lorempixel.com/300/300/people/" + Math.floor((Math.random() * 5) + 1);
    }

    public changeLink() {
        // for more avatars
        for (const each of this.avatar.toArray()) {
            if (each.src) {
                each.srcImage = "http://lorempixel.com/300/300/people/" + Math.floor((Math.random() * 10) + 1);
            }
        }
    }
}
