import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    IgxCardComponent,
    IgxCardThumbnailDirective,
    IgxCardHeaderTitleDirective,
    IgxCardHeaderSubtitleDirective,
    IgxCardActionsComponent,
    IgxCardMediaDirective,
    IgxCardHeaderComponent,
    IgxCardContentDirective,
} from './card.component';

import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxIconButtonDirective } from '../directives/button/icon-button.directive';

describe('Card', () => {
    configureTestSuite();
    // TODO: Refactor card tests to reuse components
    const baseClass = 'igx-card';

    const classes = {
        outlined: `${baseClass}--outlined`,
        elevated: `${baseClass}--elevated`,
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
            get end() {
                return `${this.base}__end`;
            },
            get start() {
                return `${this.base}__start`;
            }
        },
        media: `${baseClass}__media`
    };

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                InitCardComponent,
                InitOutlinedCardComponent,
                CardWithHeaderComponent,
                CardContentIconComponent,
                VerticalCardComponent,
                HorizontalCardComponent
            ]
        }).compileComponents();
    }));

    it('Initializes default card', () => {
        const fixture = TestBed.createComponent(InitCardComponent);
        fixture.detectChanges();

        const card = fixture.debugElement.query(By.css('igx-card')).nativeElement;

        expect(card).toBeDefined();
        expect(card.getAttribute('role')).toEqual('group');

        expect(card).toHaveClass(`${baseClass}`);
        expect(card).not.toHaveClass(classes.elevated);
        expect(card).not.toHaveClass(classes.horizontal);
        expect(card.id).toContain(`${baseClass}-`);
    });

    it('Initializes horizontal card', () => {
        const fixture = TestBed.createComponent(HorizontalCardComponent);
        fixture.detectChanges();

        const instance = fixture.componentInstance.card;
        const card = fixture.debugElement.query(By.css(baseClass)).nativeElement;

        expect(instance.horizontal).toEqual(true);
        expect(card).toHaveClass(classes.horizontal);
    });

    it('Initializes card header', () => {
        const fixture = TestBed.createComponent(CardWithHeaderComponent);
        fixture.detectChanges();

        const header = fixture.debugElement.query(By.css('igx-card-header')).nativeElement;

        expect(header).toBeDefined();
        // K.D. March 20th, 2023 #12792 Card header should have no role
        // expect(header.getAttribute('role')).toEqual('header');
        expect(header.getAttribute('role')).toBeNull();

        expect(header).toHaveClass(classes.header.base);
        expect(header).not.toHaveClass(classes.header.vertical);
    });

    it('Initializes vertical card header', () => {
        const fixture = TestBed.createComponent(VerticalCardComponent);
        fixture.detectChanges();

        const header = fixture.debugElement.query(By.css('igx-card-header')).nativeElement;
        expect(header).toHaveClass(classes.header.vertical);
    });

    it('Initializes title, subtitle, and thumb in header', () => {
        const fixture = TestBed.createComponent(VerticalCardComponent);
        fixture.detectChanges();

        const thumb = fixture.debugElement.query(By.directive(IgxCardThumbnailDirective));
        const title = fixture.debugElement.query(By.directive(IgxCardHeaderTitleDirective));
        const subtitle = fixture.debugElement.query(By.directive(IgxCardHeaderSubtitleDirective));

        // Check to see if thumbnail has been inserted in the thumbnail section;
        expect(thumb.parent.nativeElement).toHaveClass(classes.header.thumb);

        // Check to see if the title and subtitle have been
        // inserted in the titles section;
        expect(title.parent.nativeElement).toHaveClass(classes.header.titles);
        expect(subtitle.parent.nativeElement).toHaveClass(classes.header.titles);

        expect(title.nativeElement).toHaveClass(classes.header.title);
        expect(subtitle.nativeElement).toHaveClass(classes.header.subtitle);

        // Validate Content
        expect(thumb.nativeElement.textContent).toEqual('Thumb');
        expect(title.nativeElement.textContent).toEqual('Title');
        expect(subtitle.nativeElement.textContent).toEqual('Subtitle');
    });

    it('Initializes content', () => {
        const fixture = TestBed.createComponent(VerticalCardComponent);
        fixture.detectChanges();

        const content = fixture.debugElement.query(By.css('igx-card-content')).nativeElement;

        expect(content).toBeDefined();
        expect(content.textContent).toEqual('Test Content');
    });

    it('Initializes card media', () => {
        const fixture = TestBed.createComponent(VerticalCardComponent);
        fixture.detectChanges();

        const media = fixture.debugElement.query(By.css('igx-card-media'));
        const mediaContent = media.query(By.css('div')).nativeElement;

        expect(media).toBeDefined();
        expect(mediaContent.textContent).toEqual('media');
        expect(media.nativeElement).toHaveClass(classes.media);
    });

    it('Initializes actions with buttons', () => {
        const fixture = TestBed.createComponent(VerticalCardComponent);
        fixture.detectChanges();

        const actions = fixture.debugElement.query(By.css('igx-card-actions')).nativeElement;

        expect(actions).toBeDefined();
        expect(actions).toHaveClass(classes.actions.base);
        expect(actions).not.toHaveClass(classes.actions.justify);
        expect(actions).not.toHaveClass(classes.actions.vertical);
    });

    it('Should use Material Icons font-family for igx-icon in card content', () => {
        const fixture = TestBed.createComponent(CardContentIconComponent);
        fixture.detectChanges();

        const iconElement = fixture.debugElement.query(By.css('igx-icon')).nativeElement;
        const computedStyle = window.getComputedStyle(iconElement);

        expect(computedStyle.fontFamily).toBe('"Material Icons"');
    });

    it('Should automatically align actions vertically when in horizontal layout', () => {
        const fixture = TestBed.createComponent(HorizontalCardComponent);
        fixture.detectChanges();

        const actionsInstance = fixture.componentInstance.actions;
        const actionsElement = fixture.debugElement.query(By.css('igx-card-actions')).nativeElement;

        expect(actionsInstance.vertical).toEqual(true);
        expect(actionsElement).toHaveClass(classes.actions.vertical);
    });

    it('Should align actions horizontally and vertically when explicitly set', () => {
        const fixture = TestBed.createComponent(HorizontalCardComponent);
        fixture.detectChanges();

        const actionsInstance = fixture.componentInstance.actions;
        const actionsElement = fixture.debugElement.query(By.css('igx-card-actions')).nativeElement;

        actionsInstance.vertical = false;
        fixture.detectChanges();

        expect(actionsInstance.vertical).toEqual(false);
        expect(actionsElement).not.toHaveClass(classes.actions.vertical);
    });

    it('Should display icon buttons after regular buttons by default', () => {
        const fixture = TestBed.createComponent(HorizontalCardComponent);
        fixture.detectChanges();

        const actionsElement = fixture.debugElement.query(By.css('igx-card-actions'));

        const buttons = actionsElement.query(By.css(`.${classes.actions.start}`)).nativeElement;
        const icons = actionsElement.query(By.css(`.${classes.actions.end}`)).nativeElement;

        const buttonsOrder = window.getComputedStyle(buttons).getPropertyValue('order');
        const iconsOrder = window.getComputedStyle(icons).getPropertyValue('order');

        expect(parseInt(buttonsOrder, 10)).toBeLessThan(parseInt(iconsOrder, 10));
    });
});

