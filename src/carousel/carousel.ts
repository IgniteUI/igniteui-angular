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

@Component({
    selector: 'ig-carousel',
    moduleId: module.id,
    templateUrl: 'carousel.html',
})

export class Carousel implements OnDestroy {

    @Input() loop: boolean = true;
    @Input() pause: boolean = true;

    get interval(): number {
        return this._interval;
    }

    @Input("interval")
    set interval(value: number) {
        this._interval = +value;
        this._restartInterval();
    }

    @Input() navigation: boolean = true;

    @Output() slideChanged = new EventEmitter();
    @Output() slideAdded = new EventEmitter();
    @Output() slideRemoved = new EventEmitter();
    @Output() carouselPaused = new EventEmitter();
    @Output() carouselPlaying = new EventEmitter();

    public  slides: Array<Slide> = [];
    private _interval: number;
    private _lastInterval: any;
    private _playing: boolean;
    private _currentSlide: Slide;
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

    public get total(): number {
        return this._total;
    }

    public get current(): number {
        return !this._currentSlide ? 0 : this._currentSlide.index;
    }

    public get isPlaying(): boolean {
        return this._playing;
    }

    public get isDestroyed(): boolean {
        return this._destroyed;
    }


    public get(index: number): Slide {
        for (let each of this.slides) {
            if (each.index === index) {
                return each;
            }
        }
    }

    public add(slide: Slide) {
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

        this.slideAdded.emit(this);
    }

    public remove(slide: Slide) {
        this.slides.splice(slide.index, 1);
        this._total -= 1;

        if (!this.total) {
            this._currentSlide = null;
            return;
        }

        for (let i = 0; i < this.total; i++) {
            this.slides[i].index = i;
        }

        this.slideRemoved.emit(this);
    }

    public select(slide: Slide, direction: Direction = Direction.NONE) {
        let new_index = slide.index;
        if (direction === Direction.NONE) {
            direction = new_index > this.current ? Direction.NEXT : Direction.PREV;
        }

        if (slide && slide !== this._currentSlide) {
            this._moveTo(slide, direction);
        }
    }

    public next() {
        let index = (this.current + 1) % this.total;

        if (index === 0 && !this.loop) {
            this.stop();
            return;
        }
        return this.select(this.get(index), Direction.NEXT);
    }

    public prev() {
        let index = this.current - 1 < 0 ?
            this.total - 1 : this.current - 1;

        if (!this.loop && index === this.total - 1) {
            this.stop();
            return;
        }
        return this.select(this.get(index), Direction.PREV);
    }

    public play() {
        if (!this._playing) {
            this._playing = true;
            this.carouselPlaying.emit(this);
            this._restartInterval();
        }
    }

    public stop() {
        if (this.pause) {
            this._playing = false;
            this.carouselPaused.emit(this);
            this._resetInterval();
        }
    }

    private _moveTo(slide: Slide, direction: Direction) {
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

        this.slideChanged.emit(this);
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
            this.next();
        });

        renderer.listen(this.element_ref.nativeElement, 'swiperight', (event) => {
            this.prev();
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

@Component({
    selector: 'ig-slide',
    moduleId: module.id,
    templateUrl: 'slide.html'
})

export class Slide implements OnInit, OnDestroy {
    @Input() index: number;
    @Input() direction: Direction;

    @HostBinding('class.igx-slide--active')
    @Input() active: boolean;

    constructor(private carousel: Carousel, private element_ref: ElementRef, private renderer: Renderer) {}

    public ngOnInit() {
        this.carousel.add(this);
    }

    public ngOnDestroy() {
        this.carousel.remove(this);
    }
}

@NgModule({
    declarations: [Carousel, Slide],
    imports: [CommonModule],
    exports: [Carousel, Slide]
})
export class CarouselModule {
}