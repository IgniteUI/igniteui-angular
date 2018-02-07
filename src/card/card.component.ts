import { Component, Directive, NgModule, ViewEncapsulation } from "@angular/core";
import { IgxButtonModule } from "../button/button.directive";

/**
 * IgxCardHeader is container for the card header
 */
@Directive({
    selector: "igx-card-header"
})
export class IgxCardHeader { }

/**
 * IgxCardContent is container for the card content
 */
@Directive({
    selector: "igx-card-content"
})
export class IgxCardContent { }

/**
 * IgxCardActions is container for the card actions
 */
@Directive({
    selector: "igx-card-actions"
})
export class IgxCardActions { }

/**
 * IgxCardFooter is container for the card footer
 */
@Directive({
    host: {
        role: "footer"
    },
    selector: "igx-card-footer"
})
export class IgxCardFooter { }

/**
 * IgxCardComponent is a sheet of material that serves as an entry point to more detailed information.
 */
@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "igx-card",
    templateUrl: "card.component.html"
})
export class IgxCardComponent { }

@NgModule({
    declarations: [IgxCardComponent, IgxCardHeader, IgxCardContent, IgxCardActions, IgxCardFooter],
    exports: [IgxCardComponent, IgxCardHeader, IgxCardContent, IgxCardActions, IgxCardFooter],
    imports: [IgxButtonModule]
})
export class IgxCardModule { }
