import { ElementRef, EventEmitter, OnDestroy, OnInit } from "@angular/core";
export declare enum Direction {
    NONE = 0,
    NEXT = 1,
    PREV = 2,
}
export declare class IgxCarouselComponent implements OnDestroy {
    private element;
    role: string;
    id: string;
    loop: boolean;
    pause: boolean;
    interval: number;
    readonly tabIndex: number;
    navigation: boolean;
    onSlideChanged: EventEmitter<ISlideEventArgs>;
    onSlideAdded: EventEmitter<ISlideEventArgs>;
    onSlideRemoved: EventEmitter<ISlideEventArgs>;
    onCarouselPaused: EventEmitter<IgxCarouselComponent>;
    onCarouselPlaying: EventEmitter<IgxCarouselComponent>;
    slides: IgxSlideComponent[];
    private _interval;
    private _lastInterval;
    private _playing;
    private _currentSlide;
    private _destroyed;
    private _total;
    constructor(element: ElementRef);
    ngOnDestroy(): void;
    setAriaLabel(slide: any): string;
    readonly total: number;
    readonly current: number;
    readonly isPlaying: boolean;
    readonly isDestroyed: boolean;
    readonly nativeElement: any;
    get(index: number): IgxSlideComponent;
    add(slide: IgxSlideComponent): void;
    remove(slide: IgxSlideComponent): void;
    select(slide: IgxSlideComponent, direction?: Direction): void;
    next(): void;
    prev(): void;
    play(): void;
    stop(): void;
    private _moveTo(slide, direction);
    private _resetInterval();
    private _restartInterval();
    onKeydownArrowRight(): void;
    onKeydownArrowLeft(): void;
}
export declare class IgxSlideComponent implements OnInit, OnDestroy {
    private carousel;
    index: number;
    direction: Direction;
    active: boolean;
    constructor(carousel: IgxCarouselComponent);
    ngOnInit(): void;
    ngOnDestroy(): void;
}
export interface ISlideEventArgs {
    carousel: IgxCarouselComponent;
    slide: IgxSlideComponent;
}
export declare class IgxCarouselModule {
}
