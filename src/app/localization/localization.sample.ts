import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DATA } from '../shared/financialData';

import {
    IgxResourceStringsBG, IgxResourceStringsDE, IgxResourceStringsES, IgxResourceStringsFR, IgxResourceStringsIT,
    IgxResourceStringsJA, IgxResourceStringsKO, IgxResourceStringsZHHANS, IgxResourceStringsZHHANT
} from 'igniteui-angular-i18n';
import { IResourceStrings, GridResourceStringsEN, IgxColumnComponent, IgxGridComponent, IgxSelectComponent, IgxSelectItemComponent, IgxGridToolbarComponent, IgxPaginatorComponent, IgxGridPinningActionsComponent, IgxGridEditingActionsComponent, IgxActionStripComponent, IgxGridToolbarExporterComponent, IgxGridToolbarAdvancedFilteringComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxGridToolbarActionsComponent, IgxBannerComponent, IgxCalendarComponent, IgxCarouselComponent, IgxSlideComponent, IgxChipComponent, IgxComboComponent, IgxDatePickerComponent, IgxDateRangePickerComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxRowIslandComponent, IgxGridToolbarDirective, IgxPivotGridComponent, IgxPivotDataSelectorComponent, GridColumnDataType, IgxPivotDateDimension, IgxPivotNumericAggregate, IPivotConfiguration } from 'igniteui-angular';
import { setCurrentI18n, registerI18n, ResourceStringsEN } from 'igniteui-i18n-core';
import { ResourceStringsBG, ResourceStringsDE, ResourceStringsES, ResourceStringsFR, ResourceStringsIT, ResourceStringsJA, ResourceStringsKO, ResourceStringsZHHANS, ResourceStringsZHHANT } from 'igniteui-i18n-resources';
import { toggleIgxAngularLocalization } from 'igniteui-angular/src/lib/core/i18n/resources';

@Component({
    selector: 'app-localization',
    styleUrls: ['./localization.sample.scss'],
    templateUrl: 'localization.sample.html',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        IgxGridComponent,
        IgxColumnComponent,
        IgxGridToolbarComponent,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxPaginatorComponent,
        IgxGridPinningActionsComponent,
        IgxGridEditingActionsComponent,
        IgxActionStripComponent,
        IgxGridToolbarExporterComponent,
        IgxGridToolbarAdvancedFilteringComponent,
        IgxGridToolbarHidingComponent,
        IgxGridToolbarPinningComponent,
        IgxGridToolbarActionsComponent,
        IgxBannerComponent,
        IgxCalendarComponent,
        IgxCarouselComponent,
        IgxSlideComponent,
        IgxChipComponent,
        IgxComboComponent,
        IgxDatePickerComponent,
        IgxDateRangePickerComponent,
        IgxTreeGridComponent,
        IgxHierarchicalGridComponent,
        IgxRowIslandComponent,
        IgxGridToolbarDirective,
        IgxPivotGridComponent,
        IgxPivotDataSelectorComponent
    ]
})

export class LocalizationSampleComponent implements OnInit {
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild(IgxBannerComponent, { static: true })
    public banner: IgxBannerComponent;

    public data: any[];
    public locale: string;
    public locales: { type: string, resource: IResourceStrings }[];
    public selectLocales = ['HI', 'BG', 'EN', 'DE', 'ES', 'FR', 'IT', 'JA', 'KO', 'zh-Hans', 'zh-Hant'];
    public cashedLocalizationEN: IResourceStrings;
    public partialCustomHindi: IResourceStrings;
    public inputValue;

    public slides = [
        {
            src: 'https://www.infragistics.com/angular-demos-lob/assets/images/carousel/ignite-ui-angular-indigo-design.png'
        },
        {
            src: 'https://www.infragistics.com/angular-demos-lob/assets/images/carousel/slider-image-chart.png'
        },
        {
            src: 'https://www.infragistics.com/angular-demos-lob/assets/images/carousel/ignite-ui-angular-charts.png'
        }
    ];

    public lData = [
        { id: 1, name: 'India' },
        { id: 2, name: 'USA' },
        { id: 3, name: 'UK' },
        { id: 4, name: 'Germany' },
        { id: 5, name: 'France' }
    ];

