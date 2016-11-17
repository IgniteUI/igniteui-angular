import { Component, Input, NgModule } from '@angular/core';
import { HammerGesturesManager } from "../core/touch";
import { Location } from '@angular/common';
import { IgxButtonModule } from "../button/button.directive";

@Component({
    selector: "igx-navbar",
    moduleId: module.id,
    templateUrl: "navbar.component.html",
    providers: [HammerGesturesManager]
})
export class IgxNavbar {

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
    imports: [IgxButtonModule],
    declarations: [IgxNavbar],
    exports: [IgxNavbar]
})
export class IgxNavbarModule {
}
