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
    forwardRef,
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
import { IgxCarouselIndicatorDirective } from './carousel.directives';

let NEXT_ID = 0;

export enum Direction { NONE, NEXT, PREV }
export enum CarouselIndicatorsOrientation {
    left = 'left',
    right = 'right',
    bottom = 'bottom',
    top = 'top'
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
        this._restartInterval();
    }
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
     * <igx-carousel [keyBoardNavigation] = "false"></igx-carousel>
     * ```
     * @memberOf IgxCarouselComponent
     */
    @Input() public keyBoardNavigation = true;

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
    * Gets/sets the display mode of carousel indicators
    * ```html
    * <igx-carousel indicatorsOrientation=CarouselIndicatorsOrientation.top>
    * <igx-carousel>
    * ```
    * @memberOf IgxSlideComponent
    */
    @Input() public indicatorsOrientation = CarouselIndicatorsOrientation.bottom;

    @ViewChild('defaultIndicator', { read: TemplateRef, static: true })
    protected defaultIndicator: TemplateRef<any>;

    /**
     * The custom template, if any, that should be used when rendering carousel indicators
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.carousel.itemTemplate = myCustomTemplate;
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

    /**
     * The collection of `slides` currently in the carousel.
     * ```typescript
     * let slides: QueryList<IgxSlideComponent> = this.carousel.slides;
     * ```
     * @memberOf IgxCarouselComponent
     */
    @ContentChildren(forwardRef(() => IgxSlideComponent))
    public slides: QueryList<IgxSlideComponent>;


    private _interval: number;
    private _lastInterval: any;
    private _playing: boolean;
    private _currentSlide: IgxSlideComponent;
    private _destroyed: boolean;
    private _differ: IterableDiffer<IgxSlideComponent> | null = null;

    /**
    * @hidden
    */
    protected destroy$ = new Subject<any>();

    constructor(private element: ElementRef, private _iterableDiffers: IterableDiffers) {
        this._differ = this._iterableDiffers.find([]).create(null);
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
        this._destroyed = true;
        if (this._lastInterval) {
            clearInterval(this._lastInterval);
        }
    }

    private unsubscriber(slide: IgxSlideComponent) {
        return merge(this.destroy$, slide.destroy);
    }

    private onSlideActivated(slide: IgxSlideComponent) {
        if (slide.active && slide !== this._currentSlide) {
            if (slide.direction === Direction.NONE) {
                const newIndex = slide.index;
                slide.direction = newIndex > this.current ? Direction.NEXT : Direction.PREV;
            }

            if (this._currentSlide) {
                this._currentSlide.direction = slide.direction;
                this._currentSlide.active = false;
            }

            this._currentSlide = slide;

            this.onSlideChanged.emit({ carousel: this, slide });
            this._restartInterval();
        }
    }

    private updateSlidesSelection() {
        requestAnimationFrame(() => {
            if (this._currentSlide) {
                this._currentSlide.active = true;
                const activeSlides = this.slides.filter(slide => slide.active && slide.index !== this._currentSlide.index);
                activeSlides.forEach(slide => {slide.active = false; } );
            } else if (this.total) {
                this.slides.first.active = true;
            }

            this.play();
        });
    }

    /**
     * @hidden
     */
    protected initSlides(change: QueryList<IgxSlideComponent>) {
        const diff = this._differ.diff(change.toArray());
        if (diff) {
            this.slides.reduce((any, c, ind) => c.index = ind, 0); // reset slides indexes
            diff.forEachAddedItem((record: IterableChangeRecord<IgxSlideComponent>) => {
                const slide = record.item;
                this.onSlideAdded.emit({ carousel: this, slide });
                slide.activeChange.pipe(takeUntil(this.unsubscriber(slide))).subscribe(() => this.onSlideActivated(slide));
                if (slide.active) {
                    this._currentSlide = slide;
                }
            });

            diff.forEachRemovedItem((record: IterableChangeRecord<IgxSlideComponent>) => {
                const slide = record.item;
                this.onSlideRemoved.emit({ carousel: this, slide });
                if (slide.active) {
                    slide.active = false;
                    this._currentSlide = this.get(slide.index < this.total ? slide.index : this.total - 1 );
                }
            });

            this.updateSlidesSelection();
        }
    }

    /**
     * @hidden @internal
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
        return `igx-carousel__indicators--${this.indicatorsOrientation}`;
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
        return !this._currentSlide ? 0 : this._currentSlide.index;
    }

    /**
     * Returns a boolean indicating if the carousel is playing.
     * ```typescript
     * let isPlaying =  this.carousel.isPlaying;
     * ```
     * @memberOf IgxCarouselComponent
     */
    public get isPlaying(): boolean {
        return this._playing;
    }

    /**
     * Returns а boolean indicating if the carousel is destroyed.
     * ```typescript
     * let isDestroyed =  this.carousel.isDestroyed;
     * ```
     * @memberOf IgxCarouselComponent
     */
    public get isDestroyed(): boolean {
        return this._destroyed;
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
        if (slide && slide !== this._currentSlide) {
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
        if (!this._playing) {
            this._playing = true;
            this.onCarouselPlaying.emit(this);
            this._restartInterval();
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
            this._playing = false;
            this.onCarouselPaused.emit(this);
            this._resetInterval();
        }
    }

    /**
     *@hidden
     */
    private _resetInterval() {
        if (this._lastInterval) {
            clearInterval(this._lastInterval);
            this._lastInterval = null;
        }
    }
    /**
     *@hidden
     */
    private _restartInterval() {
        this._resetInterval();

        if (!isNaN(this.interval) && this.interval > 0) {
            this._lastInterval = setInterval(() => {
                const tick = +this.interval;
                if (this._playing && this.total && !isNaN(tick) && tick > 0) {
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
        if (this.keyBoardNavigation) {
            this.next();
            requestAnimationFrame(() => this.nativeElement.focus());
        }
    }
    /**
     *@hidden
     */
    @HostListener('keydown.arrowleft')
    public onKeydownArrowLeft() {
        if (this.keyBoardNavigation) {
            this.prev();
            requestAnimationFrame(() => this.nativeElement.focus());
        }
    }
}

/**
 * A slide component that usually holds an image and/or a caption text.
 * IgxSlideComponent is usually a child component of an IgxCarouselComponent.
 *
 * ```
 * <igx-slide [input bindings] >
 *    <ng-content></ng-content>
 * </igx-slide>
 * ```
 *
 * @export
 */
@Component({
    selector: 'igx-slide',
    templateUrl: 'slide.component.html'
})

export class IgxSlideComponent implements OnDestroy {
    private _active = false;
    private _destroy$ = new Subject<boolean>();
    /**
     * Gets/sets the `index` of the slide inside the carousel.
     * ```html
     * <igx-carousel>
     *  <igx-slide index = "1"></igx-slide>
     * <igx-carousel>
     * ```
     * @memberOf IgxSlideComponent
     */
    @Input() public index: number;

    /**
     * Gets/sets the target `direction` for the slide.
     * ```html
     * <igx-carousel>
     *  <igx-slide direction="NEXT"></igx-slide>
     * <igx-carousel>
     * ```
     * @memberOf IgxSlideComponent
     */
    @Input() public direction: Direction;
    /**
     * Gets/sets the `active` state of the slide.
     * ```html
     * <igx-carousel>
     *  <igx-slide [active] ="false"></igx-slide>
     * <igx-carousel>
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-carousel>
     *  <igx-slide [(active)] ="model.isActive"></igx-slide>
     * <igx-carousel>
     * ```
     * @memberof IgxSlideComponent
     */
    @HostBinding('class.active')
    @Input()
    public get active(): boolean {
        return this._active;
    }
    public set active(value) {
        this._active = !!value;
        this.activeChange.emit(this._active);
    }

    public get destroy(): Subject<boolean> {
        return this._destroy$;
    }
    /**
     *@hidden
     */
    @Output() public activeChange = new EventEmitter<boolean>();

    constructor(private elementRef: ElementRef) { }

    /**
  * @hidden
  */
    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this._destroy$.next(true);
        this._destroy$.complete();
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
