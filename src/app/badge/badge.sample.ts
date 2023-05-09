import { Component } from '@angular/core';
import { IgxAvatarComponent, IgxBadgeComponent } from 'igniteui-angular';

@Component({
    selector: 'app-badge-sample',
    styleUrls: ['badge.sample.scss'],
    templateUrl: 'badge.sample.html',
    standalone: true,
    imports: [IgxAvatarComponent, IgxBadgeComponent]
})
export class BadgeSampleComponent {}
