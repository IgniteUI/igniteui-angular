import { Component, Host} from '@angular/core';
import { IgxPaginatorComponent } from './paginator.component';

@Component({
    selector: 'igx-page-size',
    templateUrl: 'page_size_selector.component.html',
})
export class IgxPageSizeSelectorComponent {

    constructor(@Host() public paginator: IgxPaginatorComponent) {}

}
