import { Component, OnInit } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "card-sample",
    templateUrl: "sample.component.html",
    styleUrls: ["sample.component.css"]
})
export class IgxCardSampleComponent implements OnInit {
    public visioners: Array<Visioner>;

    public selectedVisioner: Visioner;

    private nyc = {
        title: 'New York City',
        subtitle: 'City in New York',
        media: {
            image: 'demos/app/card/images/media/ny.jpg'
        },
        content: 'New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that’s among the world’s major commercial, financial and cultural centers.'
    }

    private forest = {
        title: 'The Ice Forest',
        media: {
            image: 'demos/app/card/images/media/the_red_ice_forest.jpg'
        }
    }

    private yosemite = {
        title: 'Incipient Dawn',
        subtitle: 'Yosemite National Park',
        media: {
            image: 'demos/app/card/images/media/yosemite.jpg'
        }
    }

    private rosberg = {
        title: 'Nico Rosberg',
        subtitle: 'Racing Driver',
        content: 'Nico Erik Rosberg is a German former Formula One racing driver and current Formula One World Champion who drove for Williams F1 and Mercedes AMG Petronas under the German flag.'
    }

    private monuments = {
        media: {
            image: 'demos/app/card/images/media/monuments.jpg'
        }   
    }

    private audi = {
        avatar: 'demos/app/card/images/avatars/rupert_stadler.jpg',
        title: 'Rupert Stadler',
        subtitle: 'January 30, 2017',
        media: {
            image: 'demos/app/card/images/media/audi_tt.jpg'
        }
    }

    private alicia = {
        avatar: 'demos/app/card/images/avatars/alicia_keys.jpg',
        title: 'HERE',
        subtitle: 'by Alicia Keys',
        media: {
            image: 'demos/app/card/images/media/here_media.jpg'
        }
    }

    public ngOnInit(): void {
        this.visioners = [
            new Visioner("Bill Gates",
                "demos/app/card/images/bill-gates-avatar.png",
                "demos/app/card/images/bill-gates-image.jpg",
                "https://www.facebook.com/BillGates/",
                "https://twitter.com/BillGates",
                "Entrepreneur Bill Gates founded the world's largest software business, Microsoft, with Paul Allen, and subsequently became one of the richest men in the world."),
            new Visioner("Mark Zuckerberg",
                "demos/app/card/images/mark-zuckerberg-avatar.jpg",
                "demos/app/card/images/mark-zuckerberg-image.jpg",
                "https://www.facebook.com/zuck",
                "https://twitter.com/finkd",
                "Mark Zuckerberg is co-founder and CEO of the social-networking website Facebook, as well as one of the world's youngest billionaires."),
            new Visioner("Elon Musk",
                "demos/app/card/images/elon-musk-avatar.jpg",
                "demos/app/card/images/elon-musk-image.jpg",
                "https://www.facebook.com/pages/Elon-Musk/108250442531979",
                "https://twitter.com/elonmusk",
                "South African entrepreneur Elon Musk is known for founding Tesla Motors and SpaceX, which launched a landmark commercial spacecraft in 2012."),
        ];

        this.selectedVisioner = this.visioners[0];
    }

    public openUrl(url: string): void {
        window.location.href = url;
    }

    public handleCardClick(visioner: Visioner): void {
        this.selectedVisioner = visioner;
    }
}

export class Visioner {
    constructor(public name: string,
                public avatarUrl: string,
                public imageUrl: string,
                public facebook: string,
                public twitter: string,
                public about: string) {
    }
}