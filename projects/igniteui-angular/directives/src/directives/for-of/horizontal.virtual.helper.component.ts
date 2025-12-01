import { Component, HostBinding, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { VirtualHelperBaseDirective } from './base.helper.component';

/**
 * @hidden
 */
@Component({
    selector: 'igx-horizontal-virtual-helper',
    template: '<div #horizontal_container class="igx-vhelper__placeholder-content" [style.width.px]="size"></div>',
    standalone: true
})
export class HVirtualHelperComponent extends VirtualHelperBaseDirective {
    @ViewChild('horizontal_container', { read: ViewContainerRef, static: true }) public _vcr;

    @Input() public width: number;

    @HostBinding('class')
    public cssClasses = 'igx-vhelper--horizontal';

    protected override restoreScroll() {
        this.nativeElement.scrollLeft = this.scrollAmount;
    }
}
