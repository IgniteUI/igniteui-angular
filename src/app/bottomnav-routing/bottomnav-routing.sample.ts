import { Component } from '@angular/core';
import { IgxBottomNavHeaderIconDirective, IgxBottomNavHeaderLabelDirective } from '../../../projects/igniteui-angular/src/lib/tabs/bottom-nav/bottom-nav.directives';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxBottomNavHeaderComponent } from '../../../projects/igniteui-angular/src/lib/tabs/bottom-nav/bottom-nav-header.component';
import { IgxBottomNavItemComponent } from '../../../projects/igniteui-angular/src/lib/tabs/bottom-nav/bottom-nav-item.component';
import { IgxBottomNavComponent } from '../../../projects/igniteui-angular/src/lib/tabs/bottom-nav/bottom-nav.component';
import { RouterOutlet, RouterLinkActive, RouterLink } from '@angular/router';

@Component({
    selector: 'app-bottomnav-routing-sample',
    styleUrls: ['bottomnav-routing.sample.scss'],
    templateUrl: 'bottomnav-routing.sample.html',
    standalone: true,
    imports: [RouterOutlet, IgxBottomNavComponent, IgxBottomNavItemComponent, RouterLinkActive, IgxBottomNavHeaderComponent, RouterLink, IgxIconComponent, IgxBottomNavHeaderIconDirective, IgxBottomNavHeaderLabelDirective]
})
export class BottomNavRoutingSampleComponent {
}
