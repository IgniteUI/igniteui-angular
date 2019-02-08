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
    OnInit,
    Output
} from '@angular/core';
import { IgxIconModule } from '../icon/index';

let NEXT_ID = 0;

export enum Direction { NONE, NEXT, PREV }

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
        outline-style: none
    }`]
})

export class IgxCarouselComponent implements OnDestroy {
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
     * <igx-carousel [interval] = "1000"></carousel>
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
     * let slides: IgxSlideComponent[] = this.carousel.slides;
     * ```
     * @memberOf IgxCarouselComponent
     */
    public slides: IgxSlideComponent[] = [];
    private _interval: number;
    private _lastInterval: any;
    private _playing: boolean;
    private _currentSlide: IgxSlideComponent;
    private _destroyed: boolean;
    private _total = 0;

    constructor(private element: ElementRef) { }
    /**
     *@hidden
     */
    public ngOnDestroy() {
        this._destroyed = true;
        if (this._lastInterval) {
            clearInterval(this._lastInterval);
        }
    }
    /**
     * @hidden
     * @memberof IgxCarouselComponent
     */
    public setAriaLabel(slide) {
        return `Item ${slide.index + 1} of ${this.total}`;
    }

    /**
     * Returns the total number of `slides` in the carousel.
     * ```typescript
     * let slideCount =  this.carousel.total;
     * ```
     * @memberOf IgxCarouselComponent
     */
    public get total(): number {
        return this._total;
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
        for (const each of this.slides) {
            if (each.index === index) {
                return each;
            }
        }
    }

    /**
     * Adds a new slide to the carousel.
     * ```typescript
     * this.carousel.add(newSlide);
     * ```
     * @memberOf IgxCarouselComponent
     */
    public add(slide: IgxSlideComponent) {
        slide.index = this.total;
        this.slides.push(slide);
        this._total += 1;

        if (this.total === 1 || slide.active) {
            this.select(slide);
            if (this.total === 1) {
                this.play();
            }
        } else {
            slide.active = false;
        }

        this.onSlideAdded.emit({ carousel: this, slide });
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
            if (slide.index === this.current) {
                slide.active = false;
                this.next();
            }

            this.slides.splice(slide.index, 1);
            this._total -= 1;

            if (!this.total) {
                this._currentSlide = null;
                return;
            }

            for (let i = 0; i < this.total; i++) {
                this.slides[i].index = i;
            }

            this.onSlideRemoved.emit({ carousel: this, slide });
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
        const newIndex = slide.index;
        if (direction === Direction.NONE) {
            direction = newIndex > this.current ? Direction.NEXT : Direction.PREV;
        }

        if (slide && slide !== this._currentSlide) {
            this._moveTo(slide, direction);
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
    private _moveTo(slide: IgxSlideComponent, direction: Direction) {
        if (this._destroyed) {
            return;
        }

        slide.direction = direction;
        slide.active = true;

        if (this._currentSlide) {
            this._currentSlide.direction = direction;
            this._currentSlide.active = false;
        }

        this._currentSlide = slide;

        this.onSlideChanged.emit({ carousel: this, slide });
        this._restartInterval();
        requestAnimationFrame(() => this.nativeElement.focus());
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
        this.next();
    }
    /**
     *@hidden
     */
    @HostListener('keydown.arrowleft')
    public onKeydownArrowLeft() {
        this.prev();
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

export class IgxSlideComponent implements OnInit, OnDestroy {

    /**
     * Gets/sets the `index` of the slide inside the carousel.
     * ```html
     * <igx-carousel>
     *  <igx-slide index = "1"</igx-slide>
     * <igx-carousel>
     * ```
     * @memberOf IgxSlideComponent
     */
    @Input() public index: number;

    /**
     * Gets/sets the target `direction` for the slide.
     * ```html
     * <igx-carousel>
     *  <igx-slide direction="NEXT"</igx-slide>
     * <igx-carousel>
     * ```
     * @memberOf IgxSlideComponent
     */
    @Input() public direction: Direction;
    /**
     * Gets/sets the `active` state of the slide.
     * ```html
     * <igx-carousel>
     *  <igx-slide [active] ="false"</igx-slide>
     * <igx-carousel>
     * ```
     * @memberof IgxSlideComponent
     */
    @HostBinding('class.active')
    @Input() public active: boolean;

    constructor(private carousel: IgxCarouselComponent) { }
    /**
     *@hidden
     */
    public ngOnInit() {
        this.carousel.add(this);
    }
    /**
     *@hidden
     */
    public ngOnDestroy() {
        this.carousel.remove(this);
    }
}

export interface ISlideEventArgs {
    carousel: IgxCarouselComponent;
    slide: IgxSlideComponent;
}
/**
 * The `IgxCarouselModule` provides the {@link IgxCarouselComponent} inside your application.
 */
@NgModule({
    declarations: [IgxCarouselComponent, IgxSlideComponent],
    exports: [IgxCarouselComponent, IgxSlideComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxCarouselModule {
}
