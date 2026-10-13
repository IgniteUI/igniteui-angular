import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
    AfterContentInit,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    IterableChangeRecord,
    IterableDiffer,
    IterableDiffers,
    OnDestroy,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    booleanAttribute,
    inject,
    ChangeDetectionStrategy,
    ViewEncapsulation
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CarouselResourceStringsEN, ICarouselResourceStrings, IgxGestureEvent, isLeftToRight } from 'igniteui-angular/core';
import { first, IBaseEventArgs, IgxTouchManager, last, PlatformUtil } from 'igniteui-angular/core';
import { CarouselAnimationDirection, IgxCarouselComponentBase } from './carousel-base';
import { IgxCarouselIndicatorDirective, IgxCarouselNextButtonDirective, IgxCarouselPrevButtonDirective } from './carousel.directives';
import { IgxSlideComponent } from './slide.component';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxButtonDirective } from 'igniteui-angular/directives';
import { getCurrentResourceStrings, onResourceChangeHandle } from 'igniteui-angular/core';
import { CarouselAnimationType, CarouselIndicatorsOrientation } from './enums';

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Carousel** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/carousel.html)
 *
 * The Ignite UI Carousel is used to browse or navigate through a collection of slides. Slides can contain custom
 * content such as images or cards and be used for things such as on-boarding tutorials or page-based interfaces.
 * It can be used as a separate fullscreen element or inside another component.
 *
 * Example:
 * ```html
 * <igx-carousel>
 *   <igx-slide>
 *     <h3>First Slide Header</h3>
 *     <p>First slide Content</p>
 *   <igx-slide>
 *   <igx-slide>
 *     <h3>Second Slide Header</h3>
 *     <p>Second Slide Content</p>
 * </igx-carousel>
 * ```
 */
@Component({
    selector: 'igx-carousel',
    templateUrl: 'carousel.component.html',
    styleUrl: 'carousel.component.css',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective, IgxIconComponent, NgClass, NgTemplateOutlet]
})
export class IgxCarouselComponent extends IgxCarouselComponentBase implements OnDestroy, AfterContentInit {
    private element = inject(ElementRef);
    private iterableDiffers = inject(IterableDiffers);
    private platformUtil = inject(PlatformUtil);

    /**
     * Sets the `id` of the carousel.
     * If not set, the `id` of the first carousel component will be `"igx-carousel-0"`.
     * ```html
     * <igx-carousel id="my-first-carousel"></igx-carousel>
     * ```
     *
     * @memberof IgxCarouselComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-carousel-${NEXT_ID++}`;
    /**
     * Returns the `role` attribute of the carousel.
     * ```typescript
     * let carouselRole =  this.carousel.role;
     * ```
     *
     * @memberof IgxCarouselComponent
     */
    @HostBinding('attr.role') public role = 'region';

    /** @hidden */
    @HostBinding('attr.aria-roledescription')
    public roleDescription = 'carousel';

    /** @hidden */
    @HostBinding('attr.aria-labelledby')
    public get labelId() {
        return this.showIndicatorsLabel ? `${this.id}-label` : null;
    }

    /** @hidden */
    @HostBinding('class.igx-carousel--vertical')
    public get isVertical(): boolean {
        return this.vertical;
    }

    /**
     * Returns the class of the carousel component.
     * ```typescript
     * let class =  this.carousel.cssClass;
     * ```
     *
     * @memberof IgxCarouselComponent
     */
    @HostBinding('class.igx-carousel')
    public cssClass = 'igx-carousel';

    /**
     * Gets the `touch-action` style of the carousel.
     * ```typescript
     * let touchAction = this.carousel.touchAction;
     * ```
     */
    @HostBinding('style.touch-action')
    public get touchAction() {
        if (!this.gesturesSupport) {
            return 'auto';
        }
        // leave the axis the carousel does not pan on to the browser (page scrolling)
        return this.vertical ? 'pan-x' : 'pan-y';
    }

