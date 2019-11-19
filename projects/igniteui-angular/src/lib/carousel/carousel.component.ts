import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    Output,
    ContentChildren,
    QueryList,
    IterableDiffer,
    IterableDiffers,
    AfterContentInit,
    IterableChangeRecord,
    TemplateRef,
    ViewChild,
    ContentChild,
    Injectable
} from '@angular/core';
import { IgxIconModule } from '../icon/index';
import { IBaseEventArgs } from '../core/utils';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxCarouselIndicatorDirective } from './carousel.directives';
import { useAnimation, AnimationBuilder, AnimationPlayer, AnimationReferenceMetadata } from '@angular/animations';
import { slideInLeft, fadeIn, rotateInCenter } from '../animations/main';
import { IgxSlideComponent, Direction } from './slide.component';
import { ICarouselResourceStrings } from '../core/i18n/carousel-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

let NEXT_ID = 0;

export enum CarouselIndicatorsOrientation {
    bottom = 'bottom',
    top = 'top'
}

export enum CarouselAnimationType {
    none = 'none',
    slide = 'slide',
    fade = 'fade',
    grow = 'grow'
}

export interface CarouselAnimationSettings {
    enterAnimation: AnimationReferenceMetadata;
    leaveAnimation: AnimationReferenceMetadata;
}

@Injectable()
export class CarouselHammerConfig extends HammerGestureConfig {
    public overrides = {
        pan: { direction: Hammer.DIRECTION_HORIZONTAL }
    };
}
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
    providers: [
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: CarouselHammerConfig
        }
    ],
    selector: 'igx-carousel',
    templateUrl: 'carousel.component.html',
    styles: [`
    :host {
        display: block;
        outline-style: none;
    }`]
})

export class IgxCarouselComponent implements OnDestroy, AfterContentInit {
    /**
     * Returns the `role` attribute of the carousel.
     * ```typescript
     * let carouselRole =  this.carousel.role;
     * ```
     * @memberof IgxCarouselComponent
     */
    @HostBinding('attr.role') public role = 'region';

    /**
     * Sets the `id` of the carousel.
     * If not set, the `id` of the first carousel component will be `"igx-carousel-0"`.
     * ```html
     * <igx-carousel id="my-first-carousel"></igx-carousel>
     * ```
     * @memberof IgxCarouselComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-carousel-${NEXT_ID++}`;

    /**
     * Returns the `aria-label` of the carousel.
     *
     * ```typescript
     * let carousel = this.carousel.ariaLabel;
     * ```
     *
     */
    @HostBinding('attr.aria-label')
    public ariaLabel = 'carousel';

    /**
     * Returns the `tabIndex` of the carousel component.
     * ```typescript
     * let tabIndex =  this.carousel.tabIndex;
     * ```
     * @memberof IgxCarouselComponent
     */
    @HostBinding('attr.tabindex')
    get tabIndex() {
        return 0;
    }

    /**
     * Returns the class of the carousel component.
     * ```typescript
     * let class =  this.carousel.cssClass;
     * ```
     * @memberof IgxCarouselComponent
     */
    @HostBinding('class.igx-carousel')
    public cssClass = 'igx-carousel';

    /**
     * Sets whether the carousel should `loop` back to the first slide after reaching the last slide.
     * Default value is `true`.
     * ```html
     * <igx-carousel [loop]="false"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Input() public loop = true;

    /**
     * Sets whether the carousel will `pause` the slide transitions on user interactions.
     * Default value is `true`.
     * ```html
     *  <igx-carousel [pause]="false"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Input() public pause = true;

    /**
     * Returns the time `interval` in milliseconds before the slide changes.
     * ```typescript
     * let timeInterval = this.carousel.interval;
     * ```
     * @memberof IgxCarouselComponent
     */
    @Input()
    get interval(): number {
        return this._interval;
    }

