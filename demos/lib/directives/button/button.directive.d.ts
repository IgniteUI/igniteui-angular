import { ElementRef, Renderer2 } from "@angular/core";
export declare class IgxButtonDirective {
    private _el;
    private _renderer;
    private _type;
    private _cssClass;
    private _color;
    private _label;
    private _backgroundColor;
    constructor(_el: ElementRef, _renderer: Renderer2);
    role: string;
    type: string;
    color: string;
    background: string;
    label: string;
    disabled: any;
}
export declare class IgxButtonModule {
}
