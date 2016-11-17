import { Directive, HostBinding, Input, NgModule } from '@angular/core';


@Directive({
    selector: '[igxLayout]'
})
export class IgxLayoutDirective {

    @Input("igxLayoutDir") dir: string = "row";
    @Input("igxLayoutReverse") reverse: boolean = false;
    @Input("igxLayoutWrap") wrap: string = "nowrap";
    @Input("igxLayoutJustify") justify: string = "flex-start";
    @Input("igxLayoutItemAlign") itemAlign: string = "flex-start";

    @HostBinding('style.display') display = 'flex';
    @HostBinding('style.flex-wrap') get flexwrap() { return this.wrap; }
    @HostBinding('style.justify-content') get justifycontent() { return this.justify; }
    @HostBinding('style.align-content') get align() { return this.itemAlign; }

    @HostBinding('style.flex-direction')
    get direction() {
        if (this.reverse) {
            return (this.dir == 'row') ? 'row-reverse' : 'column-reverse';
        }
        return (this.dir == 'row') ? 'row' : 'column';
    }
}

@Directive({
    selector: '[igxFlex]'
})
export class IgxFlexDirective {
    @Input("igxFlexGrow") grow: number = 1;
    @Input("igxFlexShrink") shrink: number = 1;
    @Input("igxFlex") flex: string = "";
    @Input("igxFlexOrder") order: number = 0;


    @HostBinding('style.flex')
    get style() {
        if (this.flex) {
            return `${this.flex}`;
        }
        return `${this.grow} ${this.shrink}`;
    }

    @HostBinding('style.order')
    get itemorder() {
        return this.order || 0;
    }
}

@NgModule({
    declarations: [IgxLayoutDirective, IgxFlexDirective],
    exports: [IgxFlexDirective, IgxLayoutDirective]
})
export class IgxLayout {}