    /**
     * Sets the time `interval` in milliseconds before the slide changes.
     * If not set, the carousel will not change `slides` automatically.
     * ```html
     * <igx-carousel [interval] = "1000"></igx-carousel>
     * ```
     * @memberof IgxCarouselComponent
     */
    set interval(value: number) {
        this._interval = +value;
        this.restartInterval();
    }

    /**
     * Controls whether the carousel should render the left/right `navigation` buttons.
     * Default value is `true`.
     * ```html
     * <igx-carousel [navigation] = "false"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Input() public navigation = true;

    /**
    * Controls whether the carousel should support keyboard navigation.
    * Default value is `true`.
    * ```html
    * <igx-carousel [keyboardSupport] = "false"></igx-carousel>
    * ```
    * @memberOf IgxCarouselComponent
    */
    @Input() public keyboardSupport = true;

      /**
    * Controls whether the carousel should support gestures.
    * Default value is `true`.
    * ```html
    * <igx-carousel [gesturesSupport] = "false"></igx-carousel>
    * ```
    * @memberOf IgxCarouselComponent
    */
    @Input() public gesturesSupport = true;

    /**
     * Controls the maximum indexes that can be shown.
     * Default value is `5`.
     * ```html
     * <igx-carousel [maximumIndicatorsCount] = "10"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Input() public maximumIndicatorsCount = 5;

    /**
    * Gets/sets the display mode of carousel indicators. It can be top or bottom.
    * Default value is `bottom`.
    * ```html
    * <igx-carousel indicatorsOrientation=CarouselIndicatorsOrientation.top>
    * <igx-carousel>
    * ```
    * @memberOf IgxSlideComponent
    */
    @Input() public indicatorsOrientation: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.bottom;

    /**
   * Gets/sets the animation type of carousel.
   * Default value is `slide`.
   * ```html
   * <igx-carousel animationType=CarouselAnimationType.slide>
   * <igx-carousel>
   * ```
   * @memberOf IgxSlideComponent
   */
    @Input() public animationType = CarouselAnimationType.slide;

