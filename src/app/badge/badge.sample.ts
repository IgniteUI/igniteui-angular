import { Component, OnInit } from '@angular/core';
import { IgxAvatarComponent, IgxBadgeComponent, IgxIconService } from 'igniteui-angular';
import { caseSensitive, } from '@igniteui/material-icons-extended';

@Component({
    selector: 'app-badge-sample',
    styleUrls: ['badge.sample.scss'],
    templateUrl: 'badge.sample.html',
    standalone: true,
    imports: [IgxAvatarComponent, IgxBadgeComponent]
})
export class BadgeSampleComponent implements OnInit {
    constructor (protected _iconService: IgxIconService) {}

    public ngOnInit() {
        this._iconService.addSvgIconFromText(caseSensitive.name, caseSensitive.value, 'imx-icons');
    }
}
