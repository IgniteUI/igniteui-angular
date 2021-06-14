import { Component, Host } from '@angular/core';
import { IgxPaginatorComponent } from './paginator.component';

@Component({
    selector: 'igx-pager',
    templateUrl: 'pager.component.html',
})
export class IgxPagerComponent {

    constructor(@Host() public paginator: IgxPaginatorComponent) { }
}