    /**
    * An accessor that sets the resource strings.
    * By default it uses EN resources.
    */
    @Input()
    set resourceStrings(value: ICarouselResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    /**
     * An accessor that returns the resource strings.
    */
    get resourceStrings(): ICarouselResourceStrings {
        return this._resourceStrings;
    }

    @ViewChild('defaultIndicator', { read: TemplateRef, static: true })
    protected defaultIndicator: TemplateRef<any>;

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
     *         <igx-icon *ngIf="slide.active"  fontSet="material">brightness_7</igx-icon>
     *         <igx-icon *ngIf="!slide.active"  fontSet="material">brightness_5</igx-icon>
     *      </ng-template>
     *  </igx-carousel>
     * ```
     */
    @ContentChild(IgxCarouselIndicatorDirective, { read: TemplateRef, static: false })
    public indicatorTemplate: TemplateRef<any> = null;

    /**
    * The collection of `slides` currently in the carousel.
    * ```typescript
    * let slides: QueryList<IgxSlideComponent> = this.carousel.slides;
    * ```
    * @memberOf IgxCarouselComponent
    */
    @ContentChildren(IgxSlideComponent)
    public slides: QueryList<IgxSlideComponent>;

    /**
     * An event that is emitted after a slide transition has happened.
     * Provides references to the `IgxCarouselComponent` and `IgxSlideComponent` as event arguments.
     * ```html
     * <igx-carousel (onSlideChanged)="onSlideChanged($event)"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Output() public onSlideChanged = new EventEmitter<ISlideEventArgs>();

    /**
     * An event that is emitted after a slide has been added to the carousel.
     * Provides references to the `IgxCarouselComponent` and `IgxSlideComponent` as event arguments.
     * ```html
     * <igx-carousel (onSlideAdded)="onSlideAdded($event)"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Output() public onSlideAdded = new EventEmitter<ISlideEventArgs>();

    /**
     * An event that is emitted after a slide has been removed from the carousel.
     * Provides references to the `IgxCarouselComponent` and `IgxSlideComponent` as event arguments.
     * ```html
     * <igx-carousel (onSlideRemoved)="onSlideRemoved($event)"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Output() public onSlideRemoved = new EventEmitter<ISlideEventArgs>();

    /**
     * An event that is emitted after the carousel has been paused.
     * Provides a reference to the `IgxCarouselComponent` as an event argument.
     * ```html
     * <igx-carousel (onCarouselPaused)="onCarouselPaused($event)"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Output() public onCarouselPaused = new EventEmitter<IgxCarouselComponent>();

    /**
     * An event that is emitted after the carousel has resumed transitioning between `slides`.
     * Provides a reference to the `IgxCarouselComponent` as an event argument.
     * ```html
     * <igx-carousel (onCarouselPlaying)="onCarouselPlaying($event)"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Output() public onCarouselPlaying = new EventEmitter<IgxCarouselComponent>();

    private _interval: number;
    private _resourceStrings = CurrentResourceStrings.CarouselResStrings;
    private lastInterval: any;
    private playing: boolean;
    private stoppedByInteraction: boolean;
    private destroyed: boolean;
    private destroy$ = new Subject<any>();
    private differ: IterableDiffer<IgxSlideComponent> | null = null;
    private enterAnimationPlayer?: AnimationPlayer;
    private leaveAnimationPlayer?: AnimationPlayer;
    private currentSlide: IgxSlideComponent;
    private previousSlide: IgxSlideComponent;
    private animationDuration = 320;
    private incomingSlide: IgxSlideComponent;
    private animationPosition = 0;
    private newDuration = 0;

    constructor(private element: ElementRef, private iterableDiffers: IterableDiffers, private builder: AnimationBuilder) {
        this.differ = this.iterableDiffers.find([]).create(null);
    }

    /**
    * @hidden
    */
    public ngAfterContentInit() {
        this.slides.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((change: QueryList<IgxSlideComponent>) => { this.initSlides(change); });

        this.initSlides(this.slides);
    }

    /**
    *@hidden
    */
    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.destroyed = true;
        if (this.lastInterval) {
            clearInterval(this.lastInterval);
        }
    }

    private unsubscriber(slide: IgxSlideComponent) {
        return merge(this.destroy$, slide.isDestroyed);
    }

    private onSlideActivated(slide: IgxSlideComponent) {
        if (slide.active && slide !== this.currentSlide) {
            if (slide.direction === Direction.NONE) {
                const newIndex = slide.index;
                slide.direction = newIndex > this.current ? Direction.NEXT : Direction.PREV;
            }

            if (this.currentSlide) {
                const animationWasStarted = this.finishAnimations();
                this.currentSlide.direction = slide.direction;
                this.currentSlide.active = false;

                this.previousSlide = this.currentSlide;
                this.currentSlide = slide;
                if (this.animationType !== CarouselAnimationType.none) {
                    if (animationWasStarted) {
                        requestAnimationFrame(() => {
                            this.playLeaveAnimation();
                            this.playEnterAnimation();
                        });
                    } else {
                        this.playLeaveAnimation();
                        this.playEnterAnimation();
                    }
                }
            } else {
                this.currentSlide = slide;
            }
            this.onSlideChanged.emit({ carousel: this, slide });
            this.restartInterval();
        }
    }

    private finishAnimations(): boolean {
        let animationWasStarted = false;
        if (this.previousSlide && this.previousSlide.previous) {
            this.previousSlide.previous = false;
        }
        if (this.leaveAnimationPlayer) {
            animationWasStarted = true;
            this.leaveAnimationPlayer.finish();
        }
        if (this.enterAnimationPlayer) {
            animationWasStarted = true;
            this.enterAnimationPlayer.finish();
        }
        return animationWasStarted;
    }