    /**
     * Sets whether the carousel should `loop` back to the first slide after reaching the last slide.
     * Default value is `true`.
     * ```html
     * <igx-carousel [loop]="false"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Input({ transform: booleanAttribute }) public loop = true;

    /**
     * Sets whether the carousel will `pause` the slide transitions on user interactions.
     * Default value is `true`.
     * ```html
     *  <igx-carousel [pause]="false"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Input({ transform: booleanAttribute }) public pause = true;

    /**
     * Controls whether the carousel should render the left/right `navigation` buttons.
     * Default value is `true`.
     * ```html
     * <igx-carousel [navigation]="false"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Input({ transform: booleanAttribute }) public navigation = true;

    /**
     * Controls whether the carousel should render the indicators.
     * Default value is `true`.
     * ```html
     * <igx-carousel [indicators]="false"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Input({ transform: booleanAttribute }) public indicators = true;


    /**
     * Controls whether the carousel has vertical alignment.
     * Default value is `false`.
     * ```html
     * <igx-carousel [vertical]="true"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Input({ transform: booleanAttribute }) public override vertical = false;

    /**
     * Controls whether the carousel should support gestures.
     * Default value is `true`.
     * ```html
     * <igx-carousel [gesturesSupport]="false"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Input({ transform: booleanAttribute })
    public get gesturesSupport(): boolean {
        return this._gesturesSupport;
    }

    public set gesturesSupport(value: boolean) {
        this._gesturesSupport = value;
        this.updateGestures();
    }

    /**
     * Controls the maximum indexes that can be shown.
     * Default value is `10`.
     * ```html
     * <igx-carousel [maximumIndicatorsCount]="5"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Input() public maximumIndicatorsCount = 10;

    /**
     * Gets/sets the display mode of carousel indicators. It can be `start` or `end`.
     * Default value is `end`.
     * ```html
     * <igx-carousel indicatorsOrientation="start">
     * <igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Input() public indicatorsOrientation: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.end;

    /**
     * Gets/sets the animation type of carousel.
     * Default value is `slide`.
     * ```html
     * <igx-carousel animationType="none">
     * <igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Input() public override animationType: CarouselAnimationType = CarouselAnimationType.slide;

    /**
     * The custom template, if any, that should be used when rendering carousel indicators
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.carousel.indicatorTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-carousel #carousel>
     *      ...
     *      <ng-template igxCarouselIndicator let-slide>
     *         <igx-icon *ngIf="slide.active">brightness_7</igx-icon>
     *         <igx-icon *ngIf="!slide.active">brightness_5</igx-icon>
     *      </ng-template>
     *  </igx-carousel>
     * ```
     */
    @ContentChild(IgxCarouselIndicatorDirective, { read: TemplateRef, static: false })
    public indicatorTemplate: TemplateRef<any> = null!;

    /**
     * The custom template, if any, that should be used when rendering carousel next button
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.carousel.nextButtonTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-carousel #carousel>
     *      ...
     *      <ng-template igxCarouselNextButton let-disabled>
     *          <button type="button" igxButton="fab" igxRipple="white" [disabled]="disabled">
     *              <igx-icon name="add"></igx-icon>
     *          </button>
     *      </ng-template>
     *  </igx-carousel>
     * ```
     */
    @ContentChild(IgxCarouselNextButtonDirective, { read: TemplateRef, static: false })
    public nextButtonTemplate: TemplateRef<any> = null!;

    /**
     * The custom template, if any, that should be used when rendering carousel previous button
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.carousel.prevButtonTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-carousel #carousel>
     *      ...
     *      <ng-template igxCarouselPrevButton let-disabled>
     *          <button type="button" igxButton="fab" igxRipple="white" [disabled]="disabled">
     *              <igx-icon name="remove"></igx-icon>
     *          </button>
     *      </ng-template>
     *  </igx-carousel>
     * ```
     */
    @ContentChild(IgxCarouselPrevButtonDirective, { read: TemplateRef, static: false })
    public prevButtonTemplate: TemplateRef<any> = null!;

