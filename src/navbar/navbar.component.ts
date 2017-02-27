import {Component, Input, NgModule, EventEmitter, Output, OnInit, AfterContentChecked} from '@angular/core';
import { HammerGesturesManager } from "../core/touch";
import { IgxButtonModule } from "../button/button.directive";

@Component({
    selector: "igx-navbar",
    moduleId: module.id,
    templateUrl: "navbar.component.html",
    providers: [HammerGesturesManager]
})
export class IgxNavbar implements AfterContentChecked {
    private static NEXT_ID: number = 1;
    private _titleId: string;

    ngAfterContentChecked(): void {
        this._titleId = `igx-navbar-${IgxNavbar.NEXT_ID++}`;
    }

    @Input()
    get titleId() {
        return this._titleId;
    }

    /**
     * The IgxNavbar action button visual state state
     * @type {boolean}
     */
    @Input()
    public isActionButtonVisible: boolean = false;

    /**
     * The IgxNavbar action button actionButtonIcon
     * @type {string}
     */
    @Input()
    public actionButtonIcon: string;

    /**
     * The IgxNavbar title
     * @type {string}
     */
    @Input() title: string;

    /**
     * The event that will be thrown when the action is executed,
     * provides reference to the IgxNavbar component as argument
     * @type {EventEmitter}
     */
    @Output()
    public onAction = new EventEmitter();

    private _triggerAction() {
        this.onAction.emit(this);
    }
}

@NgModule({
    imports: [IgxButtonModule],
    declarations: [IgxNavbar],
    exports: [IgxNavbar]
})
export class IgxNavbarModule {
}
