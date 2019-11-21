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
    ContentChild
} from '@angular/core';
import { IgxIconModule } from '../icon/index';
import { IBaseEventArgs } from '../core/utils';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxCarouselIndicatorDirective, IgxCarouselNextButtonDirective, IgxCarouselPrevButtonDirective } from './carousel.directives';
import { useAnimation, AnimationBuilder, AnimationPlayer, AnimationReferenceMetadata } from '@angular/animations';
import { slideInLeft, fadeIn, rotateInCenter } from '../animations/main';
import { IgxSlideComponent, Direction } from './slide.component';
import { ICarouselResourceStrings } from '../core/i18n/carousel-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';

let NEXT_ID = 0;

export enum CarouselIndicatorsOrientation {
    bottom = 'bottom',
    top = 'top'
}

export enum CarouselAnimationType {
    none = 'none',
    slide = 'slide',
    fade = 'fade'
}

export interface CarouselAnimationSettings {
    enterAnimation: AnimationReferenceMetadata;
    leaveAnimation: AnimationReferenceMetadata;
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
    private defaultIndicator: TemplateRef<any>;

    @ViewChild('defaultNextButton', { read: TemplateRef, static: true })
    private defaultNextButton: TemplateRef<any>;

    @ViewChild('defaultPrevButton', { read: TemplateRef, static: true })
    private defaultPrevButton: TemplateRef<any>;

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
     *            <button igxButton="fab" igxRipple="white" [disabled]="disabled">
     *                <igx-icon fontSet="material">add</igx-icon>
     *           </button>
     *      </ng-template>
     *  </igx-carousel>
     * ```
     */
    @ContentChild(IgxCarouselNextButtonDirective, { read: TemplateRef, static: false })
    public nextButtonTemplate: TemplateRef<any> = null;

    /**
     * The custom template, if any, that should be used when rendering carousel previous button
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
     *      <ng-template igxCarouselPrevButton let-disabled>
     *            <button igxButton="fab" igxRipple="white" [disabled]="disabled">
     *                <igx-icon fontSet="material">remove</igx-icon>
     *           </button>
     *      </ng-template>
     *  </igx-carousel>
     * ```
     */
    @ContentChild(IgxCarouselPrevButtonDirective, { read: TemplateRef, static: false })
    public prevButtonTemplate: TemplateRef<any> = null;

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
        let  animationWasStarted = false;
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
        switch (this.animationType) {
            case CarouselAnimationType.slide:
                return {
                    enterAnimation: useAnimation(slideInLeft,
                        {
                            params: {
                                delay: '0s',
                                duration: `${this.animationDuration}ms`,
                                endOpacity: 1,
                                startOpacity: 1,
                                fromPosition: `translateX(${this.currentSlide.direction === 1 ? 100 : -100}%)`,
                                toPosition: 'translateX(0%)'
                            }
                        }),
                    leaveAnimation: useAnimation(slideInLeft,
                        {
                            params: {
                                delay: '0s',
                                duration: `${this.animationDuration}ms`,
                                endOpacity: 1,
                                startOpacity: 1,
                                fromPosition: `translateX(0%)`,
                                toPosition: `translateX(${this.currentSlide.direction === 1 ? -100 : 100}%)`,
                            }
                        })
                };
            case CarouselAnimationType.fade:
                return {
                    enterAnimation: useAnimation(fadeIn, { params: { duration: `${this.animationDuration}ms` } }),
                    leaveAnimation: null
                };
        }
        return  {
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
     */
    public get getNextButtonTemplate(): TemplateRef<any> {
        if (this.nextButtonTemplate) {
            return this.nextButtonTemplate;
        }
        return this.defaultNextButton;
    }

     /**
     * @hidden
     */
    public get getPrevButtonTemplate(): TemplateRef<any> {
        if (this.prevButtonTemplate) {
            return this.prevButtonTemplate;
        }
        return this.defaultPrevButton;
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
    public get nextButtonDisabled() {
        return !this.loop && this.current === (this.total - 1);
    }

    /**
     *@hidden
     */
    public get prevButtonDisabled() {
        return !this.loop && this.current === 0;
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
            if (this.pause && this.isPlaying) {
                this.stoppedByInteraction = true;
            }
            this.stop();
        } else {
            if (this.stoppedByInteraction) {
                this.play();
            }
        }
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
        if ( this.stoppedByInteraction ) {
            this.play();
       }
    }

    /**
     * @hidden
     */
    @HostListener('swipeleft')
    public swipeLeft() {
        this.next();
    }

    /**
    * @hidden
    */
    @HostListener('swiperight')
    public swipeRight() {
        this.prev();
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
    declarations: [
        IgxCarouselComponent,
        IgxSlideComponent,
        IgxCarouselIndicatorDirective,
        IgxCarouselNextButtonDirective,
        IgxCarouselPrevButtonDirective
        ],
    exports: [
        IgxCarouselComponent,
        IgxSlideComponent,
        IgxCarouselIndicatorDirective,
        IgxCarouselNextButtonDirective,
        IgxCarouselPrevButtonDirective
        ],
    imports: [CommonModule, IgxIconModule]
})
export class IgxCarouselModule {
}
