import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Router } from '@angular/router';
import { IgxButtonDirective, IgxIconComponent, IgxIconService } from 'igniteui-angular';
import { ThemedIconComponent } from './ThemedComponent/themed-icon.component';

@Component({
    selector: 'app-icon-sample',
    styleUrls: ['./icon.sample.scss'],
    templateUrl: 'icon.sample.html',
    encapsulation: ViewEncapsulation.None,
    imports: [IgxIconComponent, IgxButtonDirective, ThemedIconComponent]
})
export class IconSampleComponent implements OnInit {
    constructor(private _iconService: IgxIconService, public router: Router) {}

    public ngOnInit(): void {
        this._iconService.addIconRef('accessible', 'default', { family: 'material', name: 'rain', type: 'svg'});

        // register custom svg icons
        this._iconService.addSvgIcon('contains', '/assets/svg/filtering/contains.svg', 'svg-flags');
        this._iconService.addSvgIcon('does_not_contain', '/assets/svg/filtering/does_not_contain.svg', 'svg-flags');
        this._iconService.addSvgIcon('does_not_equal', '/assets/svg/filtering/does_not_equal.svg', 'svg-flags');
        this._iconService.addSvgIcon('ends_with', '/assets/svg/filtering/ends_with.svg', 'svg-flags');
        this._iconService.addSvgIcon('equals', '/assets/svg/filtering/equals.svg', 'svg-flags');
        this._iconService.addSvgIcon('is_empty', '/assets/svg/filtering/is_empty.svg', 'svg-flags');
        this._iconService.addSvgIcon('starts_with', '/assets/svg/filtering/starts_with.svg', 'svg-flags');
        this._iconService.addSvgIcon('copy', '/assets/svg/filtering/copy.svg', 'svg-flags', true);
    }

    public changeIcon() {
        this._iconService.setIconRef('accessible', 'default', { family: 'fa-solid', name: 'car' });
    }
}
