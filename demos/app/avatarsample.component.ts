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
                        <ig-avatar initials="RK" bgColor="lightgreen">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="AA" bgColor="pink" roundShape="true">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar roundShape="true">
                        </ig-avatar>
                    </td>
                </tr>
                <tr>
                    <td>
                        <ig-avatar initials="ZK" width="100" roundShape="true"
                            bgColor="lightgreen" >
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="HA" width="100" size="potatos"
                            bgColor="paleturquoise" >
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="PP" width="100" color="lightyellow"
                            roundShape="false" bgColor="lightcoral" >
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="PP" size="medium" roundShape="false"
                            bgColor="paleturquoise">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar initials="ZK" size="large"
                            bgColor="paleturquoise">
                        </ig-avatar>
                    </td>
                    <td>
                        <ig-avatar>
                        </ig-avatar>
                    </td>
                </tr>
            </table>
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
    src: string = '';
    roundShape: string = "false";

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