    public tgData = [
        {
            Address: 'Obere Str. 57',
            Age: 55,
            City: 'Berlin',
            Country: 'Germany',
            Fax: '030-0076545',
            HireDate: new Date(2008, 3, 20),
            ID: 1,
            Name: 'Johnathan Winchester',
            ParentID: -1,
            Phone: '030-0074321',
            PostalCode: '12209',
            Title: 'Development Manager'
        },
        {
            Address: 'Avda. de la Constitución 2222',
            Age: 42,
            City: 'México D.F.',
            Country: 'Mexico',
            Fax: '(5) 555-3745',
            HireDate: new Date(2014, 1, 22),
            ID: 4,
            Name: 'Ana Sanders',
            ParentID: -1,
            Phone: '(5) 555-4729',
            PostalCode: '05021',
            Title: 'CEO'
        },
        {
            Address: 'Mataderos 2312',
            Age: 49,
            City: 'México D.F.',
            Country: 'Mexico',
            Fax: '(5) 555-3995',
            HireDate: new Date(2014, 1, 22),
            ID: 18,
            Name: 'Victoria Lincoln',
            ParentID: -1,
            Phone: '(5) 555-3932',
            PostalCode: '05023',
            Title: 'Accounting Manager'
        },
        {
            Address: '120 Hanover Sq.',
            Age: 61,
            City: 'London',
            Country: 'UK',
            Fax: '(171) 555-6750',
            HireDate: new Date(2010, 1, 1),
            ID: 10,
            Name: 'Yang Wang',
            ParentID: -1,
            Phone: '(171) 555-7788',
            PostalCode: 'WA1 1DP',
            Title: 'Localization Manager'
        },
        {
            Address: 'Berguvsvägen 8',
            Age: 43,
            City: 'Luleå',
            Country: 'Sweden',
            Fax: '0921-12 34 67',
            HireDate: new Date(2011, 6, 3),
            ID: 3,
            Name: 'Michael Burke',
            ParentID: 1,
            Phone: '0921-12 34 65',
            PostalCode: 'S-958 22',
            Title: 'Senior Software Developer'
        },
        {
            Address: 'Forsterstr. 57',
            Age: 29,
            City: 'Mannheim',
            Country: 'Germany',
            Fax: '0621-08924',
            HireDate: new Date(2009, 6, 19),
            ID: 2,
            Name: 'Thomas Anderson',
            ParentID: 1,
            Phone: '0621-08460',
            PostalCode: '68306',
            Title: 'Senior Software Developer'
        },
        {
            Address: '24, place Kléber',
            Age: 31,
            City: 'Strasbourg',
            Country: 'France',
            Fax: '88.60.15.32',
            HireDate: new Date(2014, 8, 18),
            ID: 11,
            Name: 'Monica Reyes',
            ParentID: 1,
            Phone: '88.60.15.31',
            PostalCode: '67000',
            Title: 'Software Development Team Lead'
        }
    ];

