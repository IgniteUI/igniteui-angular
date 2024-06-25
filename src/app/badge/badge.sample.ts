import { Component, OnInit } from '@angular/core';
import { IgxAvatarComponent, IgxBadgeComponent, IgxIconService, IgxIconComponent } from 'igniteui-angular';
import { heartMonitor } from '@igniteui/material-icons-extended';

@Component({
    selector: 'app-badge-sample',
    styleUrls: ['badge.sample.scss'],
    templateUrl: 'badge.sample.html',
    standalone: true,
    imports: [IgxAvatarComponent, IgxBadgeComponent, IgxIconComponent]
})
export class BadgeSampleComponent implements OnInit {
    constructor (protected _iconService: IgxIconService) {}

    public ngOnInit() {
        this._iconService.addSvgIconFromText(heartMonitor.name, heartMonitor.value, 'imx-icons');
    }
}
