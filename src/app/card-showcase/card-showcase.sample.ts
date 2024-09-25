import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgxAvatarComponent, IgxButtonDirective, IgxCardActionsComponent, IgxCardComponent, IgxCardContentDirective, IgxCardHeaderComponent, IgxCardHeaderSubtitleDirective, IgxCardHeaderTitleDirective, IgxCardMediaDirective, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective } from 'igniteui-angular';
import { defineComponents, IgcCardComponent, IgcAvatarComponent, IgcButtonComponent, IgcIconButtonComponent, registerIconFromText} from "igniteui-webcomponents";

defineComponents(IgcCardComponent, IgcAvatarComponent, IgcButtonComponent, IgcIconButtonComponent);

const favorite = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
const share = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>'
const bookmark = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>'

registerIconFromText("favorite", favorite);
registerIconFromText("share", share);
registerIconFromText("bookmark", bookmark);

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
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
