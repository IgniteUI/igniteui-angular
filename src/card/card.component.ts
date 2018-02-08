import { Component, Directive, Input, NgModule } from "@angular/core";
import { IgxButtonModule } from "../directives/button/button.directive";

/**
 * IgxCardHeader is container for the card header
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: "igx-card-header"
})
export class IgxCardHeaderDirective { }

/**
 * IgxCardContent is container for the card content
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: "igx-card-content"
})
export class IgxCardContentDirective { }

/**
 * IgxCardActions is container for the card actions
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: "igx-card-actions"
})
export class IgxCardActionsDirective { }

/**
 * IgxCardFooter is container for the card footer
 */
@Directive({
    /*     host: {
            role: "footer"
        }, */
    // tslint:disable-next-line:directive-selector
    selector: "igx-card-footer"
})
export class IgxCardFooterDirective {
    @Input() public role = "footer";
}

/**
 * IgxCardComponent is a sheet of material that serves as an entry point to more detailed information.
 */
@Component({
    selector: "igx-card",
    templateUrl: "card.component.html"
})
export class IgxCardComponent { }

@NgModule({
    declarations: [IgxCardComponent, IgxCardHeaderDirective,
        IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
    exports: [IgxCardComponent, IgxCardHeaderDirective,
        IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
    imports: [IgxButtonModule]
})
export class IgxCardModule { }
