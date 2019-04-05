import { Component, ViewChild } from '@angular/core';
import {
    async,
    TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    IgxCardModule,
    IgxCardComponent,
    IgxCardType,
    IgxCardActionsLayout,
    IgxCardThumbnailDirective,
    IgxCardHeaderTitleDirective,
    IgxCardHeaderSubtitleDirective,
    IgxCardActionsComponent,
} from './card.component';

import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxIconModule } from '../icon/index';

fdescribe('Card', () => {
    const baseClass = 'igx-card';

    const classes = {
        outlined: `${baseClass}--outlined`,
        horizontal: `${baseClass}--horizontal`,
        header: {
            base: `${baseClass}-header`,
            get vertical() {
                return `${this.base}--vertical`;
            },
            get thumb() {
                return `${this.base}__thumbnail`;
            },
            get title() {
                return `${this.base}__title`;
            },
            get subtitle() {
                return `${this.base}__subtitle`;
            },
            get titles() {
                return `${this.base}__titles`;
            }
        },
        actions: {
            base: `${baseClass}-actions`,
            get vertical() {
                return `${this.base}--vertical`;
            },
            get justify() {
                return `${this.base}--justify`;
            },
            get icons() {
                return `${this.base}__icons`;
            },
            get buttons() {
                return `${this.base}__buttons`;
            }
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitCardComponent,
                InitOutlinedCardComponent,
                InitHorizontalCardComponent,
                CardWithHeaderComponent,
                FullCardComponent
            ],
            imports: [
                IgxCardModule,
                IgxIconModule,
                IgxButtonModule
            ]
        }).compileComponents();
    }));

    it('Initializes default card', () => {
        const fixture = TestBed.createComponent(InitCardComponent);
        fixture.detectChanges();

        const card = fixture.debugElement.query(By.css('igx-card')).nativeElement;

        expect(card).toBeDefined();
        expect(card.getAttribute('role')).toEqual('group');

        expect(card.classList).toContain(`${baseClass}`);
        expect(card.classList).not.toContain(classes.outlined);
        expect(card.classList).not.toContain(classes.horizontal);
        expect(card.id).toContain(`${baseClass}-`);
    });

    it('Initializes outlined card', () => {
        const fixture = TestBed.createComponent(InitOutlinedCardComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance.card;
        const card = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.type).toEqual(IgxCardType.OUTLINED);
        expect(card.classList).toContain(classes.outlined);
        expect(card.classList).not.toContain(classes.horizontal);
    });

    it('Initializes horizontal card', () => {
        const fixture = TestBed.createComponent(InitHorizontalCardComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance.card;
        const card = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.horizontal).toEqual(true);
        expect(card.classList).toContain(classes.horizontal);
    });

    it('Initializes card header', () => {
        const fixture = TestBed.createComponent(CardWithHeaderComponent);
        fixture.detectChanges();

        const header = fixture.debugElement.query(By.css('igx-card-header')).nativeElement;

        expect(header).toBeDefined();
        expect(header.getAttribute('role')).toEqual('header');

        expect(header.classList).toContain(classes.header.base);
        expect(header.classList).not.toContain(classes.header.vertical);
    });

    it('Initializes vertical card header', () => {
        const fixture = TestBed.createComponent(FullCardComponent);
        fixture.detectChanges();

        const header = fixture.debugElement.query(By.css('igx-card-header')).nativeElement;
        expect(header.classList).toContain(classes.header.vertical);
    });

    it('Initializes title, subtitle, and thumb in header', () => {
        const fixture = TestBed.createComponent(FullCardComponent);
        fixture.detectChanges();

        const thumb = fixture.debugElement.query(By.directive(IgxCardThumbnailDirective));
        const title = fixture.debugElement.query(By.directive(IgxCardHeaderTitleDirective));
        const subtitle = fixture.debugElement.query(By.directive(IgxCardHeaderSubtitleDirective));

        // Check to see if thumbnail has been inserted in the thumbnail section;
        expect(thumb.parent.nativeElement.classList).toContain(classes.header.thumb);

        // Check to see if the title and subtitle have been
        // inserted in the titles section;
        expect(title.parent.nativeElement.classList).toContain(classes.header.titles);
        expect(subtitle.parent.nativeElement.classList).toContain(classes.header.titles);

        expect(title.nativeElement.classList).toContain(classes.header.title);
        expect(subtitle.nativeElement.classList).toContain(classes.header.subtitle);

        // Validate Content
        expect(thumb.nativeElement.textContent).toEqual('Thumb');
        expect(title.nativeElement.textContent).toEqual('Title');
        expect(subtitle.nativeElement.textContent).toEqual('Subtitle');
    });

    it('Initializes content', () => {
        const fixture = TestBed.createComponent(FullCardComponent);
        fixture.detectChanges();

        const content = fixture.debugElement.query(By.css('igx-card-content')).nativeElement;

        expect(content).toBeDefined();
        expect(content.textContent).toEqual('Test Content');
    });

    it('Initializes actions with buttons', () => {
        const fixture = TestBed.createComponent(FullCardComponent);
        fixture.detectChanges();

        const actions = fixture.debugElement.query(By.css('igx-card-actions')).nativeElement;

        expect(actions).toBeDefined();
        expect(actions.classList).toContain(classes.actions.base);
        expect(actions.classList).not.toContain(classes.actions.justify);
        expect(actions.classList).not.toContain(classes.actions.vertical);
    });

    it('Should align actions buttons vertically when card uses horizontal layout', () => {
        const fixture = TestBed.createComponent(FullCardComponent);
        fixture.detectChanges();

        const cardInstance = fixture.componentInstance.card;
        const actionsInstance = fixture.componentInstance.actions;
        const actionsElement = fixture.debugElement.query(By.css('igx-card-actions')).nativeElement;

        cardInstance.horizontal = true;
        fixture.detectChanges();

        expect(cardInstance.horizontal).toEqual(true);
        // expect(actionsInstance.vertical).toEqual(true);
        expect(actionsElement.classList).toContain(classes.actions.vertical);
    });
});

@Component({
    template: `<igx-card></igx-card>`
})
class InitCardComponent { }

@Component({
    template: `<igx-card type="outlined"></igx-card>`
})
class InitOutlinedCardComponent {
    @ViewChild(IgxCardComponent)
    public card: IgxCardComponent;
}

@Component({
    template: `<igx-card [horizontal]="true"></igx-card>`
})
class InitHorizontalCardComponent {
    @ViewChild(IgxCardComponent)
    public card: IgxCardComponent;
}

@Component({
    template: `<igx-card>
        <igx-card-header></igx-card-header>
    <igx-card>`
})
class CardWithHeaderComponent { }

@Component({
    template: `<igx-card #card>
        <igx-card-media width="200px" height="50%">
            <div>media</div>
        <igx-card-media>

        <igx-card-header [vertical]="true">
            <div igxCardThumbnail>Thumb</div>
            <h4 igxCardHeaderTitle>Title</h4>
            <h5 igxCardHeaderSubtitle>Subtitle</h5>
        </igx-card-header>

        <igx-card-content>Test Content</igx-card-content>

        <igx-card-actions #actions>
            <button igxButton>Test</button>
            <button igxButton="icon">
                <igx-icon>home</igx-icon>
            </button>
        </igx-card-actions>
    <igx-card>`
})
class FullCardComponent {
    @ViewChild('card') public card: IgxCardComponent;
    @ViewChild('actions') public actions: IgxCardActionsComponent;
}
