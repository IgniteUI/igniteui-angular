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