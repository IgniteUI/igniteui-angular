import { Component, Host, HostBinding} from '@angular/core';
import { IgxPaginatorComponent } from './paginator.component';

@Component({
    selector: 'igx-page-size',
    templateUrl: 'page_size_selector.component.html',
})
export class IgxPageSizeSelectorComponent {
    /**
     * @internal
     * @hidden
     */
    @HostBinding('class.igx-page-size')
    public cssClass = 'igx-page-size';

    constructor(@Host() public paginator: IgxPaginatorComponent) {}
}
