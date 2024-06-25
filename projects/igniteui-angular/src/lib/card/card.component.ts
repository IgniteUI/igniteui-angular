import {
    Component,
    Directive,
    HostBinding,
    Optional,
    Inject,
    Input,
    OnInit,
    OnChanges,
    SimpleChanges
} from '@angular/core';

import { mkenum } from '../core/utils';

let NEXT_ID = 0;

/**
 * IgxCardMedia is container for the card media section.
 * Use it to wrap images and videos.
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-card-media',
    standalone: true
})
export class IgxCardMediaDirective {
    /** @hidden @internal */
    @HostBinding('class.igx-card__media')
    public cssClass = 'igx-card__media';

    /**
     * An @Input property that sets the `width` and `min-width` style property
     * of the media container. If not provided it will be set to `auto`.
     *
     * @example
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
     *
     * @example
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
    templateUrl: 'card-header.component.html',
    standalone: true
})
export class IgxCardHeaderComponent {
    /** @hidden @internal */
    @HostBinding('class.igx-card-header')
    public cssClass = 'igx-card-header';

    /**
     * An @Input property that sets the layout style of the header.
     * By default the header elements(thumbnail and title/subtitle) are aligned horizontally.
     *
     * @example
     * ```html
     * <igx-card-header [vertical]="true"></igx-card-header>
     * ```
     */
    @HostBinding('class.igx-card-header--vertical')
    @Input()
    public vertical = false;
}

/**
 * IgxCardThumbnail is container for the card thumbnail section.
 * Use it to wrap anything you want to be used as a thumbnail.
 */
@Directive({
    selector: '[igxCardThumbnail]',
    standalone: true
})
export class IgxCardThumbnailDirective { }

/**
 * igxCardHeaderTitle is used to denote the header title in a card.
 * Use it to tag text nodes.
 */
@Directive({
    selector: '[igxCardHeaderTitle]',
    standalone: true
})
export class IgxCardHeaderTitleDirective {
    /** @hidden @internal */
    @HostBinding('class.igx-card-header__title')
    public cssClass = 'igx-card__header__title';
}

/**
 * igxCardHeaderSubtitle is used to denote the header subtitle in a card.
 * Use it to tag text nodes.
 */
@Directive({
    selector: '[igxCardHeaderSubtitle]',
    standalone: true
})
export class IgxCardHeaderSubtitleDirective {
    /** @hidden @internal */
    @HostBinding('class.igx-card-header__subtitle')
    public cssClass = 'igx-card-header__subtitle';
}
/**
 * IgxCardContent is container for the card content.
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-card-content',
    standalone: true
})
export class IgxCardContentDirective {
    /** @hidden @internal */
    @HostBinding('class.igx-card-content')
    public cssClass = 'igx-card-content';
}

/**
 * IgxCardFooter is container for the card footer
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-card-footer',
    standalone: true
})
export class IgxCardFooterDirective {
    /**
     * An @Input property that sets the value of the `role` attribute of the card footer.
     * By default the value is set to `footer`.
     *
     * @example
     * ```html
     * <igx-card-footer role="footer"></igx-card-footer>
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'footer';
}

/**
 * Card provides a way to display organized content in appealing way.
 *
 * @igxModule IgxCardModule
 *
 * @igxTheme igx-card-theme, igx-icon-theme, igx-button-theme
 *
 * @igxKeywords card, button, avatar, icon
 *
 * @igxGroup Layouts
 *
 * @remarks
 * The Ignite UI Card serves as a container that allows custom content to be organized in an appealing way. There are
 * five sections in a card that you can use to organize your content. These are header, media, content, actions, and footer.
 *
 * @example
 * ```html
 * <igx-card>
 *   <igx-card-header>
 *     <h3 igxCardHeaderTitle>{{title}}</h3>
 *     <h5 igxCardHeaderSubtitle>{{subtitle}}</h5>
 *   </igx-card-header>
 *   <igx-card-actions>
 *       <button type="button" igxButton igxRipple>Share</button>
 *       <button type="button" igxButton igxRipple>Play Album</button>
 *   </igx-card-actions>
 * </igx-card>
 * ```
 */

