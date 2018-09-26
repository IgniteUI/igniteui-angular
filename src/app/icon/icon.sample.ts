import { Component, OnInit } from '@angular/core';
import { IgxIconService } from 'igniteui-angular';

@Component({
    selector: 'app-icon-sample',
    styleUrls: ['./icon.sample.css'],
    templateUrl: 'icon.sample.html'
})
export class IconSampleComponent implements OnInit {
    constructor (private _iconService: IgxIconService) {}

    ngOnInit(): void {
        // register custom svg icons
        this._iconService.addSvgIcon('aruba', '/assets/svg/country_flags/aruba.svg', 'svg-flags');
        this._iconService.addSvgIcon('bulgaria', '/assets/svg/country_flags/bulgaria.svg', 'svg-flags');
        this._iconService.addSvgIcon('cape-verde', '/assets/svg/country_flags/cape-verde.svg', 'svg-flags');
        this._iconService.addSvgIcon('ceuta', '/assets/svg/country_flags/ceuta.svg', 'svg-flags');
        this._iconService.addSvgIcon('cocos-island', '/assets/svg/country_flags/cocos-island.svg', 'svg-flags');
        this._iconService.addSvgIcon('curacao', '/assets/svg/country_flags/curacao.svg', 'svg-flags');
        this._iconService.addSvgIcon('kiribati', '/assets/svg/country_flags/kiribati.svg', 'svg-flags');
        this._iconService.addSvgIcon('madagascar', '/assets/svg/country_flags/madagascar.svg', 'svg-flags');
        this._iconService.addSvgIcon('north-korea', '/assets/svg/country_flags/north-korea.svg', 'svg-flags');
        this._iconService.addSvgIcon('tokelau', '/assets/svg/country_flags/tokelau.svg', 'svg-flags');
    }
}
