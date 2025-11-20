import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[igSize]',
})
export class IgSizeDirective {
    private _size: string;

    @Input()
    @HostBinding('style.--ig-size')
    public get igSize(): string {
        return this._size;
    }

    public set igSize(value: 'small' | 'medium' | 'large') {
        this._size = `var(--ig-size-${value})`;
    }
}