    /**
     * The collection of `slides` currently in the carousel.
     * ```typescript
     * let slides: QueryList<IgxSlideComponent> = this.carousel.slides;
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @ContentChildren(IgxSlideComponent)
    public slides!: QueryList<IgxSlideComponent>;

    /**
     * An event that is emitted after a slide transition has happened.
     * Provides references to the carousel and slide components as event arguments.
     * ```html
     * <igx-carousel (slideChanged)="slideChanged($event)"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Output() public slideChanged = new EventEmitter<ISlideEventArgs>();

    /**
     * An event that is emitted after a slide has been added to the carousel.
     * Provides references to the carousel and slide components as event arguments.
     * ```html
     * <igx-carousel (slideAdded)="slideAdded($event)"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Output() public slideAdded = new EventEmitter<ISlideEventArgs>();

    /**
     * An event that is emitted after a slide has been removed from the carousel.
     * Provides references to the carousel and slide components as event arguments.
     * ```html
     * <igx-carousel (slideRemoved)="slideRemoved($event)"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Output() public slideRemoved = new EventEmitter<ISlideEventArgs>();

    /**
     * An event that is emitted after the carousel has been paused.
     * Provides a reference to the carousel as an event argument.
     * ```html
     * <igx-carousel (carouselPaused)="carouselPaused($event)"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Output() public carouselPaused = new EventEmitter<IgxCarouselComponent>();

    /**
     * An event that is emitted after the carousel has resumed transitioning between `slides`.
     * Provides a reference to the carousel as an event argument.
     * ```html
     * <igx-carousel (carouselPlaying)="carouselPlaying($event)"></igx-carousel>
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    @Output() public carouselPlaying = new EventEmitter<IgxCarouselComponent>();

    @ViewChild('defaultIndicator', { read: TemplateRef, static: true })
    private defaultIndicator!: TemplateRef<any>;

    @ViewChild('defaultNextButton', { read: TemplateRef, static: true })
    private defaultNextButton!: TemplateRef<any>;

    @ViewChild('defaultPrevButton', { read: TemplateRef, static: true })
    private defaultPrevButton!: TemplateRef<any>;

    @ViewChildren('indicators', { read: ElementRef })
    private _indicators!: QueryList<ElementRef<HTMLDivElement>>;

    /**
     * @hidden
     * @internal
     */
    public stoppedByInteraction!: boolean;
    protected override currentItem!: IgxSlideComponent;
    protected override previousItem!: IgxSlideComponent;
    private _interval!: number;
    private _gesturesSupport = true;
    private _gestures: IgxTouchManager | null = null;
    private _resourceStrings: ICarouselResourceStrings = null!;
    private _customResourceStrings: ICarouselResourceStrings = null!;
    private _defaultResourceStrings = getCurrentResourceStrings(CarouselResourceStringsEN);
    private lastInterval: ReturnType<typeof setInterval> | null = null;
    private selectionFrame = 0;
    private autoPlayStarted = false;
    private playing = false;
    private destroyed = false;
    private destroy$ = new Subject<void>();
    private differ: IterableDiffer<IgxSlideComponent> = this.iterableDiffers.find([]).create<IgxSlideComponent>();
    private slideSubscriptions = new Map<IgxSlideComponent, Subscription>();
    private incomingSlide: IgxSlideComponent | null = null;
    private panning = false;
    private _hasKeyboardFocusOnIndicators = false;

    /**
     * An accessor that sets the resource strings.
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: ICarouselResourceStrings) {
        this._resourceStrings = value;
        this._customResourceStrings = Object.assign({}, this._defaultResourceStrings, this._resourceStrings);
    }

    /**
     * An accessor that returns the resource strings.
     */
    public get resourceStrings(): ICarouselResourceStrings {
        return this._resourceStrings ? this._customResourceStrings : this._defaultResourceStrings;
    }

    /** @hidden */
    public get getIndicatorTemplate(): TemplateRef<any> {
        return this.indicatorTemplate || this.defaultIndicator;
    }

    /** @hidden */
    public get getNextButtonTemplate(): TemplateRef<any> {
        return this.nextButtonTemplate || this.defaultNextButton;
    }

    /** @hidden */
    public get getPrevButtonTemplate(): TemplateRef<any> {
        return this.prevButtonTemplate || this.defaultPrevButton;
    }

