import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { IgxScrollInertiaDirective } from '../scroll-inertia/scroll_inertia.directive';

@Component({
    selector: 'igx-display-container',
    template: `
        <ng-template
            #display_container
            igxScrollInertia
            [IgxScrollInertiaScrollContainer]="scrollContainer"
            [IgxScrollInertiaDirection]="scrollDirection">
        </ng-template>
    `
})
export class DisplayContainerComponent {
    @ViewChild('display_container', { read: ViewContainerRef, static: true })
    public _vcr;

    @ViewChild('display_container', { read: IgxScrollInertiaDirective, static: true })
    public _scrollInertia: IgxScrollInertiaDirective;

    @HostBinding('class')
    public cssClass = 'igx-display-container';

    @HostBinding('class.igx-display-container--inactive')
    public notVirtual = true;

    public scrollDirection: string;

    public scrollContainer;

    constructor(public cdr: ChangeDetectorRef, public _viewContainer: ViewContainerRef) { }
}
