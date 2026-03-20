import { Component, OnDestroy, Input, HostBinding, Output, EventEmitter, ElementRef, AfterContentChecked, booleanAttribute, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { CarouselAnimationDirection, IgxSlideComponentBase } from './carousel-base';

/**
 * A slide component that usually holds an image and/or a caption text.
 * IgxSlideComponent is usually a child component of an IgxCarouselComponent.
 *
 * @export
 */
@Component({
    selector: 'igx-slide',
    templateUrl: 'slide.component.html',
    standalone: true
})
export class IgxSlideComponent implements AfterContentChecked, OnDestroy, IgxSlideComponentBase {
    private elementRef = inject(ElementRef);

    /**
     * Gets/sets the `index` of the slide inside the carousel.
     *
     * @memberOf IgxSlideComponent
     */
    @Input() public index: number;

    /**
     * Gets/sets the target `direction` for the slide.
     *
     * @memberOf IgxSlideComponent
     */
    @Input() public direction: CarouselAnimationDirection;

    @Input()
    public total: number;

    /**
     * Returns the `tabIndex` of the slide component.
     *
     * @memberof IgxSlideComponent
     * @deprecated in version 19.2.0.
     */
    @HostBinding('attr.tabindex')
    public get tabIndex() {
        return this.active ? 0 : null;
    }

    /**
     * @hidden
     */
    @HostBinding('attr.id')
    public id: string;

    /**
     * Returns the `role` of the slide component.
     * By default is set to `tabpanel`
     *
     * @memberof IgxSlideComponent
     */
    @HostBinding('attr.role')
    public tab = 'tabpanel';

    /** @hidden */
    @HostBinding('attr.aria-labelledby')
    public ariaLabelledBy;

    /**
     * Returns the class of the slide component.
     *
     * @memberof IgxSlideComponent
     */
    @HostBinding('class.igx-slide')
    public cssClass = 'igx-slide';

    /**
     * Gets/sets the `active` state of the slide.
     *
     * Two-way data binding.
     *
     * @memberof IgxSlideComponent
     */
    @HostBinding('class.igx-slide--current')
    @Input({ transform: booleanAttribute })
    public get active(): boolean {
        return this._active;
    }

    public set active(value) {
        this._active = value;
        this.activeChange.emit(this._active);
    }

    @HostBinding('class.igx-slide--previous')
    @Input({ transform: booleanAttribute }) public previous = false;

    /**
     * @hidden
     */
    @Output() public activeChange = new EventEmitter<boolean>();

    private _active = false;
    private _destroy$ = new Subject<boolean>();

    /**
     * Returns a reference to the carousel element in the DOM.
     *
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

    public ngAfterContentChecked() {
        this.id = `panel-${this.index}`;
        this.ariaLabelledBy = `tab-${this.index}-${this.total}`;
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this._destroy$.next(true);
        this._destroy$.complete();
    }
}
