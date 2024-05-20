import { ElementRef, Inject, NgZone, Injectable } from '@angular/core';
import { Size } from '../grids/common/enums';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Subject, animationFrameScheduler, filter, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class IgxComponentSizeService {

    protected componentComputedStyles;

    /**
     * A flag indicating if the component hasn't received its view init trigger yet.
     */
    public init = true;

    /**
     * Gets the size of the component
     */
    private get _size(): Size {
        return this.componentComputedStyles?.getPropertyValue('--component-size') || Size.Large;
    }

    /**
     * Stores the size of the component and updates based on a resize observer.
     */
    public componentSize: BehaviorSubject<Size> = new BehaviorSubject<Size>(Size.Large);

    /**
     * Gets the native element.
     *
     * @example
     * ```typescript
     * const nativeEl = this.comp.nativeElement.
     * ```
     */
    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /** @hidden @internal */
    public resizeNotify = new Subject<void>();

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        protected zone: NgZone,
        @Inject(DOCUMENT) public document: any,
    ) { }
    
    public attachObserver(): void {
        this.componentComputedStyles = this.document.defaultView.getComputedStyle(this.nativeElement);

        this.resizeNotify.pipe(
            filter(() => !this.init),
            throttleTime(40, animationFrameScheduler, { leading: true, trailing: true }),
            takeUntilDestroyed()
        )
        .subscribe(() => {
            this.zone.run(() => {
                // do not trigger reflow if element is detached.
                if (this.document.contains(this.nativeElement)) {
                    this.componentSize.next(this._size);
                }
            });
        });
    }
}