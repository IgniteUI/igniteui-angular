import { Directive, ElementRef, HostBinding, Input, Renderer2 } from "@angular/core";

enum IgxHintPosition {
    start = `start` as any,
    end = `end` as any
}

@Directive({
    selector: "igx-hint,[igxHint]"
})
export class IgxHintDirective {
    private _position: IgxHintPosition;

    constructor(private _element: ElementRef, private _renderer: Renderer2) { }

    @Input("position")
    set position(value: string) {
        let position: IgxHintPosition = (IgxHintPosition as any)[value];
        if (position === undefined) {
            position = IgxHintPosition.start;
        }

        this._position = position;
        this._renderer.addClass(this._element.nativeElement, `igx-input-group__hint-item--${position}`);
    }
    get position() {
        return this._position.toString();
    }
}
