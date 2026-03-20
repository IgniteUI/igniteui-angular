import { Directive, HostBinding, Input, OnInit } from '@angular/core';

enum IgxHintPosition {
    START,
    END
}

@Directive({
    selector: '[igxHint],igx-hint',
    standalone: true
})
export class IgxHintDirective implements OnInit {
    /**
     * Sets/gets whether the hint position is at the start.
     * Default value is `false`.
     *
     * @memberof IgxHintDirective
     */
    @HostBinding('class.igx-input-group__hint-item--start')
    public isPositionStart = false;
    /**
     * Sets/gets whether the hint position is at the end.
     * Default value is `false`.
     *
     * @memberof IgxHintDirective
     */
    @HostBinding('class.igx-input-group__hint-item--end')
    public isPositionEnd = false;

    private _position: IgxHintPosition = IgxHintPosition.START;
    /**
     * Sets the position of the hint.
     *
     * @memberof IgxHintDirective
     */
    @Input()
    public set position(value: string) {
        const position: IgxHintPosition = (IgxHintPosition as any)[value.toUpperCase()];
        if (position !== undefined) {
            this._position = position;
            this._applyPosition(this._position);
        }
    }
    /**
     * Gets the position of the hint.
     *
     * @memberof IgxHintDirective
     */
    public get position() {
        return this._position.toString();
    }
    /**
     * @hidden
     */
    public ngOnInit() {
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
