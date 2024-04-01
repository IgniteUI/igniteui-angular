import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { IgxButtonDirective, IgxIconComponent, IgxIconService } from 'igniteui-angular';

@Component({
    selector: 'app-icon-sample',
    styleUrls: ['./icon.sample.scss'],
    templateUrl: 'icon.sample.html',
    standalone: true,
    imports: [IgxIconComponent, IgxButtonDirective]
})
export class IconSampleComponent implements OnInit {
    constructor(private _iconService: IgxIconService, public router: Router) {}

    public ngOnInit(): void {
        this._iconService.mapIcons('default', 'accessible', { familyAlias: 'svg-flags', name: 'copy' });

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
}
