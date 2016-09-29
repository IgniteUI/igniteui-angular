import { Component } from "@angular/core";
import { NavigationDrawerModule, NavigationService } from "../../src/main";


@Component({
    selector: "nav-sample",
    template: `
        <ig-nav-drawer id="test"
            (opened)="logEvent($event)" 
            (closed)="logEvent($event)"
            (opening)="logEvent($event)" 
            (closing)="logEvent($event)"
            [position]="position"
            pinThreshold=""
            [pin]="pin"
            [enableGestures]='gestures'
            [isOpen]="open"
            [width]="drawerWidth"
            [miniWidth]="drawerMiniWidth">
    
        <!-- expand + mini templates -->
        <ig-drawer-content>
            <h1> Drawer Title <button ig-nav-close="test"> X </button></h1>
            <div *ngFor="let navItem of navItems"><img src="http://www.infragistics.com/assets/images/favicon.ico" width='16' /> <a href="{{navItem.link}}"> {{navItem.text}} </a></div>
        </ig-drawer-content>
    </ig-nav-drawer>
    `,
     providers: [NavigationService],
})
export class NavDrawerSampleComponent { }
