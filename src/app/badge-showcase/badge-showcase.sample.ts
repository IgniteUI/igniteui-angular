import { Component } from '@angular/core';
import { IgxBadgeComponent } from 'igniteui-angular';
import { defineComponents, IgcBadgeComponent } from "igniteui-webcomponents";

defineComponents(IgcBadgeComponent);

@Component({
    selector: 'app-badge-showcase-sample',
    styleUrls: ['badge-showcase.sample.scss'],
    templateUrl: 'badge-showcase.sample.html',
    standalone: true,
    imports: [IgxBadgeComponent]
})
export class BadgeShowcaseSampleComponent {}
