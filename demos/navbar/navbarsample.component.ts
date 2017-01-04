import { Component, OnInit } from "@angular/core";
import { IgxNavbarModule } from 'igniteui-js-blocks/main';

const CURRENT_VIEW: string = "Ignite UI JS Blocks";

@Component({
    selector: 'navbar-sample',
    templateUrl: 'demos/navbar/navbarsample.component.html'
})

export class NavbarSampleComponent implements OnInit {
    currentView: string;

    ngOnInit() {
        this.currentView = CURRENT_VIEW;
    }
}