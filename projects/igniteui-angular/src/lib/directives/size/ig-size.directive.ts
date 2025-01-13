import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[igSize]',
})

export class IgSizeDirective {
    private _size: string;

    @HostBinding('style.--ig-size')
    public get styleValue(): string {
        return this._size;
    }

    @Input('igSize')
    public set igSize(value: 'small' | 'medium' | 'large' | string) {
        if (value === 'small' || value === 'medium' || value === 'large') {
            this._size = `var(--ig-size-${value})`;
        } else {
            console.warn(`Invalid size "${value}" provided. Expected 'small', 'medium', or 'large'.`);
            this._size = null; // Clear the size if invalid
        }
    }
}
