import {Directive, Component, NgModule} from "@angular/core";
import {HammerGesturesManager} from "../core/touch";
import {IgxButtonModule} from "../button/button.directive";

/**
 * IgxCardHeader is container for the card header
 */
@Directive({
    selector: "igx-card-header"
})
export class IgxCardHeader{}

/**
 * IgxCardContent is container for the card content
 */
@Directive({
    selector: "igx-card-content"
})
export class IgxCardContent{}

/**
 * IgxCardActions is container for the card actions
 */
@Directive({
    selector: "igx-card-actions"
})
export class IgxCardActions{}

/**
 * IgxCardFooter is container for the card footer
 */
@Directive({
    selector: "igx-card-footer",
    host: {
        role: "footer"
    }
})
export class IgxCardFooter{}

/**
 * IgxCardComponent is a sheet of material that serves as an entry point to more detailed information.
 */
@Component({
    selector: "igx-card",
    moduleId: module.id,
    templateUrl: "card.component.html",
    providers: [HammerGesturesManager],
})
export class IgxCardComponent{}

@NgModule({
    imports: [IgxButtonModule],
    declarations: [IgxCardComponent, IgxCardHeader, IgxCardContent, IgxCardActions, IgxCardFooter],
    exports: [IgxCardComponent, IgxCardHeader, IgxCardContent, IgxCardActions, IgxCardFooter]
})
export class IgxCardModule{}