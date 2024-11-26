import {
    Component,
    Directive,
    HostBinding,
    Optional,
    Inject,
    Input,
    OnInit,
    OnChanges,
    SimpleChanges,
    booleanAttribute
} from '@angular/core';

import { mkenum } from '../core/utils';

let NEXT_ID = 0;

/**
 * IgxCardMedia is container for the card media section.
 * Use it to wrap images and videos.
 */
@Directive({
    selector: 'igx-card-media',
    standalone: true
})
export class IgxCardMediaDirective {
    /** @hidden @internal */
    @HostBinding('class.igx-card__media')
    public cssClass = 'igx-card__media';

    /**
     * Sets the `width` and `min-width` style property
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
     * Sets the `height` style property of the media container.
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
     * Sets the `role` attribute of the media container.
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
     * Sets the layout style of the header.
     * By default the header elements(thumbnail and title/subtitle) are aligned horizontally.
     *
     * @example
     * ```html
     * <igx-card-header [vertical]="true"></igx-card-header>
     * ```
     */
    @HostBinding('class.igx-card-header--vertical')
    @Input({ transform: booleanAttribute })
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

    selector: 'igx-card-footer',
    standalone: true
})
export class IgxCardFooterDirective {
    /**
     * Sets the value of the `role` attribute of the card footer.
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
     * <igx-card id="my-first-card"></igx-card>
     * ```
     * ```typescript
     * let cardId =  this.card.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-card-${NEXT_ID++}`;

    /**
     * Sets the `igx-card` css class to the card component.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-card')
    public cssClass = 'igx-card';

    /**
     * Sets the value of the `role` attribute of the card.
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
     * Sets/gets whether the card is elevated.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-card elevated></igx-card>
     * ```
     * ```typescript
     * let cardElevation = this.card.elevated;
     * ```
     */
    @Input({transform: booleanAttribute})
    @HostBinding('class.igx-card--elevated')
    public elevated = false;

    /**
     * Sets the value of the `horizontal` attribute of the card.
     * Setting this to `true` will make the different card sections align horizontally,
     * essentially flipping the card to the side.
     *
     * @example
     * ```html
     * <igx-card [horizontal]="true"></igx-card>
     * ```
     */
    @HostBinding('class.igx-card--horizontal')
    @Input({ transform: booleanAttribute })
    public horizontal = false;
}

export const IgxCardActionsLayout = /*@__PURE__*/mkenum({
    START: 'start',
    JUSTIFY: 'justify'
});
export type IgxCardActionsLayout = (typeof IgxCardActionsLayout)[keyof typeof IgxCardActionsLayout];

/**
 * IgxCardActions is container for the card actions.
 */
@Component({

    selector: 'igx-card-actions',
    templateUrl: 'card-actions.component.html',
    standalone: true
})
export class IgxCardActionsComponent implements OnInit, OnChanges {
    /**
     * Sets the layout style of the actions.
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
     * Sets the vertical attribute of the actions.
     * When set to `true` the actions will be layed out vertically.
     */
    @HostBinding('class.igx-card-actions--vertical')
    @Input({ transform: booleanAttribute })
    public vertical = false;

    /**
     * A getter that returns `true` when the layout has been
     * set to `justify`.
     */
    @HostBinding('class.igx-card-actions--justify')
    public get isJustifyLayout() {
        return this.layout === IgxCardActionsLayout.JUSTIFY;
    }

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
