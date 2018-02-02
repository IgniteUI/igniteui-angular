import { Component, Directive, NgModule, ViewEncapsulation } from "@angular/core";
import { IgxButtonModule } from "../directives/button/button.directive";

/**
 * IgxCardHeader is container for the card header
 */
@Directive({
    selector: "igx-card-header"
})
export class IgxCardHeaderDirective { }

/**
 * IgxCardContent is container for the card content
 */
@Directive({
    selector: "igx-card-content"
})
export class IgxCardContentDirective { }

/**
 * IgxCardActions is container for the card actions
 */
@Directive({
    selector: "igx-card-actions"
})
export class IgxCardActionsDirective { }

/**
 * IgxCardFooter is container for the card footer
 */
@Directive({
    host: {
        role: "footer"
    },
    selector: "igx-card-footer"
})
export class IgxCardFooterDirective { }

/**
 * IgxCardComponent is a sheet of material that serves as an entry point to more detailed information.
 */
@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "igx-card",
    styleUrls: ["./card.component.scss"],
    templateUrl: "card.component.html"
})
export class IgxCardComponent { }

@NgModule({
    declarations: [IgxCardComponent, IgxCardHeaderDirective, IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
    exports: [IgxCardComponent, IgxCardHeaderDirective, IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
    imports: [IgxButtonModule]
})
export class IgxCardModule { }
