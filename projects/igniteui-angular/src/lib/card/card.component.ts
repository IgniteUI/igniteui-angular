import { Component, Directive, HostBinding, Input, NgModule } from '@angular/core';
import { IgxButtonModule } from '../directives/button/button.directive';

let NEXT_ID = 0;

/**
 * IgxCardHeader is container for the card header
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-card-header'
})
export class IgxCardHeaderDirective { }

/**
 * IgxCardContent is container for the card content
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-card-content'
})
export class IgxCardContentDirective { }

/**
 * IgxCardActions is container for the card actions
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-card-actions'
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
    selector: 'igx-card-footer'
})
export class IgxCardFooterDirective {
    @Input() public role = 'footer';
}

/**
 * **Ignite UI for Angular Card** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/card.html)
 *
 * The Ignite UI Card serves as a container that allows custom content to be organized in an appealing way.  There are
 * four sections in a card that you can use to organize your content.  These are header, footer, content & actions.
 *
 * Example:
 * ```html
 * <igx-card>
 *   <igx-card-header>
 *     <div>
 *       <h3 class="igx-card-header__title--small">{{title}}</h3>
 *       <h5 class="igx-card-header__subtitle">{{subtitle}}</h5>
 *     </div>
 *   </igx-card-header>
 *   <igx-card-actions>
 *     <div>
 *       <button igxButton igxRipple>Share</button>
 *       <button igxButton igxRipple>Play Album</button>
 *     </div>
 *   </igx-card-actions>
 * </igx-card>
 * ```
 */
@Component({
    selector: 'igx-card',
    templateUrl: 'card.component.html'
})
export class IgxCardComponent {
    /**
     * Sets/gets the `id` of the card.
     * If not set, `id` will have value `"igx-card-0"`;
     * ```html
     * <igx-card id = "my-first-card"></igx-card>
     * ```
     * ```typescript
     * let cardId =  this.card.id;
     * ```
     * @memberof IgxCardComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-card-${NEXT_ID++}`;
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxCardComponent, IgxCardHeaderDirective,
        IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
    exports: [IgxCardComponent, IgxCardHeaderDirective,
        IgxCardContentDirective, IgxCardActionsDirective, IgxCardFooterDirective],
    imports: [IgxButtonModule]
})
export class IgxCardModule { }
