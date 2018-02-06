import { Component, Directive, Input, NgModule, ViewEncapsulation } from "@angular/core";
import { IgxButtonModule } from "../directives/button/button.directive";

/**
 * IgxCardHeader is container for the card header
 */
@Directive({
    selector: "[igxCardHeader]"
})
export class IgxCardHeaderDirective { }

/**
 * IgxCardContent is container for the card content
 */
@Directive({
    selector: "[igxCardContent]"
})
export class IgxCardContentDirective { }

/**
 * IgxCardActions is container for the card actions
 */
@Directive({
    selector: "[igxCardActions]"
})
export class IgxCardActionsDirective { }

/**
 * IgxCardFooter is container for the card footer
 */
@Directive({
    selector: "[igxCardFooter]"
})
export class IgxCardFooterDirective {
    @Input() public role = "footer";
 }

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
    declarations: [IgxCardComponent, IgxCardHeaderDirective,
        IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
    exports: [IgxCardComponent, IgxCardHeaderDirective,
        IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
    imports: [IgxButtonModule]
})
export class IgxCardModule { }
