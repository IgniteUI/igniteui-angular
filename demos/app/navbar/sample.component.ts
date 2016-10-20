import { Component, OnInit } from "@angular/core";
import { NavbarModule, Navbar } from "../../../src/main";

const CURRENT_VIEW: string = "Zero block samples";

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