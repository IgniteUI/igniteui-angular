import {
    NgModule,
    Component,
    HostBinding,
    ElementRef,
    Renderer,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import { CommonModule } from "@angular/common";
import { HammerGesturesManager } from '../core/touch';


export enum Direction {NONE, NEXT, PREV}

/**
 * A carousel component is used to browse or navigate through a collection of slides - galeries of images,
 * cards, on-boarding tutorials or page-based interfaces. It can be used as a seperate fullscreen element
 * or inside another component
 *
 * ```
 * <igx-carousel (event output bindings) [input bindigns] >
 *     ....
 * </igx-carousel>
 * ```
 * @export
 * @class IgxCarousel
 * @implements {OnDestroy}
 */

@Component({
    selector: 'igx-carousel',
    host: {
        'role': "region"
    },
    moduleId: module.id,
    templateUrl: 'carousel.component.html',
})

export class IgxCarousel implements OnDestroy {

    /**
     * Sets whether the carousel should loop back to the first slide
     * after reaching the last slide.
     *
     * Default value is true
     *
     * @type {boolean}
     * @memberOf IgxCarousel
     */
    @Input() loop: boolean = true;

    /**
     * Sets whether the carousel can pause the slide transitions.
     *
     * Default value is true
     *
     * @type {boolean}
     * @memberOf IgxCarousel
     */
    @Input() pause: boolean = true;

    @Input()
    get interval(): number {
        return this._interval;
    }


    set interval(value: number) {
        this._interval = +value;
        this._restartInterval();
    }

    setAriaLabel(slide) {
        return `Item ${slide.index + 1} of ${this.total}`;
    }

    /**
     * Controls whether the carousel should render the left/right navigation buttons.
     *
     * Default value is true
     *
     * @type {boolean}
     * @memberOf IgxCarousel
     */
    @Input() navigation: boolean = true;

    /**
     * An event that is emitted after a slide transition has happened.
     * Provides a reference to the IgxCarousel as an event argument.
     *
     * @type {EventEmitter}
     * @memberOf IgxCarousel
     */
    @Output() onSlideChanged = new EventEmitter();

    /**
     * An event that is emitted after a slide has been added to the carousel.
     * Provides a reference to the IgxCarousel as an event argument.
     *
     * @type {EventEmitter}
     * @memberOf IgxCarousel
     */
    @Output() onSlideAdded = new EventEmitter();

    /**
     * An event that is emitted after a slide has been removed from the carousel.
     * Provides a reference to the IgxCarousel as an event argument.
     *
     * @type {EventEmitter}
     * @memberOf IgxCarousel
     */
    @Output() onSlideRemoved = new EventEmitter();

    /**
     * An event that is emitted after the carousel has been paused.
     * Provides a reference to the IgxCarousel as an event argument.
     *
     * @type {EventEmitter}
     * @memberOf IgxCarousel
     */
    @Output() onCarouselPaused = new EventEmitter();

    /**
     * An event that is emitted after the carousel has resumed transitioning between slides.
     * Provides a reference to the IgxCarousel as an event argument.
     *
     * @type {EventEmitter}
     * @memberOf IgxCarousel
     */
    @Output() onCarouselPlaying = new EventEmitter();

    /**
     * The collection of slides currently in the carousel
     *
     * @type {Array<Slide>}
     * @memberOf IgxCarousel
     */
    public slides: Array<IgxSlide> = [];
    private _interval: number;
    private _lastInterval: any;
    private _playing: boolean;
    private _currentSlide: IgxSlide;
    private _destroyed: boolean;
    private _total: number;

    constructor(public element_ref: ElementRef, private renderer: Renderer) {
        this._total = 0;
        this._addEventListeners(renderer);
    }

    public ngOnDestroy() {
        this._destroyed = true;
        if (this._lastInterval) {
            clearInterval(this._lastInterval);
        }
    }

    /**
     * The total number of slides in the carousel.
     *
     * @readonly
     * @type {number}
     * @memberOf IgxCarousel
     */
    public get total(): number {
        return this._total;
    }

    /**
     * The index of the slide being currently shown.
     *
     * @readonly
     * @type {number}
     * @memberOf IgxCarousel
     */
    public get current(): number {
        return !this._currentSlide ? 0 : this._currentSlide.index;
    }

    /**
     * Returns the state of the carousel - paused or playing.
     *
     * @readonly
     * @type {boolean}
     * @memberOf IgxCarousel
     */
    public get isPlaying(): boolean {
        return this._playing;
    }

    /**
     * Whether the carousel is destroyed, i.e. `ngOnDestroy` has been called.
     *
     * @readonly
     * @type {boolean}
     * @memberOf Carousel
     */
    public get isDestroyed(): boolean {
        return this._destroyed;
    }

    /**
     * Returns the slide corresponding to the provided index or null.
     *
     * @param {number} index
     * @returns {IgxSlide}
     *
     * @memberOf IgxCarousel
     */
    public get(index: number): IgxSlide {
        for (let each of this.slides) {
            if (each.index === index) {
                return each;
            }
        }
    }

    /**
     * Adds a new slide to the carousel.
     *
     * @param {IgxSlide} slide
     *
     * @memberOf IgxCarousel
     */
    public add(slide: IgxSlide) {
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

        this.onSlideAdded.emit(this);
    }

    /**
     * Removes the given slide from the carousel.
     *
     * @param {IgxSlide} slide
     * @returns
     *
     * @memberOf IgxCarousel
     */
    public remove(slide: IgxSlide) {
        this.slides.splice(slide.index, 1);
        this._total -= 1;

        if (!this.total) {
            this._currentSlide = null;
            return;
        }

        for (let i = 0; i < this.total; i++) {
            this.slides[i].index = i;
        }

        this.onSlideRemoved.emit(this);
    }

    /**
     * Kicks in a transition for a given slide with a given direction.
     *
     * @param {IgxSlide} slide
     * @param {Direction} [direction=Direction.NONE]
     *
     * @memberOf IgxCarousel
     */
    public select(slide: IgxSlide, direction: Direction = Direction.NONE) {
        let new_index = slide.index;
        if (direction === Direction.NONE) {
            direction = new_index > this.current ? Direction.NEXT : Direction.PREV;
        }

        if (slide && slide !== this._currentSlide) {
            this._moveTo(slide, direction);
        }
    }

    /**
     * Transitions to the next slide in the carousel.
     *
     * @returns
     *
     * @memberOf IgxCarousel
     */
    public next() {
        let index = (this.current + 1) % this.total;

        if (index === 0 && !this.loop) {
            this.stop();
            return;
        }
        return this.select(this.get(index), Direction.NEXT);
    }

    /**
     * Transitions to the previous slide in the carousel.
     *
     * @returns
     *
     * @memberOf IgxCarousel
     */
    public prev() {
        let index = this.current - 1 < 0 ?
            this.total - 1 : this.current - 1;

        if (!this.loop && index === this.total - 1) {
            this.stop();
            return;
        }
        return this.select(this.get(index), Direction.PREV);
    }

    /**
     * Resumes playing of the carousel if in paused state.
     * No-op otherwise.
     *
     *
     * @memberOf IgxCarousel
     */
    public play() {
        if (!this._playing) {
            this._playing = true;
            this.onCarouselPlaying.emit(this);
            this._restartInterval();
        }
    }

    /**
     * Stops slide transitions if the `pause` options is set to `true`.
     * No-op otherwise.
     *
     *
     * @memberOf IgxCarousel
     */
    public stop() {
        if (this.pause) {
            this._playing = false;
            this.onCarouselPaused.emit(this);
            this._resetInterval();
        }
    }

    private _moveTo(slide: IgxSlide, direction: Direction) {
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

        this.onSlideChanged.emit(this);
        this._restartInterval();
    }

    private _resetInterval() {
        if (this._lastInterval) {
            clearInterval(this._lastInterval);
            this._lastInterval = null;
        }
    }

    private _restartInterval() {
        this._resetInterval();

        if (!isNaN(this.interval) && this.interval > 0) {
            this._lastInterval = setInterval(() => {
                let tick = +this.interval;
                if (this._playing && this.total && !isNaN(tick) && tick > 0) {
                    this.next();
                } else {
                    this.stop();
                }
            }, this.interval);
        }
    }

    private _addEventListeners(renderer: Renderer) {
        // Swipe events

        renderer.listen(this.element_ref.nativeElement, 'swipeleft', (event) => {
            this.prev();
        });

        renderer.listen(this.element_ref.nativeElement, 'swiperight', (event) => {
            this.next();
        });

        // Tap
        renderer.listen(this.element_ref.nativeElement, 'tap', (event) => {
            if (this._playing) {
                this.stop();
            } else {
                this.play();
            }
        });

        // Keydown for arrow keys

        renderer.listen(this.element_ref.nativeElement, 'keydown', (event) => {
            switch(event.key) {
            case "ArrowLeft":
                this.prev();
                break;
            case "ArrowRight":
                this.next();
                break;
            default:
                return;
            }
        });
    }

}

/**
 * A slide component that usually holds an image and/or a caption text.
 * IgxSlide is usually a child component of an IgxCarousel.
 *
 * ```
 * <igx-slide [input bindings] >
 *    <ng-content></ng-content>
 * </igx-slide>
 * ```
 *
 * @export
 * @class IgxSlide
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: 'igx-slide',
    moduleId: module.id,
    templateUrl: 'slide.html'
})

export class IgxSlide implements OnInit, OnDestroy {

    /**
     * The current index of the slide inside the carousel
     *
     * @type {number}
     * @memberOf IgxSlide
     */
    @Input() index: number;

    /**
     * The target direction for the slide
     *
     * @type {Direction}
     * @memberOf IgxSlide
     */
    @Input() direction: Direction;

    @HostBinding('class.active')
    @Input() active: boolean;

    constructor(private carousel: IgxCarousel, private element_ref: ElementRef) {}

    public ngOnInit() {
        this.carousel.add(this);
    }

    public ngOnDestroy() {
        this.carousel.remove(this);
    }
}

@NgModule({
    declarations: [IgxCarousel, IgxSlide],
    imports: [CommonModule],
    exports: [IgxCarousel, IgxSlide]
})
export class IgxCarouselModule {
}