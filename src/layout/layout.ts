import { Directive, HostBinding, Input, NgModule } from '@angular/core';


@Directive({
    selector: '[layout]'
})
export class LayoutDirective {

    @Input() dir: string = "row";
    @Input() reverse: boolean = false;
    @Input() wrap: string = "nowrap";
    @Input() justify: string = "flex-start";
    @Input() itemAlign: string = "flex-start";

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
    selector: '[flex]'
})
export class FlexDirective {
    @Input() grow: number = 1;
    @Input() shrink: number = 1;
    @Input() flex: string;
    @Input() order: number = 0;

    @HostBinding('style.flex')
    get style() {
        return `${this.grow} ${this.shrink}`;
    }

    @HostBinding('style.order')
    get itemorder() {
        return this.order || 0;
    }
}

@NgModule({
    declarations: [LayoutDirective, FlexDirective],
    exports: [FlexDirective, LayoutDirective]
})
export class IgLayout {}