export const IgxCardType = mkenum({
    ELEVATED: 'elevated',
    OUTLINED: 'outlined'
});
export type IgxCardType = (typeof IgxCardType)[keyof typeof IgxCardType];

@Component({
    selector: 'igx-card',
    templateUrl: 'card.component.html',
    standalone: true
})
export class IgxCardComponent {
    /**
     * Sets/gets the `id` of the card.
     * If not set, `id` will have value `"igx-card-0"`;
     *
     * @example
     * ```html
     * <igx-card id = "my-first-card"></igx-card>
     * ```
     * ```typescript
     * let cardId =  this.card.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-card-${NEXT_ID++}`;

    /**
     * An @Input property that sets the value of the `role` attribute of the card.
     * By default the value is set to `group`.
     *
     * @example
     * ```html
     * <igx-card role="group"></igx-card>
     * ```
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'group';

    /**
     * An @Input property that sets the value of the `type` attribute of the card.
     * By default the value is set to `elevated`. You can make the card use the
     * outlined style by setting the value to `outlined`.
     *
     * @example
     * ```html
     * <igx-card type="outlined"></igx-card>
     * ```
     */
    @HostBinding('class.igx-card')
    @Input()
    public type: IgxCardType | string = IgxCardType.ELEVATED;

    /**
     * A getter which will return true if the card type is `outlined`.
     */
    @HostBinding('class.igx-card--outlined')
    public get isOutlinedCard() {
        return this.type === IgxCardType.OUTLINED;
    }

    /**
     * An @Input property that sets the value of the `horizontal` attribute of the card.
     * Setting this to `true` will make the different card sections align horizontally,
     * essentially flipping the card to the side.
     *
     * @example
     * ```html
     * <igx-card [horizontal]="true"></igx-card>
     * ```
     */
    @HostBinding('class.igx-card--horizontal')
    @Input()
    public horizontal = false;
}

export const IgxCardActionsLayout = mkenum({
    START: 'start',
    JUSTIFY: 'justify'
});
export type IgxCardActionsLayout = (typeof IgxCardActionsLayout)[keyof typeof IgxCardActionsLayout];

/**
 * IgxCardActions is container for the card actions.
 */
@Component({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-card-actions',
    templateUrl: 'card-actions.component.html',
    standalone: true
})
export class IgxCardActionsComponent implements OnInit, OnChanges {
    /**
     * An @Input property that sets the layout style of the actions.
     * You can justify the elements slotted in the igx-card-action container
     * so that they are positioned equally from one another taking up all the
     * space available along the card actions axis.
     *
     * @example
     * ```html
     * <igx-card-actions layout="justify"></igx-card-actions>
     * ```
     */
    @HostBinding('class.igx-card-actions')
    @Input()
    public layout: IgxCardActionsLayout | string = IgxCardActionsLayout.START;

    /**
     * An @Input property that sets the vertical attribute of the actions.
     * When set to `true` the actions will be layed out vertically.
     */
    @HostBinding('class.igx-card-actions--vertical')
    @Input()
    public vertical = false;

    /**
     * A getter that returns `true` when the layout has been
     * set to `justify`.
     */
    @HostBinding('class.igx-card-actions--justify')
    public get isJustifyLayout() {
        return this.layout === IgxCardActionsLayout.JUSTIFY;
    }

    /**
     * @deprecated in version 15.1.0.
     *
     * An @Input property that reverses the order of the buttons in the actions area.
     *
     * @example
     * ```html
     * <igx-card-actions [reverse]="true"></igx-card-actions>
     * ```
     */
    @HostBinding('class.igx-card-actions--reverse')
    @Input()
    public reverse = false;

    private isVerticalSet = false;

    constructor(@Optional() @Inject(IgxCardComponent) public card: IgxCardComponent) { }

    /**
     * @hidden
     * @internal
     */
    public ngOnChanges(changes: SimpleChanges) {
        for (const prop in changes) {
            if (prop === 'vertical') {
                this.isVerticalSet = true;
            }
        }
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnInit() {
        if (!this.isVerticalSet && this.card.horizontal) {
            this.vertical = true;
        }
    }
}

