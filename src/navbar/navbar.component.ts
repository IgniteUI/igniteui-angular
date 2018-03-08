import { CommonModule } from "@angular/common";
import {
    Component,
    EventEmitter,
    Input,
    NgModule,
    OnInit,
    Output
} from "@angular/core";
import { IgxButtonModule } from "../directives/button/button.directive";
import { IgxIconModule } from "../icon";

@Component({
    selector: "igx-navbar",
    templateUrl: "navbar.component.html"
})

export class IgxNavbarComponent {
    private static NEXT_ID = 1;
    private isVisible = true;
    /**
     * The IgxNavbar action button visual state state
     * @type {boolean}
     */
    @Input()
    public get isActionButtonVisible(): boolean {
        if (!this.actionButtonIcon) {
            return false;
        }
        return this.isVisible;
    }

    public set isActionButtonVisible(value: boolean) {
        this.isVisible = value;
    }
    /**
     * The IgxNavbar action button actionButtonIcon
     * @type {string}
     */
    @Input() public actionButtonIcon: string;

    /**
     * The IgxNavbar title
     * @type {string}
     */
    @Input() public title: string;

    /**
     * The event that will be thrown when the action is executed,
     * provides reference to the IgxNavbar component as argument
     * @type {EventEmitter}
     */
    @Output() public onAction = new EventEmitter();

    @Input()
    public titleId = `igx-navbar-${IgxNavbarComponent.NEXT_ID++}`;

    public _triggerAction() {
        this.onAction.emit(this);
    }
}

@NgModule({
    declarations: [IgxNavbarComponent],
    exports: [IgxNavbarComponent],
    imports: [IgxButtonModule, IgxIconModule, CommonModule]
})
export class IgxNavbarModule {
}
