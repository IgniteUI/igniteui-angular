import { Component,  ViewChild, QueryList, ViewChildren } from "@angular/core";
import { AvatarModule, Avatar } from "../../src/avatar/avatar";

@Component({
    selector: "avatar-sample",
    styles: [`
        td {
            padding: 5px;
        }
    `],
    template:`
        <h3>Avatars</h3>
        <div style="width: 600px;">
            <table>
                <tr>
                    <td>
                        <ig-avatar [src]="src" [roundShape]="roundShape">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar [src]="src">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar src="https://unsplash.it/60/60?image=55">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar src="https://unsplash.it/60/60?image=55" [initials]="initials"
                            [bgColor]="bgColor" [roundShape]="roundShape">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="RK" bgColor="#fbb13c">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="AA" bgColor="#731963" roundShape="true">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar roundShape="true" icon="person" bgColor="#0375be" data-init="SS">
                        </ig-avatar>
                    </td>
                </tr>
                <tr>
                    <td>
                        <ig-avatar initials="ZK" width="100" roundShape="true"
                            bgColor="#ff6978">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="HA" width="100" size="potatos"
                            bgColor="#340068">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="PP" width="100" color="black"
                            roundShape="false" bgColor="#94feed">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="PP" size="medium" roundShape="false"
                            bgColor="#e41c77">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="ZK" size="large" roundShape="true"
                            bgColor="#484848">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar color="gray">
                        </ig-avatar>
                    </td>
                </tr>
            </table>
        </div>
        <span igButton="raised" (click)="changeLink()">Change Image</span>
    `
})
export class AvatarSampleComponent {
    //@ViewChild(Avatar) avatar: Avatar;
    // Collection of avatars
    @ViewChildren(Avatar) avatar;
    initials: string = 'ZK';
    bgColor: string = '#0375be';
    src: string = '';
    roundShape: string = "true";

    constructor(){
        //this.setImageSource();
        this.setImageSource();
    }

    setImageSource(){
        this.src = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);
    }

    public changeLink() {
        //this.avatar.srcImage = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);

        // for more avatars
        for(let each of this.avatar.toArray()){
            each.srcImage = "https://unsplash.it/60/60?image=" + Math.floor((Math.random() * 50) + 1);
        }
    }
}