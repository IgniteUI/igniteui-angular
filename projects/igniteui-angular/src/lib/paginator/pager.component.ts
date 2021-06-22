import { Component, Host, HostBinding, Input } from '@angular/core';
import { IgxPaginatorComponent } from './paginator.component';

@Component({
    selector: 'igx-page-nav',
    templateUrl: 'pager.component.html',
})
export class IgxPageNavigationComponent {
    /**
     * @internal
     * @hidden
     */
    @HostBinding('class.igx-page-nav')
    public cssClass = 'igx-page-nav';

    /**
     * An @Input property that sets the `role` attribute of the element.
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'navigation';

    constructor(@Host() public paginator: IgxPaginatorComponent) { }
}
