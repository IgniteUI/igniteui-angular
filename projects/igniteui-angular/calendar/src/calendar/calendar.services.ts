import { ChangeDetectorRef, ElementRef, Injectable, NgZone, inject } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { PlatformUtil } from 'igniteui-angular/core';

@Injectable()
export class KeyboardNavigationService {
    private eventManager = inject(EventManager);
    private ngZone = inject(NgZone);
    private cdr = inject(ChangeDetectorRef);

    private keyHandlers = new Map<string, (event: KeyboardEvent) => void>();
    private eventUnsubscribeFn: Function | null = null;
    private platform = inject(PlatformUtil);

    public attachKeyboardHandlers(elementRef: ElementRef, context: any) {
        if (!this.platform.isBrowser) {
            return this;
        }

        this.detachKeyboardHandlers(); // Clean up any existing listeners

        this.ngZone.runOutsideAngular(() => {
            this.eventUnsubscribeFn = this.eventManager.addEventListener(
                elementRef.nativeElement,
                'keydown',
                (event: KeyboardEvent) => {
                    const handler = this.keyHandlers.get(event.key);

                    if (handler) {
                        this.ngZone.run(() => {
                            handler.call(context, event);
                            this.cdr.markForCheck();
                        });
                    }
                }
            );
        });

        return this;
    }

    public detachKeyboardHandlers() {
        if (this.eventUnsubscribeFn) {
            this.eventUnsubscribeFn();
            this.eventUnsubscribeFn = null;
        }

        this.keyHandlers.clear();
    }

    public set(key : string, handler: (event: KeyboardEvent) => void) {
        this.keyHandlers.set(key, handler);
        return this;
    }

    public unset(key: string) {
        this.keyHandlers.delete(key);
        return this;
    }
}
