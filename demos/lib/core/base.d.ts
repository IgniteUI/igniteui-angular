import { Renderer } from "@angular/core";
export declare class BaseComponent {
    protected renderer: Renderer;
    id: string;
    constructor(renderer: Renderer);
    protected getChild(selector: string): HTMLElement;
}
