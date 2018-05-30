import { Component } from '@angular/core';

export interface ICard {
    title: string;
    subtitle: string;
    content: string;
    imageUrl: string;
    avatarUrl: string;
    buttons: string[];
    icons: string[];
}

function cardFactory(params: any): ICard {
    return {
        title: params.title || 'Card Title',
        subtitle: params.subtitle || 'Card Subtitle',
        content: params.content || 'Some card content should be place here.',
        imageUrl: params.imageUrl || 'images/card/media/placeholder.jpg',
        avatarUrl: params.avatarUrl || 'images/card/avatars/rupert_stadler.jpg',
        buttons: params.buttons || ['ACTION1', 'ACTION2'],
        icons: params.icons || ['favorite', 'bookmark', 'share']
    };
}

@Component({
    selector: 'app-card-sample',
    styleUrls: ['card.sample.css'],
    templateUrl: 'card.sample.html'
})
export class CardSampleComponent {

    cards = [
        cardFactory({
            content: `New York City comprises 5 boroughs sitting where the
            Hudson River meets the Atlantic Ocean. At its core is Manhattan,
            a densely populated borough that’s among the world’s major commercial,
            financial and cultural centers.`,
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
        cardFactory({})
    ];
}
