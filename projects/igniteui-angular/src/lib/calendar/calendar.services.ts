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

    public attachKeyboardHandlers(elementRef: ElementRef, context: any) {
        this.detachKeyboardHandlers(); // Clean up any existing listeners

        this.ngZone.runOutsideAngular(() => {
            this.eventUnsubscribeFn = this.eventManager.addEventListener(
                elementRef.nativeElement,
                'keydown',
                (event: KeyboardEvent) => {
                    const handler = this.keyHandlers.get(event.key).bind(context);

                    if (handler) {
                        this.ngZone.run(() => handler(event));
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
