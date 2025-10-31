import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { formatDate, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import {
    IResourceStrings,
    GridResourceStringsEN,
    IgxColumnComponent,
    IgxGridComponent,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxGridToolbarComponent,
    IgxGridToolbarTitleComponent,
    IgxPaginatorComponent,
    changei18n,
    registerI18n,
    setCurrentI18n,
    IgxGridPinningActionsComponent,
    IgxGridEditingActionsComponent,
    IgxActionStripComponent
} from 'igniteui-angular';
import { getDateFormatter } from 'igniteui-i18n-core';
import { toggleIgxAngularLocalization } from 'igniteui-angular/src/lib/core/i18n/resources';

@Component({
    selector: 'app-grid-localization',
    styleUrls: ['./grid-localization.sample.scss'],
    templateUrl: 'grid-localization.sample.html',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        IgxGridComponent,
        IgxColumnComponent,
        IgxGridToolbarComponent,
        IgxGridToolbarTitleComponent,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxPaginatorComponent,
        IgxGridPinningActionsComponent,
        IgxGridEditingActionsComponent,
        IgxActionStripComponent
    ]
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
    public inputValue;

    constructor() { }
    public ngOnInit(): void {
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

        // Old way by Angular
        // registerLocaleData(localeBG);
        // registerLocaleData(localeDE);
        // registerLocaleData(localeES);
        // registerLocaleData(localeFR);
        // registerLocaleData(localeIT);
        // registerLocaleData(localeJA);
        // registerLocaleData(localeKO);
        // registerLocaleData(localeHans);
        // registerLocaleData(localeHant);
        // registerLocaleData(localeHI);

        // New API
        registerI18n(IgxResourceStringsBG, 'bg');
        registerI18n(IgxResourceStringsDE, 'de');
        registerI18n(IgxResourceStringsES, 'es');
        registerI18n(IgxResourceStringsFR, 'fr');
        registerI18n(IgxResourceStringsIT, 'it');
        registerI18n(IgxResourceStringsJA, 'ja');
        registerI18n(IgxResourceStringsKO, 'ko');
        registerI18n(IgxResourceStringsZHHANS, 'zh-Hans');
        registerI18n(IgxResourceStringsZHHANT, 'zh-Hant');

        toggleIgxAngularLocalization(false);
    }

    public updateLocale() {
        const newLocale = this.locales.find(x => x.type === this.locale).resource;
        // Manual assign of resource strings.
        //this.grid.resourceStrings = newLocale;

        // Old API
        // changei18n(newLocale);

        // New API
        setCurrentI18n(this.locale);
    }

    public onButtonClick() {
        console.log("Old: " + formatDate(new Date("10/10/1993"), this.inputValue, this.locale));
        console.log("New: " + getDateFormatter().formatDateCustomFormat(new Date("10/10/1993"), this.inputValue, { locale:  this.locale }));
    }
}
