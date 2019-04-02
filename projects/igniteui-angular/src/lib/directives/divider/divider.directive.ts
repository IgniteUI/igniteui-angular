import { Directive, HostBinding, NgModule, Input } from '@angular/core';

export enum IgxDividerType {
    DEFAULT = 'default',
    INSET = 'inset',
    VERTICAL = 'vertical',
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'igx-divider'
})
export class IgxDividerDirective {
    @Input('offset')
    private _offset = '0';

    @HostBinding('class.igx-divider')
    @Input()
    public type: IgxDividerType | string = IgxDividerType.DEFAULT;

    @HostBinding('class.igx-divider--dashed')
    @Input()
    public dashed = false;

    @HostBinding('class.igx-divider--inset')
    get isInset() {
        return this.type === IgxDividerType.INSET;
    }

    get isDefault() {
        return this.type === IgxDividerType.DEFAULT;
    }

    @HostBinding('class.igx-divider--vertical')
    get isVertical() {
        return this.type === IgxDividerType.VERTICAL;
    }

    @HostBinding('style.margin')
    set offset(value: string) {
        this._offset = value;
    }

    get offset() {
        const baseMargin = '0';

        if (this.isDefault) {
            return `${baseMargin} ${this._offset}`;
        }

        if (this.isInset) {
            return `${baseMargin} 0 ${baseMargin} ${this._offset}`;
        }

        if (this.isVertical) {
            return `${this._offset} ${baseMargin}`;
        }

        return `${baseMargin} 0`;
    }
}

@NgModule({
    declarations: [IgxDividerDirective],
    exports: [IgxDividerDirective]
})
export class IgxDividerModule { }
