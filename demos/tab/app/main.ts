/// <reference path="../../../typings/globals/node/index.d.ts" />
import {Component, ViewChild} from '@angular/core';
import * as Infragistics from '../../../src/main';

@Component({
    selector: 'demo-app',
    moduleId: module.id, // commonJS standard
    templateUrl: "main.html",
    directives: [
        //Infragistics.Button,
        //Infragistics.Icon,
        Infragistics.TabBar,
        Infragistics.Tab
    ]
})

export class AppComponent {
    //@ViewChild('tabBar') tabBar: TabBar;

      selectTab(args) {
        console.log("index: " + args.index);
        console.log(args.tab);
        //args.tab._tabBar.remove(args.tab.index);
      }

      //this.tabBar.alignment = "bottom";
}
