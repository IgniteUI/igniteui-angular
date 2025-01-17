import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[igSize]',
})
export class IgSizeDirective {
    @Input('igSize')
    size: 'small' | 'medium' | 'large' = 'medium';

    @HostBinding('style.--ig-size')
    public get styleValue(): string {
      return `var(--ig-size-${this.size})`;
    }
}
