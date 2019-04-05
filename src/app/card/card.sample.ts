import { Component, ViewChild } from '@angular/core';
import {
    IgxCardComponent,
    IgxCardActionsComponent,
    IgxToggleDirective,
    IgxExpansionPanelModule,
    IgxExpansionPanelComponent
} from 'igniteui-angular';

export interface ICard {
    title: string;
    subtitle: string;
    content: string;
    imageUrl: string;
    avatarUrl: string;
    unit: string;
    buttons: string[];
    chip: string[];
    icons: string[];
}

export interface Ilist {
    isSunny: boolean;
    day: string;
    icon: string;
    tempHeight: string;
    tempLow: string;
}

export interface Idetails {
    value: string;
    icon: string;
    label: string;
}

function cardFactory(params: any): ICard {
    return {
        title: params.title || 'Card Title',
        subtitle: params.subtitle || 'Card Subtitle',
        unit: params.unit || '°C',
        content: params.content || 'Some card content should be place here.',
        imageUrl: params.imageUrl || 'images/card/media/placeholder.jpg',
        avatarUrl: params.avatarUrl || 'images/card/avatars/rupert_stadler.jpg',
        buttons: params.buttons || ['ACTION1', 'ACTION2'],
        chip: params.chip || ['ACTION1', 'ACTION2', 'ACTION3'],
        icons: params.icons || ['favorite', 'bookmark', 'share']
    };
}

function listFactory(params: any): Ilist {
    return {
        isSunny: params.isSunny || '',
        day: params.day || 'day of the week',
        icon: params.icon || 'wb_cloudy',
        tempHeight: params.tempHeight || '°C',
        tempLow: params.tempLow || '°C',
    };
}

function detailsFactory(params: any): Idetails {
    return {
        value: params.value || '',
        icon: params.icon || '',
        label: params.label || '',
    };
}

@Component({
    selector: 'app-card-sample',
    styleUrls: ['card.sample.css'],
    templateUrl: 'card.sample.html'
})
export class CardSampleComponent {
    public horizontal = false;
    public volume = 10;

    @ViewChild(IgxExpansionPanelComponent)
    public panel: IgxExpansionPanelComponent;

    public toggleDetails() {
        this.panel.toggle();
    }

    details = [
        detailsFactory({
            value: '12%',
            icon: 'rain',
            label: 'Participation',
        }),
        detailsFactory({
            value: '23 km/h',
            icon: 'breeze',
            label: 'Wind',
        })
    ];

    days = [
        listFactory({
            day: 'Tuesday',
            icon: 'wb_cloudy',
            tempHeight: '18°',
            tempLow: '11°',
        }),
        listFactory({
            day: 'Wednesday',
            icon: 'wb_cloudy',
            tempHeight: '16°',
            tempLow: '10°',
        }),
        listFactory({
            isSunny: 'true',
            day: 'Thursday',
            icon: 'wb_sunny',
            tempHeight: '22°',
            tempLow: '12°',
        }),
        listFactory({
            day: 'Friday',
            icon: 'wb_cloudy',
            tempHeight: '28°',
            tempLow: '17°',
        }),
        listFactory({
            day: 'Saturday',
            icon: 'wb_cloudy',
            tempHeight: '21°',
            tempLow: '16°',
        }),
        listFactory({
            isSunny: 'true',
            day: 'Sunday',
            icon: 'wb_sunny',
            tempHeight: '29°',
            tempLow: '20°',
        }),
    ];

    cards = [
        cardFactory({
            content: `New York City comprises 5 boroughs sitting where the
            Hudson River meets the Atlantic Ocean. At its core is Manhattan,
            a densely populated borough that’s among the world’s major commercial,
            financial and cultural centers.`,
            avatarUrl: 'assets/images/card/avatars/statue_of_liberty.jpg',
            icons: ['favorite', 'bookmark', 'share'],
            imageUrl: 'assets/images/card/media/ny.jpg',
            subtitle: 'City in New York',
            title: 'New York City'
        }),
        cardFactory({
            icons: ['favorite', 'bookmark', 'share'],
            imageUrl: 'assets/images/card/media/the_red_ice_forest.jpg'
        }),
        cardFactory({
            buttons: ['Share', 'Explore'],
            imageUrl: 'assets/images/card/media/yosemite.jpg',
            subtitle: 'Yosemite National Park',
            title: 'Incipient Dawn'
        }),
        cardFactory({
            content: `Nico Erik Rosberg is a German former Formula One racing driver
                and current Formula One World Champion who drove for Williams F1 and
                Mercedes AMG Petronas under the German flag.`,
            subtitle: 'Racing Driver',
            title: 'Nico Rosberg'
        }),
        cardFactory({
            avatarUrl: 'assets/images/card/avatars/alicia_keys.jpg',
            buttons: ['share', 'play album'],
            imageUrl: 'assets/images/card/media/here_media.jpg',
            subtitle: 'by Melow D',
            title: 'THERE'
        }),
        cardFactory({
            buttons: ['Comment', 'Explore'],
            icons: ['favorite', 'share'],
            imageUrl: 'assets/images/card/media/monuments.jpg'
        }),
        cardFactory({
            avatarUrl: 'assets/images/card/avatars/rupert_stadler.jpg',
            buttons: ['message', 'follow'],
            icons: ['add', 'star'],
            imageUrl: 'assets/images/card/media/audi.jpg',
            subtitle: 'January 30, 2017',
            title: 'Rupert Stadler'
        }),
        cardFactory({
            title: 'Rozes',
            subtitle: 'Under the Grave (2016)',
            imageUrl: 'assets/images/card/media/roses.jpg',
            icons: ['skip_previous', 'play_arrow', 'skip_next']
        }),
        cardFactory({
            imageUrl: 'assets/images/card/media/cofe.jpg',
            title: 'Cafe Badilico',
            subtitle: '$ - Italian, Cafe',
            content: `Small plates, salads & sandwiches setting with 12 indoor seats plus patio seating.`,
            buttons: ['RESERVE'],
            chip: ['5:30', '7:30', '8:00', '9:00']
        }),
        cardFactory({
            imageUrl: 'assets/images/card/media/weather.png',
            title: 'Sofia - Bulgaria',
            subtitle: 'Mon 12:30 PM, Mostly sunny',
            content: `37`,
            unit: '°C',
            buttons: ['Details'],
        }),
        cardFactory({})
    ];
}
