import { CommonModule } from '@angular/common';
import { Component, Directive, HostBinding, Input, NgModule } from '@angular/core';
import { IgxButtonModule } from '../directives/button/button.directive';

let NEXT_ID = 0;

/**
 * IgxCardMedia is container for the card media section.
 * Use it to wrap images and videos.
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-card-media'
})
export class IgxCardMediaDirective {
    @HostBinding('class.igx-card__media')
    public cssClass = 'igx-card__media';

    @Input()
    @HostBinding('style.width')
    @HostBinding('style.min-width')
    public width = 'auto';

    @Input()
    @HostBinding('style.height')
    public height = 'auto';
}

/**
 * IgxCardHeader is container for the card header
 */
@Component({
    selector: 'igx-card-header',
    templateUrl: 'card.header.html'
})
export class IgxCardHeaderComponent {
    @HostBinding('class.igx-card-header')
    public cssClass = 'igx-card-header';

    @Input()
    @HostBinding('class.igx-card-header--vertical')
    public vertical = false;

    @HostBinding('attr.role')
    public role = 'header';
}

/**
 * IgxCardThumbnail is container for the card thumbnail section.
 * Use it to wrap anything you want to be used as a thumbnail.
 */
@Directive({
    selector: '[igxCardThumbnail]'
})
export class IgxCardThumbnailDirective { }

/**
 * igxCardHeaderTitle is used to denote the header title in a card.
 * Use it to tag text nodes.
 */
@Directive({
    selector: '[igxCardHeaderTitle]'
})
export class IgxCardHeaderTitleDirective {
    @HostBinding('class.igx-card-header__title')
    public cssClass = 'igx-card__header__title';
}

/**
 * igxCardHeaderSubtitle is used to denote the header subtitle in a card.
 * Use it to tag text nodes.
 */
@Directive({
    selector: '[igxCardHeaderSubtitle]'
})
export class IgxCardHeaderSubtitleDirective {
    @HostBinding('class.igx-card-header__subtitle')
    public cssClass = 'igx-card-header__subtitle';
}
/**
 * IgxCardContent is container for the card content.
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-card-content'
})
export class IgxCardContentDirective {
    @HostBinding('class.igx-card-content')
    public cssClass = 'igx-card-content';
}

enum IgxCardActionsLayout {
    DEFAULT = 'default',
    SPREAD = 'spread',
    REVERSE = 'reverse'
}

/**
 * IgxCardActions is container for the card actions.
 */
@Component({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-card-actions',
    templateUrl: 'card.actions.html'
})
export class IgxCardActionsComponent {
    @HostBinding('class.igx-card-actions')
    @Input()
    public layout: IgxCardActionsLayout | string = 'default';

    @HostBinding('class.igx-card-actions--spread')
    get isSpreadLayout() {
        return this.layout === IgxCardActionsLayout.SPREAD;
    }

    @HostBinding('class.igx-card-actions--reverse')
    get isReverseLayout() {
        return this.layout === IgxCardActionsLayout.REVERSE;
    }
}

/**
 * IgxCardFooter is container for the card footer
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-card-footer'
})
export class IgxCardFooterDirective {
    @HostBinding('attr.role')
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

enum IgxCardType {
    DEFAULT = 'default',
    OUTLINED = 'outlined'
}

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

    @HostBinding('attr.role')
    public role = 'group';

    @HostBinding('class.igx-card')
    @Input()
    public type: IgxCardType | string = IgxCardType.DEFAULT;

    @HostBinding('class.igx-card--outlined')
    get isOutlinedCard() {
        return this.type === IgxCardType.OUTLINED;
    }

    @HostBinding('class.igx-card--vertical')
    @Input()
    public vertical = false;
}

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxCardComponent,
        IgxCardHeaderComponent,
        IgxCardMediaDirective,
        IgxCardContentDirective,
        IgxCardActionsComponent,
        IgxCardFooterDirective,
        IgxCardHeaderTitleDirective,
        IgxCardHeaderSubtitleDirective,
        IgxCardThumbnailDirective,
    ],
    exports: [
        IgxCardComponent,
        IgxCardHeaderComponent,
        IgxCardMediaDirective,
        IgxCardContentDirective,
        IgxCardActionsComponent,
        IgxCardFooterDirective,
        IgxCardHeaderTitleDirective,
        IgxCardHeaderSubtitleDirective,
        IgxCardThumbnailDirective,
    ],
    imports: [CommonModule, IgxButtonModule]
})
export class IgxCardModule { }
