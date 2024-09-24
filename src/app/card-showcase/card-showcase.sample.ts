import { Component, ViewEncapsulation } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxAvatarComponent, IgxButtonDirective, IgxCardActionsComponent, IgxCardComponent, IgxCardContentDirective, IgxCardHeaderComponent, IgxCardHeaderSubtitleDirective, IgxCardHeaderTitleDirective, IgxCardMediaDirective, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective } from 'igniteui-angular';
import { defineComponents, IgcCardComponent, IgcAvatarComponent, IgcButtonComponent, IgcIconButtonComponent} from "igniteui-webcomponents";

defineComponents(IgcCardComponent, IgcAvatarComponent, IgcButtonComponent, IgcIconButtonComponent);

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

const cardFactory = (params: any): ICard => ({
    title: params.title || 'Card Title',
    subtitle: params.subtitle || 'Card Subtitle',
    unit: params.unit || '°C',
    content: params.content || 'Some card content should be place here.',
    imageUrl: params.imageUrl || 'images/card/media/placeholder.jpg',
    avatarUrl: params.avatarUrl || 'images/card/avatars/rupert_stadler.jpg',
    buttons: params.buttons || ['ACTION1', 'ACTION2'],
    chip: params.chip || ['ACTION1', 'ACTION2', 'ACTION3'],
    icons: params.icons || ['favorite', 'bookmark', 'share']
});

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-card-showcase-sample',
    styleUrls: ['card-showcase.sample.scss'],
    templateUrl: 'card-showcase.sample.html',
    standalone: true,
    imports: [
        NgFor,
        FormsModule,
        IgxCardComponent,
        IgxCardMediaDirective,
        IgxCardHeaderComponent,
        IgxCardContentDirective,
        IgxCardActionsComponent,
        IgxButtonDirective,
        IgxRippleDirective,
        IgxIconComponent,
        IgxAvatarComponent,
        IgxCardHeaderTitleDirective,
        IgxCardHeaderSubtitleDirective,
        IgxIconButtonDirective
    ]
})
export class CardShowcaseSampleComponent {
    public cards = [
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
    ];
}
