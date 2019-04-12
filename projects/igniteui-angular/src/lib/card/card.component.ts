import { CommonModule } from '@angular/common';
import {
    Component,
    Directive,
    HostBinding,
    Optional,
    Inject,
    Input,
    NgModule,
    OnInit,
    OnChanges,
    SimpleChanges
} from '@angular/core';
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
    /**
     * @hidden
     */
    @HostBinding('class.igx-card__media')
    public cssClass = 'igx-card__media';

    /**
     * An @Input property that sets the `width` and `min-width` style property
     * of the media container. If not provided it will be set to `auto`.
     * ```html
     * <igx-card-media width="300px"></igx-card-media>
     * ```
     */
    @HostBinding('style.width')
    @HostBinding('style.min-width')
    @Input()
    public width = 'auto';

    /**
     * An @Input property that sets the `height` style property of the media container.
     * If not provided it will be set to `auto`.
     * ```html
     * <igx-card-media height="50%"></igx-card-media>
     * ```
     */
    @HostBinding('style.height')
    @Input()
    public height = 'auto';

    /**
     * An @Input property that sets the `role` attribute of the media container.
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'img';
}

/**
 * IgxCardHeader is container for the card header
 */
@Component({
    selector: 'igx-card-header',
    templateUrl: 'card-header.component.html'
})
export class IgxCardHeaderComponent {
    /**
     * @hidden
     */
    @HostBinding('class.igx-card-header')
    public cssClass = 'igx-card-header';

    /**
     * An @Input property that sets the layout style of the header.
     * By default the header elements(thumbnail and title/subtitle) are aligned horizontally.
     * ```html
     * <igx-card-header [vertical]="true"></igx-card-header>
     * ```
     */
    @HostBinding('class.igx-card-header--vertical')
    @Input()
    public vertical = false;

    /**
     * An @Input property that sets the value of the `role` attribute of the card header.
     * By default the value is set to `header`.
     * ```html
     * <igx-card-header role="header"></igx-card-header>
     * ```
     */
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
    /**
     * @hidden
     */
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
    /**
     * @hidden
     */
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
    /**
     * @hidden
     */
    @HostBinding('class.igx-card-content')
    public cssClass = 'igx-card-content';
}

/**
 * IgxCardFooter is container for the card footer
 */
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-card-footer'
})
export class IgxCardFooterDirective {
    /**
     * An @Input property that sets the value of the `role` attribute of the card footer.
     * By default the value is set to `footer`.
     * ```html
     * <igx-card-footer role="footer"></igx-card-footer>
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'footer';
}

/**
 * **Ignite UI for Angular Card** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/card.html)
 *
 * The Ignite UI Card serves as a container that allows custom content to be organized in an appealing way. There are
 * five sections in a card that you can use to organize your content. These are header, media, content, actions, and footer.
 *
 * Example:
 * ```html
 * <igx-card>
 *   <igx-card-header>
 *     <h3 igxCardHeaderTitle>{{title}}</h3>
 *     <h5 igxCardHeaderSubtitle>{{subtitle}}</h5>
 *   </igx-card-header>
 *   <igx-card-actions>
 *       <button igxButton igxRipple>Share</button>
 *       <button igxButton igxRipple>Play Album</button>
 *   </igx-card-actions>
 * </igx-card>
 * ```
 */

export enum IgxCardType {
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

    /**
     * An @Input property that sets the value of the `role` attribute of the card.
     * By default the value is set to `group`.
     * ```html
     * <igx-card role="group"></igx-card>
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'group';

    /**
     * An @Input property that sets the value of the `type` attribute of the card.
     * By default the value is set to `default`. You can make the card use the
     * outlined style by setting the value to `outlined`.
     * ```html
     * <igx-card type="outlined"></igx-card>
     * ```
     */
    @HostBinding('class.igx-card')
    @Input()
    public type: IgxCardType | string = IgxCardType.DEFAULT;

    /**
     * A getter which will return true if the card type is `outlined`.
     */
    @HostBinding('class.igx-card--outlined')
    get isOutlinedCard() {
        return this.type === IgxCardType.OUTLINED;
    }

    /**
     * An @Input property that sets the value of the `horizontal` attribute of the card.
     * Setting this to `true` will make the different card sections align horizontally,
     * essentially flipping the card to the side.
     * ```html
     * <igx-card [horizontal]="true"></igx-card>
     * ```
     */
    @HostBinding('class.igx-card--horizontal')
    @Input()
    public horizontal = false;
}

export enum IgxCardActionsLayout {
    DEFAULT = 'default',
    JUSTIFY = 'justify',
}

/**
 * IgxCardActions is container for the card actions.
 */
@Component({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-card-actions',
    templateUrl: 'card-actions.component.html'
})
export class IgxCardActionsComponent implements OnInit, OnChanges {
    private isVerticalSet = false;

    constructor(@Optional() @Inject(IgxCardComponent) public card: IgxCardComponent) { }

    /**
     * An @Input property that sets the layout style of the actions.
     * By default icons and icon buttons, as well as regular buttons
     * are split into two containers, which are then positioned on both ends
     * of the card-actions area.
     * You can justify the elements in those groups so they are positioned equally
     * from one another taking up all the space available along the card actions axis.
     * ```html
     * <igx-card-actions layout="justify"></igx-card-actions>
     * ```
     */
    @HostBinding('class.igx-card-actions')
    @Input()
    public layout: IgxCardActionsLayout | string = 'default';

    /**
     * An @Input property that sets the vertical attribute of the actions.
     * When set to `true` the actions will be layed out vertically.
     */
    @HostBinding('class.igx-card-actions--vertical')
    @Input()
    public vertical: boolean;

    /**
     * A getter that returns `true` when the layout has been
     * set to `justify`.
     */
    @HostBinding('class.igx-card-actions--justify')
    get isJustifyLayout() {
        return this.layout === IgxCardActionsLayout.JUSTIFY;
    }

    /**
     * An @Input property that sets order of the buttons the actions area.
     * By default all icons/icon buttons are placed at the end of the action
     * area. Any regular buttons(flat, raised) will appear before the icons/icon buttons
     * placed in the actions area.
     * If you want to reverse their positions so that icons appear first, use the `reverse`
     * attribute.
     * ```html
     * <igx-card-actions [reverse]="true"></igx-card-actions>
     * ```
     */
    @HostBinding('class.igx-card-actions--reverse')
    @Input()
    public reverse = false;

    ngOnChanges(changes: SimpleChanges) {
        for (const prop in changes) {
            if (prop === 'vertical') {
                this.isVerticalSet = true;
            }
        }
    }

    ngOnInit() {
        this.vertical = !this.isVerticalSet && this.card.horizontal;
    }
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