    /** @hidden */
    public get indicatorsClass() {
        return {
            'igx-carousel-indicators': true,
            ['igx-carousel-indicators--focused']: this._hasKeyboardFocusOnIndicators,
            [`igx-carousel-indicators--${this.getIndicatorsClass()}`]: true,
            'igx-carousel-indicators--vertical': this.isVertical
        };
    }

    /** @hidden */
    public get showIndicators(): boolean {
        return this.indicators && this.total <= this.maximumIndicatorsCount && this.total > 0;
    }

    /** @hidden */
    public get showIndicatorsLabel(): boolean {
        return this.indicators && this.total > this.maximumIndicatorsCount;
    }

    /** @hidden */
    public get getCarouselLabel() {
        return `${this.current + 1} ${this.resourceStrings.igx_carousel_of} ${this.total}`;
    }

    /** @hidden */
    public get ariaLive(): 'off' | 'polite' {
        // announce slide changes unless the carousel is rotating automatically
        return this.playing && this.interval > 0 ? 'off' : 'polite';
    }

    /**
     * Returns the total number of `slides` in the carousel.
     * ```typescript
     * let slideCount =  this.carousel.total;
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public get total(): number {
        return this.slides?.length;
    }

    /**
     * The index of the slide being currently shown.
     * ```typescript
     * let currentSlideNumber =  this.carousel.current;
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public get current(): number {
        return !this.currentItem ? 0 : this.currentItem.index;
    }

    /**
     * Returns a boolean indicating if the carousel is playing.
     * ```typescript
     * let isPlaying =  this.carousel.isPlaying;
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public get isPlaying(): boolean {
        return this.playing;
    }

    /**
     * Returns а boolean indicating if the carousel is destroyed.
     * ```typescript
     * let isDestroyed =  this.carousel.isDestroyed;
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public get isDestroyed(): boolean {
        return this.destroyed;
    }
    /**
     * Returns a reference to the carousel element in the DOM.
     * ```typescript
     * let nativeElement =  this.carousel.nativeElement;
     * ```
     *
     * @memberof IgxCarouselComponent
     */
    public get nativeElement(): any {
        return this.element.nativeElement;
    }

    /**
     * Returns the time `interval` in milliseconds before the slide changes.
     * ```typescript
     * let timeInterval = this.carousel.interval;
     * ```
     *
     * @memberof IgxCarouselComponent
     */
    @Input()
    public get interval(): number {
        return this._interval;
    }

    /**
     * Sets the time `interval` in milliseconds before the slide changes.
     * If not set, the carousel will not change `slides` automatically.
     * ```html
     * <igx-carousel [interval]="1000"></igx-carousel>
     * ```
     *
     * @memberof IgxCarouselComponent
     */
    public set interval(value: number) {
        this._interval = +value;
        this.restartInterval();
    }

    constructor() {
        super();
        onResourceChangeHandle(this.destroy$, () => {
            this._defaultResourceStrings = getCurrentResourceStrings(CarouselResourceStringsEN, false);
            this._customResourceStrings = this._resourceStrings ? Object.assign({}, this._defaultResourceStrings, this._resourceStrings) : null!;
        }, this);
    }

    /** @hidden */
    public onTap(event: IgxGestureEvent) {
        // Play/pause only when the tap lands on a slide (or its content),
        // not on the navigation buttons or indicators.
        const slide = (event.target as Element)?.closest?.('.igx-slide');

        if (slide) {
            if (this.isPlaying) {
                this.stopByInteraction();
            } else if (this.stoppedByInteraction) {
                this.play();
            }
        }
    }

    /** @hidden */
    @HostListener('mouseenter')
    public onMouseEnter() {
        this.stopByInteraction();
    }

    /** @hidden */
    @HostListener('mouseleave')
    public onMouseLeave() {
        if (this.stoppedByInteraction) {
            this.play();
        }
    }

    /** @hidden */
    public onPanLeft(event: IgxGestureEvent) {
        if (!this.vertical) {
            this.pan(event);
        }
    }

    /** @hidden */
    public onPanRight(event: IgxGestureEvent) {
        if (!this.vertical) {
            this.pan(event);
        }
    }