    private getAnimation(): CarouselAnimationSettings {
        let duration;
        if (this.newDuration) {
            duration = this.animationPosition ? this.animationPosition * this.newDuration : this.newDuration;
        } else {
            duration = this.animationPosition ? this.animationPosition * this.animationDuration : this.animationDuration;
        }

        switch (this.animationType) {
            case CarouselAnimationType.slide:
                const trans = this.animationPosition ? this.animationPosition * 100 : 100;
                return {
                    enterAnimation: useAnimation(slideInLeft,
                        {
                            params: {
                                delay: '0s',
                                duration: `${duration}ms`,
                                endOpacity: 1,
                                startOpacity: 1,
                                fromPosition: `translateX(${this.currentSlide.direction === 1 ? trans : -trans}%)`,
                                toPosition: 'translateX(0%)'
                            }
                        }),
                    leaveAnimation: useAnimation(slideInLeft,
                        {
                            params: {
                                delay: '0s',
                                duration: `${duration}ms`,
                                endOpacity: 1,
                                startOpacity: 1,
                                fromPosition: `translateX(0%)`,
                                toPosition: `translateX(${this.currentSlide.direction === 1 ? -trans : trans}%)`,
                            }
                        })
                };
            case CarouselAnimationType.fade:
                return {
                    enterAnimation: useAnimation(fadeIn,
                        { params: { duration: `${duration}ms`, startOpacity: `${this.animationPosition}` } }),
                    leaveAnimation: null
                };
        }
        return {
            enterAnimation: null,
            leaveAnimation: null
        };
    }

    private playEnterAnimation() {
        const animationBuilder = this.builder.build(this.getAnimation().enterAnimation);

        this.enterAnimationPlayer = animationBuilder.create(this.currentSlide.nativeElement);

        this.enterAnimationPlayer.onDone(() => {
            if (this.enterAnimationPlayer) {
                this.enterAnimationPlayer.reset();
                this.enterAnimationPlayer = null;
            }
            this.animationPosition = 0;
            this.newDuration = 0;
            this.previousSlide.previous = false;
        });
        this.previousSlide.previous = true;
        this.enterAnimationPlayer.play();
    }

    private playLeaveAnimation() {
        if (this.getAnimation().leaveAnimation) {
            const animationBuilder = this.builder.build(this.getAnimation().leaveAnimation);
            this.leaveAnimationPlayer = animationBuilder.create(this.previousSlide.nativeElement);

            this.leaveAnimationPlayer.onDone(() => {
                if (this.leaveAnimationPlayer) {
                    this.leaveAnimationPlayer.reset();
                    this.leaveAnimationPlayer = null;
                }
                this.animationPosition = 0;
                this.newDuration = 0;
            });
            this.leaveAnimationPlayer.play();
        }
    }

    private initSlides(change: QueryList<IgxSlideComponent>) {
        const diff = this.differ.diff(change.toArray());
        if (diff) {
            this.slides.reduce((any, c, ind) => c.index = ind, 0); // reset slides indexes
            diff.forEachAddedItem((record: IterableChangeRecord<IgxSlideComponent>) => {
                const slide = record.item;
                this.onSlideAdded.emit({ carousel: this, slide });
                if (slide.active) {
                    this.currentSlide = slide;
                }
                slide.activeChange.pipe(takeUntil(this.unsubscriber(slide))).subscribe(() => this.onSlideActivated(slide));
            });

            diff.forEachRemovedItem((record: IterableChangeRecord<IgxSlideComponent>) => {
                const slide = record.item;
                this.onSlideRemoved.emit({ carousel: this, slide });
                if (slide.active) {
                    slide.active = false;
                    this.currentSlide = this.get(slide.index < this.total ? slide.index : this.total - 1);
                }
            });

            this.updateSlidesSelection();
        }
    }

