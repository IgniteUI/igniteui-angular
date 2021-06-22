import { Component, Host } from '@angular/core';
import { IgxPaginatorComponent } from './paginator.component';

@Component({
    selector: 'igx-page-nav',
    templateUrl: 'pager.component.html',
})
export class IgxPageNavigationComponent {

    constructor(@Host() public paginator: IgxPaginatorComponent) { }
}
