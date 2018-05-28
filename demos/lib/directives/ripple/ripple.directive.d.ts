import { ElementRef, NgZone, Renderer2 } from "@angular/core";
export declare class IgxRippleDirective {
    protected elementRef: ElementRef;
    protected renderer: Renderer2;
    private zone;
    rippleTarget: string;
    rippleColor: string;
    rippleDuration: number;
    centered: boolean;
    rippleDisabled: boolean;
    protected readonly nativeElement: HTMLElement;
    private rippleElementClass;
    private rippleHostClass;
    private animationFrames;
    private animationOptions;
    private _centered;
    private animationQueue;
    constructor(elementRef: ElementRef, renderer: Renderer2, zone: NgZone);
    onMouseDown(event: any): void;
    private setStyles(rippleElement, styleParams);
    private _ripple(event);
}
export declare class IgxRippleModule {
}
