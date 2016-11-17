import { Component, OnInit } from "@angular/core";
import { IgxNavbarModule, IgxNavbar } from "../../../src/main";

const CURRENT_VIEW: string = "Ignite UI JS Blocks Samples";

@Component({
    moduleId: module.id,
    selector: "navbar-sample",
    styleUrls: ["sample.css"],
    templateUrl: "sample.html",
})
export class NavbarSampleComponent implements OnInit {
    currentView: string;

    ngOnInit() {
        this.currentView = CURRENT_VIEW;
    }
}