    private updateSlidesSelection() {
        requestAnimationFrame(() => {
            if (this.currentSlide) {
                this.currentSlide.active = true;
                const activeSlides = this.slides.filter(slide => slide.active && slide.index !== this.currentSlide.index);
                activeSlides.forEach(slide => { slide.active = false; });
            } else if (this.total) {
                this.slides.first.active = true;
            }
            this.play();
        });
    }

    /**
     * @hidden
     */
    public get getIndicatorTemplate(): TemplateRef<any> {
        if (this.indicatorTemplate) {
            return this.indicatorTemplate;
        }
        return this.defaultIndicator;
    }

    /**
     * @hidden
     * @memberof IgxCarouselComponent
     */
    public setAriaLabel(slide) {
        return `Item ${slide.index + 1} of ${this.total}`;
    }

    /**
    * @hidden
    * @memberof IgxCarouselComponent
    */
    public get indicatorsOrientationClass() {
        return `igx-carousel-indicators--${this.indicatorsOrientation}`;
    }

    /**
    * @hidden
    * @memberof IgxCarouselComponent
    */
    public get showIndicators(): boolean {
        return this.total <= this.maximumIndicatorsCount && this.total > 0;
    }

    /**
    * @hidden
    * @memberof IgxCarouselComponent
    */
    public get showIndicatorsLabel(): boolean {
        return this.total > this.maximumIndicatorsCount;
    }

    /**
    * @hidden
    * @memberof IgxCarouselComponent
    */
    public get getCarouselLabel() {
        return `${this.current + 1} ${this.resourceStrings.igx_carousel_of} ${this.total}`;
    }

    /**
     * Returns the total number of `slides` in the carousel.
     * ```typescript
     * let slideCount =  this.carousel.total;
     * ```
     * @memberOf IgxCarouselComponent
     */
    public get total(): number {
        return this.slides.length;
    }

    /**
     * The index of the slide being currently shown.
     * ```typescript
     * let currentSlideNumber =  this.carousel.current;
     * ```
     * @memberOf IgxCarouselComponent
     */
    public get current(): number {
        return !this.currentSlide ? 0 : this.currentSlide.index;
    }

    /**
     * Returns a boolean indicating if the carousel is playing.
     * ```typescript
     * let isPlaying =  this.carousel.isPlaying;
     * ```
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
     * @memberof IgxCarouselComponent
     */
    get nativeElement(): any {
        return this.element.nativeElement;
    }

    /**
     * Returns the slide corresponding to the provided `index` or null.
     * ```typescript
     * let slide1 =  this.carousel.get(1);
     * ```
     * @memberOf IgxCarouselComponent
     */
    public get(index: number): IgxSlideComponent {
        return this.slides.find((slide) => slide.index === index);
    }

    /**
     * Adds a new slide to the carousel.
     * ```typescript
     * this.carousel.add(newSlide);
     * ```
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
     * Kicks in a transition for a given slide with a given `direction`.
     * ```typescript
     * this.carousel.select(this.carousel.get(2), Direction.NEXT);
     * ```
     * @memberOf IgxCarouselComponent
     */
    public select(slide: IgxSlideComponent, direction: Direction = Direction.NONE) {
        if (slide && slide !== this.currentSlide) {
            slide.direction = direction;
            slide.active = true;
        }
    }

    /**
     * Transitions to the next slide in the carousel.
     * ```typescript
     * this.carousel.next();
     * ```
     * @memberOf IgxCarouselComponent
     */
    public next() {
        const index = (this.current + 1) % this.total;

        if (index === 0 && !this.loop) {
            this.stop();
            return;
        }
        return this.select(this.get(index), Direction.NEXT);
    }

    /**
     * Transitions to the previous slide in the carousel.
     * ```typescript
     * this.carousel.prev();
     * ```
     * @memberOf IgxCarouselComponent
     */
    public prev() {
        const index = this.current - 1 < 0 ?
            this.total - 1 : this.current - 1;

        if (!this.loop && index === this.total - 1) {
            this.stop();
            return;
        }
        return this.select(this.get(index), Direction.PREV);
    }

