import { Component, OnDestroy, Input, HostBinding, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

export enum Direction { NONE, NEXT, PREV }

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
     * Returns the `tabIndex` of the slide component.
     * ```typescript
     * let tabIndex =  this.carousel.tabIndex;
     * ```
     * @memberof IgxSlideComponent
     */
    @HostBinding('attr.tabindex')
    get tabIndex() {
        return this.active ? 0 : null;
    }

    /**
     * Returns the `aria-selected` of the slide.
     *
     * ```typescript
     * let slide = this.slide.ariaSelected;
     * ```
     *
     */
    @HostBinding('attr.aria-selected')
    public get ariaSelected(): boolean {
        return this.active;
    }

    /**
     * Returns the `aria-live` of the slide.
     *
     * ```typescript
     * let slide = this.slide.ariaLive;
     * ```
     *
     */
    @HostBinding('attr.aria-selected')
    public get ariaLive() {
        return this.active ? 'polite' : null;
    }

    /**
     * Returns the class of the slide component.
     * ```typescript
     * let class =  this.slide.cssClass;
     * ```
     * @memberof IgxSlideComponent
     */
    @HostBinding('class.igx-slide')
    public cssClass = 'igx-slide';

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
    @HostBinding('class.igx-slide--current')
    @Input()
    public get active(): boolean {
        return this._active;
    }

    public set active(value) {
        this._active = !!value;
        this.activeChange.emit(this._active);
    }

    @HostBinding('class.igx-slide--previous')
    @Input() public previous = false;

    /**
     * @hidden
     */
    @Output() public activeChange = new EventEmitter<boolean>();

    constructor(private elementRef: ElementRef) { }

    /**
     * Returns a reference to the carousel element in the DOM.
     * ```typescript
     * let nativeElement =  this.slide.nativeElement;
     * ```
     * @memberof IgxSlideComponent
     */
    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * @hidden
     */
    public get isDestroyed(): Subject<boolean> {
    return this._destroy$;
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this._destroy$.next(true);
        this._destroy$.complete();
    }
}