    /** @hidden */
    public onPanUp(event: IgxGestureEvent) {
        if (this.vertical) {
            this.pan(event);
        }
    }

    /** @hidden */
    public onPanDown(event: IgxGestureEvent) {
        if (this.vertical) {
            this.pan(event);
        }
    }

    /**
     * @hidden
     */
    public onPanEnd(event: IgxGestureEvent) {
        if (!this.gesturesSupport || !this.currentItem) {
            return;
        }
        event.preventDefault();
        this.panning = false;

        const slideSize = this.getSlideSize();
        const panOffset = (slideSize / 1000);
        const eventDelta = this.vertical ? event.deltaY : event.deltaX;
        const delta = Math.min(Math.abs(eventDelta), slideSize - panOffset);
        const velocity = Math.abs(event.velocity);
        const incomingSlide = this.incomingSlide;
        this.incomingSlide = null;
        this.resetSlideStyles(this.currentItem);

        if (incomingSlide) {
            this.resetSlideStyles(incomingSlide);
            if (slideSize / 2 < delta || velocity > 1) {
                incomingSlide.direction = eventDelta < 0 ? CarouselAnimationDirection.NEXT : CarouselAnimationDirection.PREV;
                incomingSlide.previous = false;

                this.animationPosition = this.animationType === CarouselAnimationType.fade ?
                    delta / slideSize : (slideSize - delta) / slideSize;

                if (velocity > 1) {
                    this.newDuration = this.defaultAnimationDuration / velocity;
                }
                incomingSlide.active = true;
            } else if (this.animationType === CarouselAnimationType.none) {
                incomingSlide.previous = false;
            } else {
                // animate the current slide back in place
                this.currentItem.direction = eventDelta > 0 ? CarouselAnimationDirection.NEXT : CarouselAnimationDirection.PREV;
                this.previousItem = incomingSlide;
                this.animationPosition = this.animationType === CarouselAnimationType.fade ?
                    (slideSize - delta) / slideSize : delta / slideSize;
                this.playAnimations();
            }
        }

        if (this.stoppedByInteraction) {
            this.play();
        }
    }

    /** @hidden */
    public ngAfterContentInit() {
        this.slides.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((change: QueryList<IgxSlideComponent>) => this.initSlides(change));

        this.initSlides(this.slides);
        this.updateGestures();
    }

    /** @hidden */
    public override ngOnDestroy() {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
        this.destroyed = true;
        this.resetInterval();
        if (this.selectionFrame) {
            cancelAnimationFrame(this.selectionFrame);
        }
        this.slideSubscriptions.forEach(subscription => subscription.unsubscribe());
        this.slideSubscriptions.clear();
        this._gestures?.destroy();
        this._gestures = null;
    }

    /** @hidden */
    public handleKeydownPrev(event: KeyboardEvent): void {
        if (this.platformUtil.isActivationKey(event)) {
            event.preventDefault();
            this.prev();
        }
    }

    /** @hidden */
    public handleKeydownNext(event: KeyboardEvent): void {
        if (this.platformUtil.isActivationKey(event)) {
            event.preventDefault();
            this.next();
        }
    }

    /** @hidden */
    public handleKeyUp(event: KeyboardEvent): void {
        if (event.key === this.platformUtil.KEYMAP.TAB) {
            this._hasKeyboardFocusOnIndicators = true;
        }
    }

    /** @hidden */
    public handleFocusOut(event: FocusEvent): void {
        const target = event.relatedTarget as HTMLElement;

        if (!target || !target.classList.contains('igx-carousel-indicators__indicator')) {
            this._hasKeyboardFocusOnIndicators = false;
        }
    }

    /** @hidden */
    public handleClick(): void {
        this._hasKeyboardFocusOnIndicators = false;
    }

