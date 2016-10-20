import { Component, Input, NgModule } from '@angular/core';
import { HammerGesturesManager } from "../core/touch";
import { Location } from '@angular/common';
import { ButtonModule } from "../../src/button/button";

@Component({
    selector: "ig-navbar",
    moduleId: module.id, 
    templateUrl: "navbar.html",
    providers: [HammerGesturesManager]
})
export class Navbar {
    
    @Input() title: string;
    @Input('icon') icon: string;

    constructor(private _location: Location) {
    }

    canGoBack() {
        var isStackHisoryEmpty = window.history.length == 0;

        return isStackHisoryEmpty;
    }

    navigateBack($event) {
        this._location.back();
    }

    hasIcon() {
        return this.icon != undefined;
    }
}


@NgModule({
    imports: [ButtonModule],
    declarations: [Navbar],
    exports: [Navbar]
})
export class NavbarModule {
}