    /**
     * Resumes playing of the carousel if in paused state.
     * No operation otherwise.
     * ```typescript
     * this.carousel.play();
     * }
     * ```
     * @memberOf IgxCarouselComponent
     */
    public play() {
        if (!this.playing) {
            this.playing = true;
            this.onCarouselPlaying.emit(this);
            this.restartInterval();
            this.stoppedByInteraction = false;
        }
    }

    /**
     * Stops slide transitions if the `pause` option is set to `true`.
     * No operation otherwise.
     * ```typescript
     *  this.carousel.stop();
     * }
     * ```
     * @memberOf IgxCarouselComponent
     */
    public stop() {
        if (this.pause) {
            this.playing = false;
            this.onCarouselPaused.emit(this);
            this.resetInterval();
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

        if (!isNaN(this.interval) && this.interval > 0) {
            this.lastInterval = setInterval(() => {
                const tick = +this.interval;
                if (this.playing && this.total && !isNaN(tick) && tick > 0) {
                    this.next();
                } else {
                    this.stop();
                }
            }, this.interval);
        }
    }
    /**
     *@hidden
     */
    @HostListener('keydown.arrowright')
    public onKeydownArrowRight() {
        if (this.keyboardSupport) {
            event.preventDefault();
            this.next();
            requestAnimationFrame(() => this.nativeElement.focus());
        }
    }
    /**
     *@hidden
     */
    @HostListener('keydown.arrowleft')
    public onKeydownArrowLeft() {
        if (this.keyboardSupport) {
            event.preventDefault();
            this.prev();
            requestAnimationFrame(() => this.nativeElement.focus());
        }
    }

    /** @hidden */
    @HostListener('tap')
    public onTap() {
        if (this.isPlaying) {
            if (this.pause) {
                this.stoppedByInteraction = true;
            }
            this.stop();
        } else {
            if (this.stoppedByInteraction) {
                this.play();
            }
        }
        console.log('tap');
    }

    /**
    *@hidden
    */
    @HostListener('keydown.home')
    public onKeydownHome() {
        if (this.keyboardSupport && this.slides.length > 0) {
            event.preventDefault();
            this.slides.first.active = true;
            requestAnimationFrame(() => this.nativeElement.focus());
        }
    }

    /**
         *@hidden
         */
    @HostListener('keydown.end')
    public onKeydownEnd() {
        if (this.keyboardSupport && this.slides.length > 0) {
            event.preventDefault();
            this.slides.last.active = true;
            requestAnimationFrame(() => this.nativeElement.focus());
        }
    }

    /**
     * @hidden
     */
    @HostListener('mouseenter')
    public onMouseEnter() {
        if (this.pause && this.isPlaying) {
            this.stoppedByInteraction = true;
        }
        this.stop();
    }

    /**
     * @hidden
     */
    @HostListener('mouseleave')
    public onMouseLeave() {
        if (this.stoppedByInteraction) {
            this.play();
        }
    }


 /**
     * @hidden
     */
    @HostListener('panleft', ['$event'])
    public onPanLeft(event) {
        this.onPan(event);
    }

     /**
     * @hidden
     */
    @HostListener('panright', ['$event'])
    public onPanRight(event) {
        this.onPan(event);
    }


    public onPan(event) {
        if (this.isPlaying) {
            this.stoppedByInteraction = true;
            this.stop();
        }
        // if (event.direction === 8 || event.direction === 16) {
        //     return;
        // }
        if (this.isPlaying) {
            this.stoppedByInteraction = true;
            this.stop();
        }
        event.preventDefault();
        this.finishAnimations();
        const slideWidth = this.currentSlide.nativeElement.offsetWidth;
        const panOffset = (slideWidth / 100);
        const deltaX = event.deltaX;
        if (Math.abs(deltaX) + panOffset >= slideWidth
            || (!this.loop && ((this.current === 0 && deltaX > 0) || (this.current === this.total - 1 && deltaX < 0)))) {
            return;
        }
        let index;
        let offset;
        if (deltaX < 0) {
            index = (this.current + 1) % this.total;
            offset = slideWidth + event.deltaX;

        } else {
            index = this.current - 1 < 0 ? this.total - 1 : this.current - 1;
            offset = -slideWidth + event.deltaX;
        }
        if (this.incomingSlide) {
            if (index !== this.incomingSlide.index) {
                this.incomingSlide.nativeElement.style.transform = '';
                this.incomingSlide.nativeElement.style.opacity = '';
                this.incomingSlide.previous = false;
                this.incomingSlide = this.get(index);
            }
        } else {
            this.incomingSlide = this.get(index);
        }
        this.incomingSlide.previous = true;

        if (this.animationType === CarouselAnimationType.fade) {
            this.currentSlide.nativeElement.style.opacity = `${Math.abs(offset) / slideWidth}`;
        } else {
            this.currentSlide.nativeElement.style.transform = `translateX(${event.deltaX}px)`;
            this.incomingSlide.nativeElement.style.transform = `translateX(${offset}px)`;
        }
    }

    /**
     * @hidden
     */
    @HostListener('panend', ['$event'])
    public onPanEnd(event) {
        if (this.stoppedByInteraction) {
            this.play();
        }
        if (event.direction === 8 || event.direction === 16) {
            return;
        }
        event.preventDefault();
        const slideWidth = this.currentSlide.nativeElement.offsetWidth;
        const panOffset = (slideWidth / 100);
        const deltaX = Math.abs(event.deltaX) + panOffset < slideWidth ? Math.abs(event.deltaX) : slideWidth - panOffset;
        const direction = event.deltaX < 0 ? Direction.NEXT : Direction.PREV;
        const velocity = Math.abs(event.velocity);
        this.currentSlide.nativeElement.style.transform = '';
        this.currentSlide.nativeElement.style.opacity = '';
        if (this.incomingSlide) {
            this.incomingSlide.nativeElement.style.transform = '';
            this.incomingSlide.nativeElement.style.opacity = '';
            if (slideWidth / 2 < deltaX) {
                this.incomingSlide.direction = direction;
                this.incomingSlide.previous = false;

                this.animationPosition = this.animationType === CarouselAnimationType.fade ?
                    deltaX / slideWidth : (slideWidth - deltaX) / slideWidth;

                if (velocity > 1) {
                    this.newDuration = this.animationDuration / velocity;
                }
                this.incomingSlide.active = true;
            } else if (velocity > 1) {
                this.incomingSlide.direction = direction;
                this.incomingSlide.previous = false;
                this.animationPosition = this.animationType === CarouselAnimationType.fade ?
                    deltaX / slideWidth : (slideWidth - deltaX) / slideWidth;
                this.newDuration = this.animationDuration / velocity;
                this.incomingSlide.active = true;
            } else {
                this.currentSlide.direction = direction === Direction.PREV ? Direction.NEXT : Direction.PREV;
                this.previousSlide = this.incomingSlide;
                this.previousSlide.previous = true;
                this.animationPosition = this.animationType === CarouselAnimationType.fade ?
                    Math.abs((slideWidth - deltaX) / slideWidth) : deltaX / slideWidth;
                this.playEnterAnimation();
                this.playLeaveAnimation();
            }
        }
    }
}

export interface ISlideEventArgs extends IBaseEventArgs {
    carousel: IgxCarouselComponent;
    slide: IgxSlideComponent;
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxCarouselComponent, IgxSlideComponent, IgxCarouselIndicatorDirective],
    exports: [IgxCarouselComponent, IgxSlideComponent, IgxCarouselIndicatorDirective],
    imports: [CommonModule, IgxIconModule]
})
export class IgxCarouselModule {
}