    /** @hidden */
    public handleKeydown(event: KeyboardEvent): void {
        const { key } = event;
        const slides = this.slides.toArray();
        const isRTL = !isLeftToRight(this.nativeElement);

        switch (key) {
            case this.platformUtil.KEYMAP.ARROW_LEFT:
                isRTL ? this.next() : this.prev();
                break;
            case this.platformUtil.KEYMAP.ARROW_RIGHT:
                isRTL ? this.prev() : this.next();
                break;
            case this.platformUtil.KEYMAP.HOME:
                event.preventDefault();
                this.select(isRTL ? last(slides) : first(slides));
                break;
            case this.platformUtil.KEYMAP.END:
                event.preventDefault();
                this.select(isRTL ? first(slides) : last(slides));
                break;
        }

        this.indicatorsElements[this.current].nativeElement.focus();
    }

    /**
     * Returns the slide corresponding to the provided `index` or null.
     * ```typescript
     * let slide1 =  this.carousel.get(1);
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public get(index: number): IgxSlideComponent {
        return this.slides.find((slide) => slide.index === index)!;
    }

    /**
     * Adds a new slide to the carousel.
     * ```typescript
     * this.carousel.add(newSlide);
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public add(slide: IgxSlideComponent) {
        const newSlides = this.slides.toArray();
        newSlides.push(slide);
        this.slides.reset(newSlides);
        this.slides.notifyOnChanges();
    }

    /**
     * Removes a slide from the carousel.
     * ```typescript
     * this.carousel.remove(slide);
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public remove(slide: IgxSlideComponent) {
        if (slide && slide === this.get(slide.index)) { // check if the requested slide for delete is present in the carousel
            const newSlides = this.slides.toArray();
            newSlides.splice(slide.index, 1);
            this.slides.reset(newSlides);
            this.slides.notifyOnChanges();
        }
    }

    /**
     * Switches to the passed-in slide with a given `direction`.
     * ```typescript
     * const slide = this.carousel.get(2);
     * this.carousel.select(slide, CarouselAnimationDirection.NEXT);
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public select(slide: IgxSlideComponent, direction?: CarouselAnimationDirection): void;
    /**
     * Switches to slide by index with a given `direction`.
     * ```typescript
     * this.carousel.select(2, CarouselAnimationDirection.NEXT);
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public select(index: number, direction?: CarouselAnimationDirection): void;
    public select(slideOrIndex: IgxSlideComponent | number, direction: CarouselAnimationDirection = CarouselAnimationDirection.NONE): void {
        const slide = typeof slideOrIndex === 'number'
            ? this.get(slideOrIndex)
            : slideOrIndex;

        if (slide && slide !== this.currentItem) {
            slide.direction = direction;
            slide.active = true;
        }
    }

    /**
     * Transitions to the next slide in the carousel.
     * ```typescript
     * this.carousel.next();
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public next() {
        const index = this.getNextIndex();

        if (index === 0 && !this.loop) {
            this.stop();
            return;
        }
        return this.select(this.get(index), CarouselAnimationDirection.NEXT);
    }

    /**
     * Transitions to the previous slide in the carousel.
     * ```typescript
     * this.carousel.prev();
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public prev() {
        const index = this.getPrevIndex();

        if (!this.loop && index === this.total - 1) {
            this.stop();
            return;
        }
        return this.select(this.get(index), CarouselAnimationDirection.PREV);
    }

    /**
     * Resumes playing of the carousel if in paused state.
     * No operation otherwise.
     * ```typescript
     * this.carousel.play();
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public play() {
        if (!this.playing) {
            this.playing = true;
            this.carouselPlaying.emit(this);
            this.restartInterval();
            this.stoppedByInteraction = false;
        }
    }

    /**
     * Stops slide transitions if the carousel is playing and the `pause` option is set to `true`.
     * No operation otherwise.
     * ```typescript
     * this.carousel.stop();
     * ```
     *
     * @memberOf IgxCarouselComponent
     */
    public stop() {
        if (this.pause && this.playing) {
            this.playing = false;
            this.carouselPaused.emit(this);
            this.resetInterval();
        }
    }

    protected getPreviousElement(): HTMLElement {
        return this.previousItem.nativeElement;
    }

    protected getCurrentElement(): HTMLElement {
        return this.currentItem.nativeElement;
    }