@Component({
    template: `<igx-card></igx-card>`,
    imports: [IgxCardComponent]
})
class InitCardComponent { }

@Component({
    template: `<igx-card type="outlined"></igx-card>`,
    imports: [IgxCardComponent]
})
class InitOutlinedCardComponent {
    @ViewChild(IgxCardComponent, { static: true })
    public card: IgxCardComponent;
}

@Component({
    template: `<igx-card>
        <igx-card-header></igx-card-header>
    <igx-card>`,
    imports: [IgxCardComponent, IgxCardHeaderComponent]
})
class CardWithHeaderComponent { }

@Component({
    template: `<igx-card class="ig-typography">
            <igx-card-content>
                <igx-icon>face</igx-icon>
            </igx-card-content>
        <igx-card>`,
    imports: [IgxCardComponent, IgxCardContentDirective, IgxIconComponent]
})
class CardContentIconComponent { }

@Component({
    template: `<igx-card>
        <igx-card-media width="200px" height="50%">
            <div>media</div>
        <igx-card-media>

        <igx-card-header [vertical]="true">
            <div igxCardThumbnail>Thumb</div>
            <h4 igxCardHeaderTitle>Title</h4>
            <h5 igxCardHeaderSubtitle>Subtitle</h5>
        </igx-card-header>

        <igx-card-content>Test Content</igx-card-content>

        <igx-card-actions>
            <button igxButton igxStart>Test</button>
            <button igxIconButton="flat" igxEnd>
                <igx-icon>home</igx-icon>
            </button>
        </igx-card-actions>
    <igx-card>`,
    imports: [
        IgxCardComponent,
        IgxCardMediaDirective,
        IgxCardHeaderComponent,
        IgxCardThumbnailDirective,
        IgxCardHeaderTitleDirective,
        IgxCardHeaderSubtitleDirective,
        IgxCardContentDirective,
        IgxCardActionsComponent,
        IgxButtonDirective,
        IgxIconComponent,
        IgxIconButtonDirective
    ]
})
class VerticalCardComponent {
    @ViewChild(IgxCardMediaDirective, { static: true }) public media: IgxCardMediaDirective;
}

@Component({
    template: `
    <igx-card [horizontal]="true">
        <igx-card-actions>
            <button igxButton igxStart>Test</button>
            <button igxIconButton="flat" igxEnd>
                <igx-icon>home</igx-icon>
            </button>
        </igx-card-actions>
    </igx-card>`,
    imports: [IgxCardComponent, IgxCardActionsComponent, IgxButtonDirective, IgxIconComponent, IgxIconButtonDirective]
})
class HorizontalCardComponent {
    @ViewChild(IgxCardComponent, { static: true }) public card: IgxCardComponent;
    @ViewChild(IgxCardActionsComponent, { static: true }) public actions: IgxCardActionsComponent;
}
