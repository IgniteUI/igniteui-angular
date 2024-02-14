import { Injectable, ElementRef, NgZone } from "@angular/core";
import { EventManager } from "@angular/platform-browser";

@Injectable({
    providedIn: 'root'
})
export class KeyboardNavigationService {
    private keyHandlers = new Map<string, (event: KeyboardEvent) => void>();
    private eventUnsubscribeFn: Function | null = null;

    constructor(
        private eventManager: EventManager,
        private ngZone: NgZone,
    ) {}

    public registerKeyHandler(key: string, handler: (event: KeyboardEvent) => void) {
        this.keyHandlers.set(key, handler);
    }

    public unregisterKeyHandler(key: string) {
        this.keyHandlers.delete(key);
    }

    public attachKeyboardHandlers(elementRef: ElementRef) {
        this.detachKeyboardHandlers(); // Clean up any existing listeners

        this.ngZone.runOutsideAngular(() => {
            this.eventUnsubscribeFn = this.eventManager.addEventListener(
                elementRef.nativeElement,
                'keydown',
                (event: KeyboardEvent) => {
                    const handler = this.keyHandlers.get(event.key);

                    if (handler) {
                        this.ngZone.run(() => handler(event));
                    }
                }
            );
        });
    }

    public detachKeyboardHandlers() {
        if (this.eventUnsubscribeFn) {
            this.eventUnsubscribeFn();
            this.eventUnsubscribeFn = null;
        }

        this.keyHandlers.clear();
    }
}