    /** Registers the touch gestures while `gesturesSupport` is enabled and removes them otherwise. */
    private updateGestures() {
        if (this.gesturesSupport && this.platformUtil.isBrowser) {
            this._gestures ??= new IgxTouchManager(this.element.nativeElement, {
                tap: (event) => this.onTap(event),
                panMove: (event) => this.onPan(event),
                panEnd: (event) => this.onPanEnd(event),
                panCancel: () => this.onPanCancel()
            }, { tapThreshold: 5 });
        } else {
            // restore the slides of a pan that will no longer receive its end
            this.onPanCancel();
            this._gestures?.destroy();
            this._gestures = null;
        }
    }

    /**
     * Routes a pan gesture to the orientation-specific handler so that only
     * gestures matching the carousel's axis affect the active slide.
     *
     * @hidden
     */
    private onPan(event: IgxGestureEvent) {
        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
            if (event.deltaX < 0) {
                this.onPanLeft(event);
            } else {
                this.onPanRight(event);
            }
        } else {
            if (event.deltaY < 0) {
                this.onPanUp(event);
            } else {
                this.onPanDown(event);
            }
        }
    }

    /** Restores the slides when an ongoing pan is cancelled. */
    private onPanCancel() {
        if (!this.panning) {
            return;
        }
        this.panning = false;
        this.discardIncomingSlide();
        if (this.stoppedByInteraction) {
            this.play();
        }
    }

    /** Moves the current slide back in place and hides the slide revealed by the pan. */
    private discardIncomingSlide() {
        if (this.currentItem) {
            this.resetSlideStyles(this.currentItem);
        }
        if (this.incomingSlide) {
            this.resetSlideStyles(this.incomingSlide);
            this.incomingSlide.previous = false;
            this.incomingSlide = null;
        }
    }

    private stopByInteraction() {
        if (this.pause && this.isPlaying) {
            this.stoppedByInteraction = true;
            this.stop();
        }
    }

    private resetInterval() {
        if (this.lastInterval) {
            clearInterval(this.lastInterval);
            this.lastInterval = null;
        }
    }

    private restartInterval() {
        this.resetInterval();

        if (this.playing && this.interval > 0 && this.platformUtil.isBrowser) {
            this.lastInterval = setInterval(() => {
                if (this.total) {
                    this.next();
                }
            }, this.interval);
        }
    }

    /** @hidden */
    public get nextButtonDisabled() {
        return !this.loop && this.current === (this.total - 1);
    }

    /** @hidden */
    public get prevButtonDisabled() {
        return !this.loop && this.current === 0;
    }

    private get indicatorsElements() {
        return this._indicators.toArray();
    }

    private getIndicatorsClass(): string {
        switch (this.indicatorsOrientation) {
            case CarouselIndicatorsOrientation.top:
                return CarouselIndicatorsOrientation.start;
            case CarouselIndicatorsOrientation.bottom:
                return CarouselIndicatorsOrientation.end;
            default:
                return this.indicatorsOrientation;
        }
    }

    private getNextIndex(): number {
        return (this.current + 1) % this.total;
    }

    private getPrevIndex(): number {
        return this.current - 1 < 0 ? this.total - 1 : this.current - 1;
    }

    private getSlideSize(): number {
        const element = this.currentItem.nativeElement;
        return this.vertical ? element.offsetHeight : element.offsetWidth;
    }

    private resetSlideStyles(slide: IgxSlideComponent) {
        slide.nativeElement.style.transform = '';
        slide.nativeElement.style.opacity = '';
    }

    private pan(event: IgxGestureEvent) {
        if (!this.gesturesSupport || !this.currentItem) {
            return;
        }
        this.panning = true;

        const slideSize = this.getSlideSize();
        const panOffset = (slideSize / 1000);
        const delta = this.vertical ? event.deltaY : event.deltaX;
        const index = delta < 0 ? this.getNextIndex() : this.getPrevIndex();
        const offset = delta < 0 ? slideSize + delta : -slideSize + delta;

        if (Math.abs(delta) + panOffset >= slideSize) {
            return;
        }

        if (!this.loop && ((this.current === 0 && delta > 0) || (this.current === this.total - 1 && delta < 0))) {
            this.discardIncomingSlide();
            return;
        }

        event.preventDefault();
        this.stopByInteraction();

        if (this.previousItem?.previous) {
            this.previousItem.previous = false;
        }
        this.finishAnimations();

        if (this.incomingSlide && index !== this.incomingSlide.index) {
            this.resetSlideStyles(this.incomingSlide);
            this.incomingSlide.previous = false;
        }
        this.incomingSlide = this.get(index);
        this.incomingSlide.previous = true;

        if (this.animationType === CarouselAnimationType.fade) {
            this.currentItem.nativeElement.style.opacity = `${Math.abs(offset) / slideSize}`;
        } else {
            this.currentItem.nativeElement.style.transform = this.vertical
                ? `translateY(${delta}px)`
                : `translateX(${delta}px)`;
            this.incomingSlide.nativeElement.style.transform = this.vertical
                ? `translateY(${offset}px)`
                : `translateX(${offset}px)`;
        }
    }

    private onSlideActivated(slide: IgxSlideComponent) {
        if (slide.active && slide !== this.currentItem) {
            if (slide.direction === CarouselAnimationDirection.NONE) {
                slide.direction = slide.index > this.current ? CarouselAnimationDirection.NEXT : CarouselAnimationDirection.PREV;
            }

            if (this.currentItem) {
                if (this.previousItem?.previous) {
                    this.previousItem.previous = false;
                }
                // reset the outgoing slide direction, so it is resolved again when the slide is activated directly
                this.currentItem.direction = CarouselAnimationDirection.NONE;
                this.currentItem.active = false;

                this.previousItem = this.currentItem;
                this.currentItem = slide;
                this.triggerAnimations();
            } else {
                this.currentItem = slide;
            }
            this.slideChanged.emit({ carousel: this, slide });
            this.restartInterval();
            this.cdr.markForCheck();
        }
    }

    private finishAnimations() {
        if (this.animationStarted(this.leaveAnimationPlayer!)) {
            this.leaveAnimationPlayer!.finish();
        }

        if (this.animationStarted(this.enterAnimationPlayer!)) {
            this.enterAnimationPlayer!.finish();
        }
    }

    private initSlides(change: QueryList<IgxSlideComponent>) {
        const diff = this.differ.diff(change.toArray());
        if (diff) {
            this.slides.forEach((slide, index) => {
                slide.index = index;
                slide.total = this.total;
            });

            diff.forEachAddedItem((record: IterableChangeRecord<IgxSlideComponent>) => {
                const slide = record.item;
                this.slideAdded.emit({ carousel: this, slide });
                if (slide.active) {
                    this.currentItem = slide;
                }
                this.slideSubscriptions.set(slide, slide.activeChange.subscribe(() => this.onSlideActivated(slide)));
            });

            diff.forEachRemovedItem((record: IterableChangeRecord<IgxSlideComponent>) => {
                const slide = record.item;
                this.slideSubscriptions.get(slide)?.unsubscribe();
                this.slideSubscriptions.delete(slide);
                this.slideRemoved.emit({ carousel: this, slide });
                if (slide.active) {
                    slide.active = false;
                    if (this.currentItem === slide) { // Only fall back if nothing better was found.
                        this.currentItem = this.get(Math.min(slide.index, this.total - 1));
                    }
                }
            });

            this.updateSlidesSelection();
        }
    }

    private updateSlidesSelection() {
        if (!this.platformUtil.isBrowser) {
            return;
        }

        cancelAnimationFrame(this.selectionFrame);
        this.selectionFrame = requestAnimationFrame(() => {
            this.selectionFrame = 0;
            if (this.currentItem) {
                this.currentItem.active = true;
                this.slides
                    .filter(slide => slide.active && slide !== this.currentItem)
                    .forEach(slide => slide.active = false);
            } else if (this.total) {
                this.slides.first.active = true;
            }

            // start auto-playing once, so slide changes do not resume a carousel that was stopped
            if (!this.autoPlayStarted) {
                this.autoPlayStarted = true;
                this.play();
            }
            this.cdr.markForCheck();
        });
    }
}

export interface ISlideEventArgs extends IBaseEventArgs {
    carousel: IgxCarouselComponent;
    slide: IgxSlideComponent;
}
