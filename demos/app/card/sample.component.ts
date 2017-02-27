import { Component, OnInit } from "@angular/core";

interface ICard {
    title?: string,
    subtitle?: string,
    content?: string,
    imageUrl?: string,
    avatarUrl?: string,
    buttons?: string[],
    icons?: string[]
}

class Card {
    private title: string;
    private subtitle: string;
    private content: string;
    private imageUrl: string;
    private avatarUrl: string;
    private buttons: string[];
    private icons: string[];

    constructor(obj?: ICard) {
        this.title = obj.title || 'Card Title';
        this.subtitle = obj.subtitle || 'Card Subtitle';
        this.content = obj.content || 'Some card content should be placed here. Description or other related information.';
        this.imageUrl = obj.imageUrl || 'demos/app/card/images/media/placeholder.jpg';
        this.avatarUrl = obj.avatarUrl || 'demos/app/card/images/avatars/rupert_stadler.jpg';
        this.buttons = obj.buttons || ['ACTION1', 'ACTION2'];
        this.icons = obj.icons || ['favorite', 'bookmark', 'share'];
    }
}

@Component({
    moduleId: module.id,
    selector: "card-sample",
    templateUrl: "sample.component.html",
    styleUrls: ["sample.component.css"]
})
export class IgxCardSampleComponent implements OnInit {

    private cards: Array<Card>;

    public ngOnInit(): void {

        this.cards = [
            new Card({
                title: 'New York City',
                subtitle: 'City in New York',
                imageUrl: 'demos/app/card/images/media/ny.jpg',
                content: 'New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that’s among the world’s major commercial, financial and cultural centers.',
                icons: ['favorite', 'bookmark', 'share']
            }),
            new Card({
                imageUrl: 'demos/app/card/images/media/the_red_ice_forest.jpg',
                icons: ['favorite', 'bookmark', 'share']
            }),
            new Card({
                title: 'Incipient Dawn',
                subtitle: 'Yosemite National Park',
                imageUrl: 'demos/app/card/images/media/yosemite.jpg',
                buttons: ['Share', 'Explore']
            }),
            new Card({
                title: 'Nico Rosberg',
                subtitle: 'Racing Driver',
                content: 'Nico Erik Rosberg is a German former Formula One racing driver and current Formula One World Champion who drove for Williams F1 and Mercedes AMG Petronas under the German flag.'
            }),
            new Card({
                avatarUrl: 'demos/app/card/images/avatars/alicia_keys.jpg',
                title: 'HERE',
                subtitle: 'by Alicia Keys',
                imageUrl: 'demos/app/card/images/media/here_media.jpg',
                buttons: ['share', 'play album']
            }),
            new Card({
                imageUrl: 'demos/app/card/images/media/monuments.jpg',
                icons: ['favorite', 'share'],
                buttons: ['Comment', 'Explore']
            }),
            new Card({
                avatarUrl: 'demos/app/card/images/avatars/rupert_stadler.jpg',
                title: 'Rupert Stadler',
                subtitle: 'January 30, 2017',
                imageUrl: 'demos/app/card/images/media/audi_tt.jpg',
                buttons: ['message', 'follow'],
                icons: ['add', 'star']
            }),
            new Card({})
        ]
    }

    private openUrl(url: string): void {
        window.location.href = url;
    }
}