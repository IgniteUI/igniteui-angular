import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    ViewChild,
    ViewContainerRef
} from '@angular/core';

@Component({
    selector: 'igx-display-container',
    template: '<ng-template #display_container igxScrollInertia [IgxScrollInertiaScrollContainer]="scrollContainer"></ng-template>'
})
export class DisplayContainerComponent {
    @ViewChild('display_container', { read: ViewContainerRef })
    public _vcr;

    @HostBinding('class')
    public cssClass = 'igx-display-container';

    @HostBinding('class.igx-display-container--inactive')
    public notVirtual = true;

    public scrollContainer;

    constructor(public cdr: ChangeDetectorRef, public _viewContainer: ViewContainerRef) { }
}
