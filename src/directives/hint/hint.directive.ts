import { Directive, ElementRef, HostBinding, Input, OnInit } from "@angular/core";

enum IgxHintPosition {
    START,
    END
}

@Directive({
    selector: "igx-hint,[igxHint]"
})
export class IgxHintDirective implements OnInit {
    private _position: IgxHintPosition = IgxHintPosition.START;

    @HostBinding("class.igx-input-group__hint-item--start")
    public isPositionStart = false;

    @HostBinding("class.igx-input-group__hint-item--end")
    public isPositionEnd = false;

    constructor(private _element: ElementRef) {
    }

    @Input("position")
    set position(value: string) {
        const position: IgxHintPosition = (IgxHintPosition as any)[value.toUpperCase()];
        if (position !== undefined) {
            this._position = position;
            this._applyPosition(this._position);
        }
    }
    get position() {
        return this._position.toString();
    }

    ngOnInit() {
        this._applyPosition(this._position);
    }

    private _applyPosition(position: IgxHintPosition) {
        this.isPositionStart = this.isPositionEnd = false;
        switch (position) {
            case IgxHintPosition.START:
                this.isPositionStart = true;
                break;
            case IgxHintPosition.END:
                this.isPositionEnd = true;
                break;
            default: break;
        }
    }
}
