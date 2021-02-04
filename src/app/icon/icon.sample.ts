import { Component, OnInit } from '@angular/core';
import { IgxIconService } from 'igniteui-angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-icon-sample',
    styleUrls: ['./icon.sample.css'],
    templateUrl: 'icon.sample.html'
})
export class IconSampleComponent implements OnInit {
    constructor(public router: Router, private _iconService: IgxIconService) {}

    public ngOnInit(): void {
        // register custom svg icons
        if (!this._iconService.isSvgIconCached('contains')) {
            this._iconService.addSvgIcon('contains', '/assets/svg/filtering/contains.svg', 'svg-flags');
        }
        if (!this._iconService.isSvgIconCached('does_not_contain')) {
            this._iconService.addSvgIcon('does_not_contain', '/assets/svg/filtering/does_not_contain.svg', 'svg-flags');
        }
        if (!this._iconService.isSvgIconCached('does_not_equal')) {
            this._iconService.addSvgIcon('does_not_equal', '/assets/svg/filtering/does_not_equal.svg', 'svg-flags');
        }
        if (!this._iconService.isSvgIconCached('ends_with')) {
            this._iconService.addSvgIcon('ends_with', '/assets/svg/filtering/ends_with.svg', 'svg-flags');
        }
        if (!this._iconService.isSvgIconCached('equals')) {
            this._iconService.addSvgIcon('equals', '/assets/svg/filtering/equals.svg', 'svg-flags');
        }
        if (!this._iconService.isSvgIconCached('is_empty')) {
            this._iconService.addSvgIcon('is_empty', '/assets/svg/filtering/is_empty.svg', 'svg-flags');
        }
        if (!this._iconService.isSvgIconCached('starts_with')) {
            this._iconService.addSvgIcon('starts_with', '/assets/svg/filtering/starts_with.svg', 'svg-flags');
        }
    }
}
