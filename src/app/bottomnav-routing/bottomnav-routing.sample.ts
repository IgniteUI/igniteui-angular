import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkActive, RouterLink } from '@angular/router';
import { IgxBottomNavComponent, IgxBottomNavHeaderComponent, IgxBottomNavHeaderIconDirective, IgxBottomNavHeaderLabelDirective, IgxBottomNavItemComponent, IgxIconComponent } from 'igniteui-angular';

@Component({
    selector: 'app-bottomnav-routing-sample',
    styleUrls: ['bottomnav-routing.sample.scss'],
    templateUrl: 'bottomnav-routing.sample.html',
    imports: [RouterOutlet, IgxBottomNavComponent, IgxBottomNavItemComponent, RouterLinkActive, IgxBottomNavHeaderComponent, RouterLink, IgxIconComponent, IgxBottomNavHeaderIconDirective, IgxBottomNavHeaderLabelDirective]
})
export class BottomNavRoutingSampleComponent {
}