    public hData = [{
        ID: 0,
        Artist: 'Naomí Yepes',
        Photo: 'https://staging.infragistics.com/angular-demos/assets/images/hgrid/naomi.jpg',
        Debut: 2011,
        GrammyNominations: 6,
        GrammyAwards: 0,
        HasGrammyAward: false,
        Tours: [
            {
                Tour: 'Faithful Tour',
                StartedOn: 'Sep 12',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'City Jam Sessions',
                StartedOn: 'Aug 13',
                Location: 'North America',
                Headliner: 'YES',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Christmas NYC 2013',
                StartedOn: 'Dec 13',
                Location: 'United States',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Christmas NYC 2014',
                StartedOn: 'Dec 14',
                Location: 'North America',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Watermelon Tour',
                StartedOn: 'Feb 15',
                Location: 'Worldwide',
                Headliner: 'YES',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Christmas NYC 2016',
                StartedOn: 'Dec 16',
                Location: 'United States',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'The Dragon Tour',
                StartedOn: 'Feb 17',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Organic Sessions',
                StartedOn: 'Aug 18',
                Location: 'United States, England',
                Headliner: 'YES',
                TouredBy: 'Naomí Yepes'
            },
            {
                Tour: 'Hope World Tour',
                StartedOn: 'Mar 19',
                Location: 'Worldwide',
                Headliner: 'NO',
                TouredBy: 'Naomí Yepes'
            }
        ],
        Albums: [
            {
                Album: 'Initiation',
                LaunchDate: new Date('September 3, 2013'),
                BillboardReview: 86,
                USBillboard200: 1,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'Ambitious',
                    Released: new Date('28 Apr 2015'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Initiation'
                },
                {
                    Number: 2,
                    Title: 'My heart will go on',
                    Released: new Date('24 May 2015'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Initiation'
                },
                {
                    Number: 3,
                    Title: 'Sing to me',
                    Released: new Date('28 May 2015'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Initiation'
                },
                {
                    Number: 4,
                    Title: 'Want to dance with somebody',
                    Released: new Date('03 Jun 2015'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Initiation'
                }]
            },
            {
                Album: 'Dream Driven',
                LaunchDate: new Date('August 25, 2014'),
                BillboardReview: 81,
                USBillboard200: 1,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'Intro',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 2,
                    Title: 'Ferocious',
                    Released: new Date('28 Apr 2014'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Dream Driven'
                },
                {
                    Number: 3,
                    Title: 'Going crazy',
                    Released: new Date('10 Feb 2015'),
                    Genre: 'Dance-pop EDM',
                    Album: 'Dream Driven'
                },
                {
                    Number: 4,
                    Title: 'Future past',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 5,
                    Title: 'Roaming like them',
                    Released: new Date('2 Jul 2014'),
                    Genre: 'Electro house Electropop',
                    Album: 'Dream Driven'
                },
                {
                    Number: 6,
                    Title: 'Last Wishes',
                    Released: new Date('12 Aug 2014'),
                    Genre: 'R&B',
                    Album: 'Dream Driven'
                },
                {
                    Number: 7,
                    Title: 'Stay where you are',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 8,
                    Title: 'Imaginarium',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 9,
                    Title: 'Tell me',
                    Released: new Date('30 Sep 2014'),
                    Genre: 'Synth-pop R&B',
                    Album: 'Dream Driven'
                },
                {
                    Number: 10,
                    Title: 'Shredded into pieces',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 11,
                    Title: 'Capture this moment',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                },
                {
                    Number: 12,
                    Title: 'Dream Driven',
                    Released: null,
                    Genre: '*',
                    Album: 'Dream Driven'
                }]
            },
            {
                Album: 'The dragon journey',
                LaunchDate: new Date('May 20, 2016'),
                BillboardReview: 60,
                USBillboard200: 2,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'My dream',
                    Released: new Date('13 Jan 2017'),
                    Genre: 'Dance-pop EDM',
                    Album: 'The dragon journey'
                },
                {
                    Number: 2,
                    Title: 'My passion',
                    Released: new Date('23 Sep 2017'),
                    Genre: 'Crunk reggaeton',
                    Album: 'The dragon journey'
                },
                {
                    Number: 3,
                    Title: 'What is love',
                    Released: new Date('28 Nov 2018'),
                    Genre: 'Dance-pop R&B',
                    Album: 'The dragon journey'
                },
                {
                    Number: 4,
                    Title: 'Negative',
                    Released: new Date('01 Dec 2018'),
                    Genre: 'Dance-pop EDM',
                    Album: 'The dragon journey'
                }]
            },
            {
                Album: 'Organic me',
                LaunchDate: new Date('August 17, 2018'),
                BillboardReview: 82,
                USBillboard200: 1,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'I Love',
                    Released: new Date('11 May 2019'),
                    Genre: 'Crunk reggaeton',
                    Album: 'Organic me'
                },
                {
                    Number: 2,
                    Title: 'Early Morning Compass',
                    Released: new Date('15 Jan 2020'),
                    Genre: 'mystical parody-bap ',
                    Album: 'Organic me'
                },
                {
                    Number: 3,
                    Title: 'Key Fields Forever',
                    Released: new Date('2 Jan 2020'),
                    Genre: 'Dance-pop EDM',
                    Album: 'Organic me'
                },
                {
                    Number: 4,
                    Title: 'Stand by Your Goblins',
                    Released: new Date('20 Nov 2019'),
                    Genre: '*',
                    Album: 'Organic me'
                },
                {
                    Number: 5,
                    Title: 'Mad to Walk',
                    Released: new Date('12 May 2019'),
                    Genre: 'Electro house Electropop',
                    Album: 'Organic me'
                },
                {
                    Number: 6,
                    Title: 'Alice\'s Waiting',
                    Released: new Date('28 Jan 2020'),
                    Genre: 'R&B',
                    Album: 'Organic me'
                },
                {
                    Number: 7,
                    Title: 'We Shall Kiss',
                    Released: new Date('30 Oct 2019'),
                    Genre: '*',
                    Album: 'Organic me'
                },
                {
                    Number: 8,
                    Title: 'Behind Single Ants',
                    Released: new Date('2 Oct 2019'),
                    Genre: '*',
                    Album: 'Organic me'
                },
                {
                    Number: 9,
                    Title: 'Soap Autopsy',
                    Released: new Date('8 Aug 2019'),
                    Genre: 'Synth-pop R&B',
                    Album: 'Organic me'
                },
                {
                    Number: 10,
                    Title: 'Have You Met Rich?',
                    Released: new Date('1 Jul 2019'),
                    Genre: 'ethno-tunes',
                    Album: 'Organic me'
                },
                {
                    Number: 11,
                    Title: 'Livin\' on a Banana',
                    Released: new Date('22 Nov 2019'),
                    Genre: 'Crunk reggaeton',
                    Album: 'Organic me'
                }]
            },
            {
                Album: 'Curiosity',
                LaunchDate: new Date('December 7, 2019'),
                BillboardReview: 75,
                USBillboard200: 12,
                Artist: 'Naomí Yepes',
                Songs: [{
                    Number: 1,
                    Title: 'Goals',
                    Released: new Date('07 Dec 2019'),
                    Genre: '*',
                    Album: 'Curiosity'
                },
                {
                    Number: 2,
                    Title: 'Explorer',
                    Released: new Date('08 Dec 2019'),
                    Genre: 'Crunk reggaeton',
                    Album: 'Curiosity'
                },
                {
                    Number: 3,
                    Title: 'I need to know',
                    Released: new Date('09 Dec 2019'),
                    Genre: 'Dance-pop R&B',
                    Album: 'Curiosity'
                },
                {
                    Number: 4,
                    Title: 'Finding my purpose',
                    Released: new Date('10 Dec 2019'),
                    Genre: 'Heavy metal',
                    Album: 'Curiosity'
                },
                {
                    Number: 5,
                    Title: 'Faster than the speed of love',
                    Released: new Date('21 Dec 2019'),
                    Genre: 'Dance-pop EDM',
                    Album: 'Curiosity'
                },
                {
                    Number: 6,
                    Title: 'I like it',
                    Released: new Date('01 Jan 2020'),
                    Genre: 'Dance-pop EDM',
                    Album: 'Curiosity'
                }]
            }
        ]
    },
    {
        ID: 1,
        Artist: 'Babila Ebwélé',
        Photo: 'https://staging.infragistics.com/angular-demos/assets/images/hgrid/babila.jpg',
        Debut: 2009,
        GrammyNominations: 0,
        GrammyAwards: 11,
        HasGrammyAward: true,
        Tours: [
            {
                Tour: 'The last straw',
                StartedOn: 'May 09',
                Location: 'Europe, Asia',
                Headliner: 'NO',
                TouredBy: 'Babila Ebwélé'
            },
            {
                Tour: 'No foundations',
                StartedOn: 'Jun 04',
                Location: 'United States, Europe',
                Headliner: 'YES',
                TouredBy: 'Babila Ebwélé'
            },
            {
                Tour: 'Crazy eyes',
                StartedOn: 'Jun 08',
                Location: 'North America',
                Headliner: 'NO',
                TouredBy: 'Babila Ebwélé'
            },
            {
                Tour: 'Zero gravity',
                StartedOn: 'Apr 19',
                Location: 'United States',
                Headliner: 'NO',
                TouredBy: 'Babila Ebwélé'
            },
            {
                Tour: 'Battle with myself',
                StartedOn: 'Mar 08',
                Location: 'North America',
                Headliner: 'YES',
                TouredBy: 'Babila Ebwélé'
            }],
        Albums: [
            {
                Album: 'Pushing up daisies',
                LaunchDate: new Date('May 31, 2000'),
                BillboardReview: 86,
                USBillboard200: 42,
                Artist: 'Babila Ebwélé',
                Songs: [{
                    Number: 1,
                    Title: 'Wood Shavings Forever',
                    Released: new Date('9 Jun 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 2,
                    Title: 'Early Morning Drive',
                    Released: new Date('20 May 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 3,
                    Title: 'Don\'t Natter',
                    Released: new Date('10 Jun 2019'),
                    Genre: 'adult calypso-industrial',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 4,
                    Title: 'Stairway to Balloons',
                    Released: new Date('18 Jun 2019'),
                    Genre: 'calypso and mariachi',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 5,
                    Title: 'The Number of your Apple',
                    Released: new Date('29 Oct 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 6,
                    Title: 'Your Delightful Heart',
                    Released: new Date('24 Feb 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 7,
                    Title: 'Nice Weather For Balloons',
                    Released: new Date('1 Aug 2019'),
                    Genre: 'rap-hop',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 8,
                    Title: 'The Girl From Cornwall',
                    Released: new Date('4 May 2019'),
                    Genre: 'enigmatic rock-and-roll',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 9,
                    Title: 'Here Without Jack',
                    Released: new Date('24 Oct 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                },
                {
                    Number: 10,
                    Title: 'Born Rancid',
                    Released: new Date('19 Mar 2019'),
                    Genre: '*',
                    Album: 'Pushing up daisies'
                }]
            },
            {
                Album: 'Death\'s dead',
                LaunchDate: new Date('June 8, 2016'),
                BillboardReview: 85,
                USBillboard200: 95,
                Artist: 'Babila Ebwélé',
                Songs: [{
                    Number: 1,
                    Title: 'Men Sound Better With You',
                    Released: new Date('20 Oct 2016'),
                    Genre: 'rap-hop',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 2,
                    Title: 'Ghost in My Rod',
                    Released: new Date('5 Oct 2016'),
                    Genre: 'enigmatic rock-and-roll',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 3,
                    Title: 'Bed of Men',
                    Released: new Date('14 Nov 2016'),
                    Genre: 'whimsical comedy-grass ',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 4,
                    Title: 'Don\'t Push',
                    Released: new Date('2 Jan 2017'),
                    Genre: 'unblack electronic-trip-hop',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 5,
                    Title: 'Nice Weather For Men',
                    Released: new Date('18 Dec 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 6,
                    Title: 'Rancid Rhapsody',
                    Released: new Date('10 Mar 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 7,
                    Title: 'Push, Push, Push!',
                    Released: new Date('21 Feb 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 8,
                    Title: 'My Name is Sarah',
                    Released: new Date('15 Nov 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 9,
                    Title: 'The Girl From My Hotel',
                    Released: new Date('6 Nov 2017'),
                    Genre: '*',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 10,
                    Title: 'Free Box',
                    Released: new Date('18 Apr 2017'),
                    Genre: 'splitter-funk',
                    Album: 'Death\'s dead'
                },
                {
                    Number: 11,
                    Title: 'Hotel Cardiff',
                    Released: new Date('30 Dec 2017'),
                    Genre: 'guilty pleasure ebm',
                    Album: 'Death\'s dead'
                }]
            }]
    },
    {
        ID: 2,
        Artist: 'Ahmad Nazeri',
        Photo: 'https://staging.infragistics.com/angular-demos/assets/images/hgrid/ahmad.jpg',
        Debut: 2004,
        GrammyNominations: 3,
        GrammyAwards: 1,
        HasGrammyAward: true,
        Tours: [],
        Albums: [
            {
                Album: 'Emergency',
                LaunchDate: new Date('March 6, 2004'),
                BillboardReview: 98,
                USBillboard200: 69,
                Artist: 'Ahmad Nazeri',
                Songs: [{
                    Number: 1,
                    Title: 'I am machine',
                    Released: new Date('20 Oct 2004'),
                    Genre: 'Heavy metal',
                    Album: 'Emergency'
                },
                {
                    Number: 2,
                    Title: 'I wish I knew',
                    Released: new Date('21 Oct 2004'),
                    Genre: 'rap-hop',
                    Album: 'Emergency'
                },
                {
                    Number: 3,
                    Title: 'How I feel',
                    Released: new Date('22 Oct 2004'),
                    Genre: 'Heavy metal',
                    Album: 'Emergency'
                },
                {
                    Number: 4,
                    Title: 'I am machine',
                    Released: new Date('30 Oct 2004'),
                    Genre: 'Heavy metal',
                    Album: 'Emergency'
                },
                {
                    Number: 5,
                    Title: 'Monsters under my bed',
                    Released: new Date('01 Nov 2004'),
                    Genre: 'rap-hop',
                    Album: 'Emergency'
                },
                {
                    Number: 6,
                    Title: 'I know what you want',
                    Released: new Date('20 Nov 2004'),
                    Genre: 'rap-hop',
                    Album: 'Emergency'
                },
                {
                    Number: 7,
                    Title: 'Lies',
                    Released: new Date('21 Nov 2004'),
                    Genre: 'Heavy metal',
                    Album: 'Emergency'
                },
                {
                    Number: 8,
                    Title: 'I did it for you',
                    Released: new Date('22 Nov 2004'),
                    Genre: 'rap-hop',
                    Album: 'Emergency'
                }]
            },
            {
                Album: 'Bursting bubbles',
                LaunchDate: new Date('April 17, 2006'),
                BillboardReview: 69,
                USBillboard200: 39,
                Artist: 'Ahmad Nazeri',
                Songs: [{
                    Number: 1,
                    Title: 'Ghosts',
                    Released: new Date('20 Apr 2006'),
                    Genre: 'Hip-hop',
                    Album: 'Bursting bubbles'
                },
                {
                    Number: 2,
                    Title: 'What goes around comes around',
                    Released: new Date('20 Apr 2006'),
                    Genre: 'Heavy metal',
                    Album: 'Bursting bubbles'
                },
                {
                    Number: 3,
                    Title: 'I want nothing',
                    Released: new Date('21 Apr 2006'),
                    Genre: 'Heavy metal',
                    Album: 'Bursting bubbles'
                },
                {
                    Number: 4,
                    Title: 'Me and you',
                    Released: new Date('22 Apr 2006'),
                    Genre: 'Rock',
                    Album: 'Bursting bubbles'
                }]
            }
        ]
    },
    {
        ID: 3,
        Artist: 'Kimmy McIlmorie',
        Photo: 'https://staging.infragistics.com/angular-demos/assets/images/hgrid/kimmy.jpg',
        Debut: 2007,
        GrammyNominations: 21,
        GrammyAwards: 3,
        HasGrammyAward: true,
        Albums: [
            {
                Album: 'Here we go again',
                LaunchDate: new Date('November 18, 2017'),
                BillboardReview: 68,
                USBillboard200: 1,
                Artist: 'Kimmy McIlmorie',
                Songs: [{
                    Number: 1,
                    Title: 'Same old love',
                    Released: new Date('20 Nov 2017'),
                    Genre: 'Hip-hop',
                    Album: 'Here we go again'
                },
                {
                    Number: 2,
                    Title: 'Sick of it',
                    Released: new Date('20 Nov 2017'),
                    Genre: 'Hip-hop',
                    Album: 'Here we go again'
                },
                {
                    Number: 3,
                    Title: 'No one',
                    Released: new Date('21 Nov 2017'),
                    Genre: 'Metal',
                    Album: 'Here we go again'
                },
                {
                    Number: 4,
                    Title: 'Circles',
                    Released: new Date('22 Nov 2017'),
                    Genre: 'Heavy metal',
                    Album: 'Here we go again'
                },
                {
                    Number: 5,
                    Title: 'Coming for you',
                    Released: new Date('30 Nov 2017'),
                    Genre: 'Hip-hop',
                    Album: 'Here we go again'
                }]
            }
        ]
    },
    {
        ID: 4,
        Artist: 'Mar Rueda',
        Photo: 'https://staging.infragistics.com/angular-demos/assets/images/hgrid/mar.jpg',
        Debut: 1996,
        GrammyNominations: 14,
        GrammyAwards: 2,
        HasGrammyAward: true,
        Albums: [
            {
                Album: 'Trouble',
                LaunchDate: new Date('November 18, 2017'),
                BillboardReview: 65,
                USBillboard200: 2,
                Artist: 'Mar Rueda',
                Songs: [{
                    Number: 1,
                    Title: 'You knew I was trouble',
                    Released: new Date('20 Nov 2017'),
                    Genre: 'Pop',
                    Album: 'Trouble'
                },
                {
                    Number: 2,
                    Title: 'Cannot live without you',
                    Released: new Date('20 Nov 2017'),
                    Genre: 'Pop',
                    Album: 'Trouble'
                },
                {
                    Number: 3,
                    Title: 'Lost you',
                    Released: new Date('21 Nov 2017'),
                    Genre: 'Metal',
                    Album: 'Trouble'
                },
                {
                    Number: 4,
                    Title: 'Happiness starts with you',
                    Released: new Date('22 Nov 2017'),
                    Genre: '*',
                    Album: 'Trouble'
                },
                {
                    Number: 5,
                    Title: 'I saw it coming',
                    Released: new Date('30 Dec 2017'),
                    Genre: 'Hip-hop',
                    Album: 'Trouble'
                }]
            }
        ]
    },
    {
        ID: 5,
        Artist: 'Izabella Tabakova',
        Photo: 'https://staging.infragistics.com/angular-demos/assets/images/hgrid/izabella.jpg',
        Debut: 2017,
        GrammyNominations: 7,
        GrammyAwards: 11,
        HasGrammyAward: true,
        Tours: [
            {
                Tour: 'Final breath',
                StartedOn: 'Jun 13',
                Location: 'Europe',
                Headliner: 'YES',
                TouredBy: 'Izabella Tabakova'
            },
            {
                Tour: 'Once bitten',
                StartedOn: 'Dec 18',
                Location: 'Australia, United States',
                Headliner: 'NO',
                TouredBy: 'Izabella Tabakova'
            },
            {
                Tour: 'Code word',
                StartedOn: 'Sep 19',
                Location: 'United States, Europe',
                Headliner: 'NO',
                TouredBy: 'Izabella Tabakova'
            },
            {
                Tour: 'Final draft',
                StartedOn: 'Sep 17',
                Location: 'United States, Europe',
                Headliner: 'YES',
                TouredBy: 'Izabella Tabakova'
            }
        ],
        Albums: [
            {
                Album: 'Once bitten',
                LaunchDate: new Date('July 16, 2007'),
                BillboardReview: 79,
                USBillboard200: 53,
                Artist: 'Izabella Tabakova',
                Songs: [{
                    Number: 1,
                    Title: 'Whole Lotta Super Cats',
                    Released: new Date('21 May 2019'),
                    Genre: '*',
                    Album: 'Once bitten'
                },
                {
                    Number: 2,
                    Title: 'Enter Becky',
                    Released: new Date('16 Jan 2020'),
                    Genre: '*',
                    Album: 'Once bitten'
                },
                {
                    Number: 3,
                    Title: 'Your Cheatin\' Flamingo',
                    Released: new Date('14 Jan 2020'),
                    Genre: '*',
                    Album: 'Once bitten'
                },
                {
                    Number: 4,
                    Title: 'Mad to Kiss',
                    Released: new Date('6 Nov 2019'),
                    Genre: 'Synth-pop R&B',
                    Album: 'Once bitten'
                },
                {
                    Number: 5,
                    Title: 'Hotel Prague',
                    Released: new Date('20 Oct 2019'),
                    Genre: 'ethno-tunes',
                    Album: 'Once bitten'
                },
                {
                    Number: 6,
                    Title: 'Jail on My Mind',
                    Released: new Date('31 May 2019'),
                    Genre: 'Crunk reggaeton',
                    Album: 'Once bitten'
                },
                {
                    Number: 7,
                    Title: 'Amazing Blues',
                    Released: new Date('29 May 2019'),
                    Genre: 'mystical parody-bap ',
                    Album: 'Once bitten'
                },
                {
                    Number: 8,
                    Title: 'Goody Two Iron Filings',
                    Released: new Date('4 Jul 2019'),
                    Genre: 'Electro house Electropop',
                    Album: 'Once bitten'
                },
                {
                    Number: 9,
                    Title: 'I Love in Your Arms',
                    Released: new Date('7 Jun 2019'),
                    Genre: 'R&B',
                    Album: 'Once bitten'
                },
                {
                    Number: 10,
                    Title: 'Truly Madly Amazing',
                    Released: new Date('12 Sep 2019'),
                    Genre: 'ethno-tunes',
                    Album: 'Once bitten'
                }
                ]
            },
            {
                Album: 'Your graciousness',
                LaunchDate: new Date('November 17, 2004'),
                BillboardReview: 69,
                USBillboard200: 30,
                Artist: 'Izabella Tabakova',
                Songs: [
                    {
                        Number: 1,
                        Title: 'We Shall Tickle',
                        Released: new Date('31 Aug 2019'),
                        Genre: 'old emo-garage ',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 2,
                        Title: 'Snail Boogie',
                        Released: new Date('14 Jun 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 3,
                        Title: 'Amazing Liz',
                        Released: new Date('15 Oct 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 4,
                        Title: 'When Sexy Aardvarks Cry',
                        Released: new Date('1 Oct 2019'),
                        Genre: 'whimsical comedy-grass ',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 5,
                        Title: 'Stand By Dave',
                        Released: new Date('18 Aug 2019'),
                        Genre: 'unblack electronic-trip-hop',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 6,
                        Title: 'The Golf Course is Your Land',
                        Released: new Date('2 Apr 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 7,
                        Title: 'Where Have All the Men Gone?',
                        Released: new Date('29 Apr 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 8,
                        Title: 'Rhythm of the Leg',
                        Released: new Date('5 Aug 2019'),
                        Genre: 'ethno-tunes',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 9,
                        Title: 'Baby, I Need Your Hats',
                        Released: new Date('5 Dec 2019'),
                        Genre: 'neuro-tunes',
                        Album: 'Your graciousness'
                    },
                    {
                        Number: 10,
                        Title: 'Stand by Your Cat',
                        Released: new Date('25 Jul 2019'),
                        Genre: '*',
                        Album: 'Your graciousness'
                    }]
            },
            {
                Album: 'Dark matters',
                LaunchDate: new Date('November 3, 2002'),
                BillboardReview: 79,
                USBillboard200: 85,
                Artist: 'Izabella Tabakova',
                Songs: [{
                    Number: 1,
                    Title: 'The Sun',
                    Released: new Date('31 Oct 2002'),
                    Genre: 'old emo-garage ',
                    Album: 'Dark matters'
                },
                {
                    Number: 2,
                    Title: 'I will survive',
                    Released: new Date('03 Nov 2002'),
                    Genre: 'old emo-garage ',
                    Album: 'Dark matters'
                },
                {
                    Number: 3,
                    Title: 'Try',
                    Released: new Date('04 Nov 2002'),
                    Genre: 'old emo-garage ',
                    Album: 'Dark matters'
                },
                {
                    Number: 4,
                    Title: 'Miracle',
                    Released: new Date('05 Nov 2002'),
                    Genre: 'old emo-garage ',
                    Album: 'Dark matters'
                }]
            }
        ]
    },
    {
        ID: 6,
        Artist: 'Nguyễn Diệp Chi',
        Photo: 'https://staging.infragistics.com/angular-demos/assets/images/hgrid/nguyen.jpg',
        Debut: 1992,
        GrammyNominations: 4,
        GrammyAwards: 2,
        HasGrammyAward: true,
        Albums: [
            {
                Album: 'Library of liberty',
                LaunchDate: new Date('December 22, 2003'),
                BillboardReview: 93,
                USBillboard200: 5,
                Artist: 'Nguyễn Diệp Chi',
                Songs: [{
                    Number: 1,
                    Title: 'Book of love',
                    Released: new Date('31 Dec 2003'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 2,
                    Title: 'Commitment',
                    Released: new Date('01 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 3,
                    Title: 'Satisfaction',
                    Released: new Date('01 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 4,
                    Title: 'Obsession',
                    Released: new Date('01 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 5,
                    Title: 'Oblivion',
                    Released: new Date('02 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                },
                {
                    Number: 6,
                    Title: 'Energy',
                    Released: new Date('03 Jan 2004'),
                    Genre: 'Hip-hop',
                    Album: 'Library of liberty'
                }]
            }
        ]
    }];

    public pData = [
        {
            "Country": "Japan",
            "Product": "Royal Oak",
            "Units Sold": "1958",
            "Manufacturing Price": 5,
            "Sale Price": 125,
            "Gross Sales": 244750,
            "Discounts": null,
            "Sales": 244750,
            "COGS": 319860,
            "Profit": 75110,
            "Date": "7/1/20",
            "Month Name": "July",
            "Year": "2020",
            "undefined": "20"
        },
        {
            "Country": "Brazil",
            "Product": "Royal Oak",
            "Units Sold": "3271",
            "Manufacturing Price": 5,
            "Sale Price": 300,
            "Gross Sales": 981300,
            "Discounts": null,
            "Sales": 981300,
            "COGS": 239500,
            "Profit": 741800,
            "Date": "8/1/20",
            "Month Name": "August",
            "Year": "2020"
        },
        {
            "Country": "India",
            "Product": "Royal Oak",
            "Units Sold": "2091",
            "Manufacturing Price": 5,
            "Sale Price": 7,
            "Gross Sales": 14637,
            "Discounts": null,
            "Sales": 14637,
            "COGS": 10730,
            "Profit": 3907,
            "Date": "9/1/20",
            "Month Name": "September",
            "Year": "2020"
        },
        {
            "Country": "USA",
            "Product": "Royal Oak",
            "Units Sold": "2825",
            "Manufacturing Price": 5,
            "Sale Price": 15,
            "Gross Sales": 42375,
            "Discounts": null,
            "Sales": 42375,
            "COGS": 6150,
            "Profit": 36225,
            "Date": "12/1/20",
            "Month Name": "December",
            "Year": "2020"
        },
        {
            "Country": "Japan",
            "Product": "Vermont",
            "Units Sold": "2513",
            "Manufacturing Price": 10,
            "Sale Price": 20,
            "Gross Sales": 50260,
            "Discounts": null,
            "Sales": 50260,
            "COGS": 2920,
            "Profit": 47340,
            "Date": "2/1/20",
            "Month Name": "February",
            "Year": "2020"
        },
        {
            "Country": "Brazil",
            "Product": "Vermont",
            "Units Sold": "883",
            "Manufacturing Price": 10,
            "Sale Price": 15,
            "Gross Sales": 13245,
            "Discounts": null,
            "Sales": 13245,
            "COGS": 9740,
            "Profit": 3505,
            "Date": "2/1/20",
            "Month Name": "February",
            "Year": "2020"
        },
        {
            "Country": "Japan",
            "Product": "Vermont",
            "Units Sold": "2087",
            "Manufacturing Price": 10,
            "Sale Price": 12,
            "Gross Sales": 25044,
            "Discounts": null,
            "Sales": 25044,
            "COGS": 7554,
            "Profit": 17490,
            "Date": "6/1/20",
            "Month Name": "June",
            "Year": "2020"
        }];

    public pivotConfigHierarchy: IPivotConfiguration;

    public dateDimension: IgxPivotDateDimension;

    constructor() {
        this.dateDimension = new IgxPivotDateDimension({
            memberName: 'Date',
            enabled: true
        }, {
            months: false,
            quarters: true,
            years: true
        });

        this.pivotConfigHierarchy = {
            columns: [

                {
                    memberName: 'Country',
                    enabled: true
                },
                {

                    memberName: 'Product',
                    enabled: true
                }
            ],
            rows: [
                this.dateDimension
            ],
            values: [
                {
                    member: 'Sales',
                    aggregate: {
                        aggregator: IgxPivotNumericAggregate.sum,
                        key: 'Sum Of Sales',
                        label: 'Sum'
                    },
                    enabled: false,
                    dataType: GridColumnDataType.Currency
                },
                {
                    member: 'Profit',
                    aggregate: {
                        aggregator: IgxPivotNumericAggregate.sum,
                        key: 'Sum Of Profit',
                        label: 'Sum'
                    },
                    enabled: true,
                    dataType: GridColumnDataType.Currency
                }
            ],
            filters: [
                {
                    memberName: 'Month',
                    memberFunction: (data) => data['Month Name'],
                    enabled: false
                }
            ]
        };
    }
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

        // New API
        registerI18n(ResourceStringsBG, 'bg');
        registerI18n(ResourceStringsEN, 'en');
        registerI18n(ResourceStringsDE, 'de');
        registerI18n(ResourceStringsES, 'es');
        registerI18n(ResourceStringsFR, 'fr');
        registerI18n(ResourceStringsIT, 'it');
        registerI18n(ResourceStringsJA, 'ja');
        registerI18n(ResourceStringsKO, 'ko');
        registerI18n(ResourceStringsZHHANS, 'zh-Hans');
        registerI18n(ResourceStringsZHHANT, 'zh-Hant');

        toggleIgxAngularLocalization(false);

        this.banner.open();
    }

    public updateLocale() {
        setCurrentI18n(this.locale);
    }
}
