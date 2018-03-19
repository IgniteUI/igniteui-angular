import { Directive, ElementRef, HostBinding, Input, Renderer2 } from "@angular/core";

enum IgxHintPosition {
    start = `start` as any,
    end = `end` as any
}

@Directive({
    selector: "igx-hint,[igxHint]"
})
export class IgxHintDirective {
    constructor(private _element: ElementRef, private _renderer: Renderer2) { }

    @HostBinding("class.igx-input-group__hint")
    public defaultClass = true;

    @Input("position") set position(value: string) {
        let position: IgxHintPosition = (IgxHintPosition as any)[value];
        if (position === undefined) {
            position = IgxHintPosition.start;
        }

        this._renderer.addClass(this._element.nativeElement, `igx-input-group__hint-item--${position}`);
    }
}
