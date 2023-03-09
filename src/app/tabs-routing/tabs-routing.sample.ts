import { Component } from '@angular/core';
import { Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

import { IgxBottomNavHeaderIconDirective, IgxBottomNavHeaderLabelDirective } from '../../../projects/igniteui-angular/src/lib/tabs/bottom-nav/bottom-nav.directives';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxButtonGroupComponent } from '../../../projects/igniteui-angular/src/lib/buttonGroup/buttonGroup.component';
import { ITabsSelectedItemChangeEventArgs } from '../../../projects/igniteui-angular/src/lib/tabs/public_api';
import { IgxTabHeaderComponent, IgxTabItemComponent, IgxTabsComponent } from '../../../projects/igniteui-angular/src/lib/tabs/tabs/public_api';

@Component({
    selector: 'app-tabs-routing-sample',
    styleUrls: ['tabs-routing.sample.css'],
    templateUrl: 'tabs-routing.sample.html',
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxTabsComponent, IgxTabItemComponent, RouterLinkActive, IgxTabHeaderComponent, RouterLink, IgxIconComponent, IgxBottomNavHeaderIconDirective, IgxBottomNavHeaderLabelDirective, RouterOutlet]
})
export class TabsRoutingSampleComponent {
    public contacts: any[] = [{
        avatar: 'assets/images/avatar/1.jpg',
        favorite: true,
        key: '1',
        link: '#',
        phone: '770-504-2217',
        text: 'Terrance Orta'
    }, {
        avatar: 'assets/images/avatar/2.jpg',
        favorite: false,
        key: '2',
        link: '#',
        phone: '423-676-2869',
        text: 'Richard Mahoney'
    }, {
        avatar: 'assets/images/avatar/3.jpg',
        favorite: false,
        key: '3',
        link: '#',
        phone: '859-496-2817',
        text: 'Donna Price'
    }, {
        avatar: 'assets/images/avatar/4.jpg',
        favorite: false,
        key: '4',
        link: '#',
        phone: '901-747-3428',
        text: 'Lisa Landers'
    }];

    constructor(private router: Router) {
    }

    public clickHandler0() {
        this.router.navigateByUrl('/tabs-routing');
    }

    public clickHandler1() {
        this.router.navigateByUrl('/tabs-routing/view1');
    }

    public clickHandler2() {
        this.router.navigateByUrl('/tabs-routing/view2');
    }

    public clickHandler3() {
        this.router.navigateByUrl('/tabs-routing/view3');
    }

    public selectedItemChanged(event: ITabsSelectedItemChangeEventArgs) {
        console.log(event);
    }
}

