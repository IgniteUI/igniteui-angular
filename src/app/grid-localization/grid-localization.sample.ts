import { Component, OnInit, ViewChild } from '@angular/core';
import { registerLocaleData, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

import localeBG from '@angular/common/locales/bg';
import localeEN from '@angular/common/locales/en';
import localeDE from '@angular/common/locales/de';
import localeES from '@angular/common/locales/es';
import localeFR from '@angular/common/locales/fr';
import localeIT from '@angular/common/locales/it';
import localeJA from '@angular/common/locales/ja';
import localeKO from '@angular/common/locales/ko';
import localeHans from '@angular/common/locales/zh-Hans';
import localeHant from '@angular/common/locales/zh-Hant';
import localeHI from '@angular/common/locales/hi';
import { DATA } from '../shared/financialData';

import {
    IgxResourceStringsBG, IgxResourceStringsDE, IgxResourceStringsES, IgxResourceStringsFR, IgxResourceStringsIT,
    IgxResourceStringsJA, IgxResourceStringsKO, IgxResourceStringsZHHANS, IgxResourceStringsZHHANT
} from 'igniteui-angular-i18n';
import { IResourceStrings, GridResourceStringsEN, IgxColumnComponent, IgxGridComponent, IgxSelectComponent, IgxSelectItemComponent, IgxGridToolbarComponent, IgxGridToolbarTitleComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-localization',
    styleUrls: ['./grid-localization.sample.scss'],
    templateUrl: 'grid-localization.sample.html',
    imports: [IgxGridComponent, IgxColumnComponent, IgxGridToolbarComponent, IgxGridToolbarTitleComponent, IgxSelectComponent, FormsModule, NgFor, IgxSelectItemComponent]
})

export class GridLocalizationSampleComponent implements OnInit {
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public data: any[];
    public locale: string;
    public locales: { type: string, resource: IResourceStrings }[];
    public selectLocales = ['HI', 'BG', 'EN', 'DE', 'ES', 'FR', 'IT', 'JA', 'KO', 'zh-Hans', 'zh-Hant'];
    public cashedLocalizationEN: IResourceStrings;
    public partialCustomHindi: IResourceStrings;

    constructor() { }
    public ngOnInit(): void {
        registerLocaleData(localeBG);
        registerLocaleData(localeEN);
        registerLocaleData(localeDE);
        registerLocaleData(localeES);
        registerLocaleData(localeFR);
        registerLocaleData(localeIT);
        registerLocaleData(localeJA);
        registerLocaleData(localeKO);
        registerLocaleData(localeHans);
        registerLocaleData(localeHant);
        registerLocaleData(localeHI);
        this.data = DATA;
        this.cashedLocalizationEN = Object.assign({}, GridResourceStringsEN);
        // Creating a custom locale (HI) for specific grid strings.
        // Similarly can localize all needed strings in a separate IgxResourceStringsHI file (feel free to contribute)
        this.partialCustomHindi = {
            igx_grid_summary_count: 'गणना',
            igx_grid_summary_min: 'न्यून',
            igx_grid_summary_max: 'अधिक',
            igx_grid_summary_sum: 'योग',
            igx_grid_summary_average: 'औसत'
        };

        this.locales = [
            { type: 'BG', resource: IgxResourceStringsBG },
            { type: 'DE', resource: IgxResourceStringsDE },
            { type: 'ES', resource: IgxResourceStringsES },
            { type: 'FR', resource: IgxResourceStringsFR },
            { type: 'IT', resource: IgxResourceStringsIT },
            { type: 'JA', resource: IgxResourceStringsJA },
            { type: 'KO', resource: IgxResourceStringsKO },
            { type: 'zh-Hans', resource: IgxResourceStringsZHHANS },
            { type: 'zh-Hant', resource: IgxResourceStringsZHHANT },
            { type: 'EN', resource: this.cashedLocalizationEN },
            { type: 'HI', resource: this.partialCustomHindi }
        ];

        this.locale = 'EN';
    }

    public updateLocale() {
        const newLocale = this.locales.find(x => x.type === this.locale).resource;
        this.grid.resourceStrings = newLocale;
    }
}
