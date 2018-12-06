import { Component, OnInit, ViewChild, DebugElement } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxAvatarModule } from '../avatar/avatar.component';
import { IgxBannerComponent, IgxBannerModule } from './banner.component';
import { IgxCardModule } from '../card/card.component';
import { IgxIconModule } from '../icon';
import { IgxExpansionPanelModule } from '../expansion-panel';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { configureTestSuite } from '../test-utils/configure-suite';

const CSS_CLASS_EXPANSION_PANEL = 'igx-expansion-panel';
const CSS_CLASS_EXPANSION_PANEL_BODY = 'igx-expansion-panel__body';
const CSS_CLASS_BANNER = 'igx-banner';
const CSS_CLASS_BANNER_MESSAGE = 'igx-banner__message';
const CSS_CLASS_BANNER_ILLUSTRATION = 'igx-banner__illustration';
const CSS_CLASS_BANNER_TEXT = 'igx-banner__text';
const CSS_CLASS_BANNER_ACTIONS = 'igx-banner__actions';
const CSS_CLASS_BANNER_ROW = 'igx-banner__row';

describe('igxBanner', () => {
    const bannerElement: DebugElement = null;
    const bannerMessageElement: DebugElement = null;
    const bannerIllustrationElement: DebugElement = null;
    const bannerTextElement: DebugElement = null;
    const bannerActionsElement: DebugElement = null;
    const bannerRowElement: DebugElement = null;

    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxBannerEmptyComponent,
                IgxBannerOneButtonComponent,
                IgxBannerSampleComponent,
                IgxBannerCustomTemplateComponent,
                SimpleBannerEventsComponent
            ],
            imports: [
                IgxBannerModule,
                IgxExpansionPanelModule,
                NoopAnimationsModule,
                IgxRippleModule,
                IgxButtonModule,
                IgxAvatarModule,
                IgxCardModule,
                IgxIconModule
            ]
        }).compileComponents();
    }));

    describe('General tests: ', () => {
        it('Should initialize properly banner component with empty template', () => {
            const fixture = TestBed.createComponent(IgxBannerEmptyComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeTruthy();
        });

        it(`Should properly initialize banner component with message`, () => {
            const fixture = TestBed.createComponent(SimpleBannerEventsComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeTruthy();
            banner.toggle();
            const bannerMessage = banner.element.querySelector('.' + CSS_CLASS_BANNER_TEXT);
            expect(bannerMessage.innerHTML.trim()).toEqual('Simple message');
        });

        it('Should initialize properly banner component with message and a button', () => {
            const fixture = TestBed.createComponent(IgxBannerOneButtonComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeFalsy();
            banner.toggle();
            const bannerMessage = banner.element.querySelector('.' + CSS_CLASS_BANNER_TEXT);
            expect(bannerMessage.innerHTML.trim()).toEqual('You have lost connection to the internet.');
            const button = banner.element.querySelector('button');
            expect(button.innerHTML).toEqual('TURN ON WIFI');
        });

        it('Should initialize properly banner component with message and buttons', () => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(fixture.componentInstance).toBeDefined();
            expect(banner).toBeDefined();
            expect(banner.collapsed).toBeTruthy();
            expect(banner.useDefaultTemplate).toBeFalsy();
            banner.toggle();
            const bannerMessage = banner.element.querySelector('.' + CSS_CLASS_BANNER_TEXT);
            expect(bannerMessage.innerHTML.trim()).toEqual('Unfortunately, the credit card did not go through, please try again.');
            const buttons = banner.element.querySelectorAll('button');
            expect(buttons[0].innerHTML).toEqual('UPDATE');
            expect(buttons[1].innerHTML).toEqual('DISMISS');
        });

        it('Should properly set base classes', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).toBeNull();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerIllustrationElement).toBeNull();
            expect(this.bannerTextElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
            expect(this.bannerRowElement).toBeNull();

            const banner = fixture.componentInstance.banner;
            banner.open();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).toBeDefined();
            expect(this.bannerMessageElement).toBeDefined();
            expect(this.bannerIllustrationElement).toBeDefined();
            expect(this.bannerTextElement).toBeDefined();
            expect(this.bannerActionsElement).toBeDefined();
            expect(this.bannerRowElement).toBeDefined();
        }));

        it('Should initialize banner with at least one and up to two buttons', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerEmptyComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).toBeNull();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerIllustrationElement).toBeNull();
            expect(this.bannerTextElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
            expect(this.bannerRowElement).toBeNull();

            const banner = fixture.componentInstance.banner;
            banner.open();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).not.toBeNull();
            expect(this.bannerMessageElement).not.toBeNull();
            expect(this.bannerIllustrationElement).not.toBeNull();
            expect(this.bannerTextElement).not.toBeNull();
            expect(this.bannerActionsElement).not.toBeNull();
            expect(this.bannerRowElement).not.toBeNull();

            banner.close();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(this.bannerElement).toBeNull();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerIllustrationElement).toBeNull();
            expect(this.bannerTextElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
            expect(this.bannerRowElement).toBeNull();
        }));

        it('Should position buttons next to the banner content', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();

            const banner: IgxBannerComponent = fixture.componentInstance.banner;
            banner.open();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            const bannerMessageElementTop = this.bannerMessageElement.nativeElement.getClientRects().y;
            const bannerActionsElementTop = this.bannerActionsElement.nativeElement.getClientRects().y;

            expect(bannerMessageElementTop).toBe(bannerActionsElementTop);
        }));

        it('Should span the entire width of the parent element', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerOneButtonComponent> = TestBed.createComponent(IgxBannerOneButtonComponent);
            fixture.detectChanges();

            const banner: IgxBannerComponent = fixture.componentInstance.banner;
            banner.open();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            const parentElement = fixture.debugElement.query(By.css('#wrapper'));
            const parentElementRect = parentElement.nativeElement.getBoundingClientRect();

            const bannerElementRect = banner.elementRef.nativeElement.getBoundingClientRect();

            expect(parentElementRect.left).toBe(bannerElementRect.left);
            expect(parentElementRect.top).toBe(bannerElementRect.top);
            expect(parentElementRect.right).toBe(bannerElementRect.right);
            expect(parentElementRect.bottom).toBe(bannerElementRect.bottom);
        }));

        it('Should push parent element content downwards on loading', fakeAsync(() => {
            const fixture: ComponentFixture<IgxBannerSampleComponent> = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();

            let pageContentElement = fixture.debugElement.query(By.css('#content'));
            let pageContentElementTop = pageContentElement.nativeElement.getBoundingClientRect().top;

            const banner: IgxBannerComponent = fixture.componentInstance.banner;
            banner.open();
            tick();
            fixture.detectChanges();

            const bannerElementRect = banner.elementRef.nativeElement.getBoundingClientRect();
            expect(pageContentElementTop).toBe(bannerElementRect.top);

            pageContentElement = fixture.debugElement.query(By.css('#content'));
            pageContentElementTop = pageContentElement.nativeElement.getBoundingClientRect().top;
            expect(pageContentElementTop).toBe(bannerElementRect.bottom);

            banner.close();
            tick();
            fixture.detectChanges();

            pageContentElement = fixture.debugElement.query(By.css('#content'));
            pageContentElementTop = pageContentElement.nativeElement.getBoundingClientRect().top;
            expect(pageContentElementTop).toBe(bannerElementRect.top);
        }));
    });

    describe('Action tests: ', () => {
        it('Should dismiss/confirm banner on button clicking', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            expect(banner.collapsed).toBeTruthy();

            spyOn(banner.onOpened, 'emit');
            spyOn(banner.onClosed, 'emit');
            spyOn(banner, 'onExpansionPanelClose').and.callThrough();
            spyOn(banner, 'onExpansionPanelOpen').and.callThrough();
            spyOn(banner, 'open').and.callThrough();
            spyOn(banner, 'close').and.callThrough();

            banner.open();
            tick();
            fixture.detectChanges();

            expect(banner.open).toHaveBeenCalledTimes(1);
            expect(banner.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(banner.onExpansionPanelOpen).toHaveBeenCalledTimes(1);
            expect(banner.collapsed).toBeFalsy();

            getBaseClassElements(fixture);

            expect(this.bannerMessageElement).not.toBeNull();
            expect(this.bannerIllustrationElement).not.toBeNull();
            expect(this.bannerTextElement).not.toBeNull();
            expect(this.bannerTextElement.nativeElement.innerHTML.trim()).
                toEqual('Unfortunately, the credit card did not go through, please try again.');
            expect(this.bannerActionsElement).not.toBeNull();

            const buttons = this.bannerActionsElement.nativeElement.querySelectorAll('button');
            expect(buttons.length).toEqual(2);
            buttons[0].click();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(banner.close).toHaveBeenCalledTimes(1);
            expect(banner.onClosed.emit).toHaveBeenCalledTimes(1);
            expect(banner.onExpansionPanelClose).toHaveBeenCalledTimes(1);
            expect(banner.collapsed).toBeTruthy();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();

            banner.open();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);

            expect(banner.open).toHaveBeenCalledTimes(2);
            expect(banner.onOpened.emit).toHaveBeenCalledTimes(2);
            expect(banner.onExpansionPanelOpen).toHaveBeenCalledTimes(2);
            expect(banner.collapsed).toBeFalsy();
            expect(this.bannerMessageElement).not.toBeNull();
            expect(this.bannerIllustrationElement).not.toBeNull();
            expect(this.bannerTextElement).not.toBeNull();
            expect(this.bannerTextElement.nativeElement.innerHTML.trim()).
                toEqual('Unfortunately, the credit card did not go through, please try again.');
            expect(this.bannerActionsElement).not.toBeNull();

            buttons[1].click();
            tick();
            fixture.detectChanges();

            getBaseClassElements(fixture);
            expect(banner.close).toHaveBeenCalledTimes(2);
            expect(banner.onClosed.emit).toHaveBeenCalledTimes(2);
            expect(banner.onExpansionPanelClose).toHaveBeenCalledTimes(2);
            expect(banner.collapsed).toBeTruthy();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
        }));

        it('Should not be dismissed on user actions outside the component', () => {
            const fixture = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            const targetDiv = document.createElement('DIV');
            const bannerNode: HTMLElement = banner.elementRef.nativeElement;
            targetDiv.style.height = '3000px';
            targetDiv.style.width = '1000px';
            targetDiv.style.backgroundColor = '#aa44bb';
            targetDiv.tabIndex = 1;
            bannerNode.parentNode.appendChild(targetDiv);
            expect(banner.collapsed).toBeTruthy();
            banner.open();
            fixture.detectChanges();
            expect(banner.collapsed).toBeFalsy();
            targetDiv.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            fixture.detectChanges();
            expect(banner.collapsed).toBeFalsy();
            targetDiv.click();
            fixture.detectChanges();
            expect(banner.collapsed).toBeFalsy();
            targetDiv.focus();
            fixture.detectChanges();
            expect(banner.collapsed).toBeFalsy();
            targetDiv.style.height = '3000px';
            fixture.detectChanges();
            targetDiv.dispatchEvent(new Event('scroll'));
            fixture.detectChanges();
            expect(banner.collapsed).toBeFalsy();
            targetDiv.parentNode.removeChild(targetDiv);
        });

        it('Should properly emit events', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            spyOn(banner.onClosed, 'emit');
            spyOn(banner.onClosing, 'emit');
            spyOn(banner.onOpened, 'emit');
            spyOn(banner.onOpening, 'emit');
            expect(banner.collapsed).toEqual(true);
            expect(banner.onOpening.emit).toHaveBeenCalledTimes(0);
            expect(banner.onOpened.emit).toHaveBeenCalledTimes(0);
            expect(banner.onClosing.emit).toHaveBeenCalledTimes(0);
            expect(banner.onClosed.emit).toHaveBeenCalledTimes(0);
            banner.toggle();
            tick();
            expect(banner.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(banner.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(banner.onClosing.emit).toHaveBeenCalledTimes(0);
            expect(banner.onClosed.emit).toHaveBeenCalledTimes(0);
            banner.toggle();
            tick();
            expect(banner.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(banner.onOpened.emit).toHaveBeenCalledTimes(1);
            expect(banner.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(banner.onClosed.emit).toHaveBeenCalledTimes(1);
        }));

        it('Should properly cancel onOpening and onClosing', fakeAsync(() => {
            const fixture = TestBed.createComponent(SimpleBannerEventsComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            spyOn(banner.onClosing, 'emit').and.callThrough();
            spyOn(banner.onOpening, 'emit').and.callThrough();
            spyOn(banner.onClosed, 'emit').and.callThrough();
            spyOn(banner.onOpened, 'emit').and.callThrough();
            expect(banner.collapsed).toEqual(true);
            fixture.componentInstance.cancelFlag = true;
            banner.toggle();
            tick();
            expect(banner.collapsed).toEqual(true);
            expect(banner.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(banner.onOpened.emit).toHaveBeenCalledTimes(0);
            fixture.componentInstance.cancelFlag = false;
            banner.toggle();
            tick();
            expect(banner.collapsed).toEqual(false);
            expect(banner.onOpening.emit).toHaveBeenCalledTimes(2);
            expect(banner.onOpened.emit).toHaveBeenCalledTimes(1);
            fixture.componentInstance.cancelFlag = true;
            banner.toggle();
            tick();
            expect(banner.collapsed).toEqual(false);
            expect(banner.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(banner.onClosed.emit).toHaveBeenCalledTimes(0);
            fixture.componentInstance.cancelFlag = false;
            banner.toggle();
            tick();
            expect(banner.collapsed).toEqual(true);
            expect(banner.onClosing.emit).toHaveBeenCalledTimes(2);
            expect(banner.onClosed.emit).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Rendering tests: ', () => {
        it('Should apply all appropriate classes on initialization_default template', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxBannerSampleComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            const bannerNode: HTMLElement = banner.elementRef.nativeElement;
            expect(banner.collapsed).toBeTruthy();
            expect(bannerNode.childElementCount).toEqual(1); // collapsed expansion panel
            expect(bannerNode.firstElementChild.childElementCount).toEqual(0); // no content
            getBaseClassElements(fixture);
            expect(this.bannerElement).toBeNull();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerIllustrationElement).toBeNull();
            expect(this.bannerTextElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
            expect(this.bannerRowElement).toBeNull();
            banner.toggle();
            tick();
            fixture.detectChanges();
            getBaseClassElements(fixture);
            expect(this.bannerElement).not.toBeNull();
            expect(this.bannerMessageElement).not.toBeNull();
            expect(this.bannerIllustrationElement).not.toBeNull();
            expect(this.bannerTextElement).not.toBeNull();
            expect(this.bannerActionsElement).not.toBeNull();
            expect(this.bannerRowElement).not.toBeNull();
            banner.toggle();
            tick();
            fixture.detectChanges();
            getBaseClassElements(fixture);
            expect(this.bannerElement).toBeNull();
            expect(this.bannerMessageElement).toBeNull();
            expect(this.bannerIllustrationElement).toBeNull();
            expect(this.bannerTextElement).toBeNull();
            expect(this.bannerActionsElement).toBeNull();
            expect(this.bannerRowElement).toBeNull();
        }));

        it('Should apply all appropriate classes on initialization_custom template', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxBannerCustomTemplateComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            const panel = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            expect(panel).not.toBeNull();
            expect(panel.attributes.getNamedItem('ng-reflect-collapsed').nodeValue).toEqual('true');
            expect(panel.childElementCount).toEqual(0);

            banner.open();
            tick();
            fixture.detectChanges();
            expect(panel.attributes.getNamedItem('ng-reflect-collapsed').nodeValue).toEqual('false');
            expect(panel.childElementCount).toEqual(1);

            const panelBody = panel.children[0];
            expect(panelBody.attributes.getNamedItem('class').nodeValue).toContain(CSS_CLASS_EXPANSION_PANEL_BODY);
            expect(panelBody.attributes.getNamedItem('role').nodeValue).toEqual('region');
            expect(panelBody.childElementCount).toEqual(1);

            // banner > banner__message > banner__text > ng-content (which is igx-card host) > wrapper div with card class
            const card = panelBody.querySelector('igx-card').children[0];
            expect(card.attributes.getNamedItem('class').nodeValue).toContain('igx-card');
            expect(card.attributes.getNamedItem('role').nodeValue).toEqual('group');
            expect(card.childElementCount).toEqual(2);

            const cardHeader = card.children[0];
            expect(cardHeader.childElementCount).toEqual(2);

            const avatar = cardHeader.children[0];
            expect(avatar.attributes.getNamedItem('class').nodeValue).toContain('igx-avatar');
            expect(avatar.attributes.getNamedItem('class').nodeValue).toContain('igx-avatar--rounded');
            expect(avatar.attributes.getNamedItem('class').nodeValue).toContain('igx-avatar--small');
            expect(avatar.attributes.getNamedItem('role').nodeValue).toEqual('img');
            expect(avatar.attributes.getNamedItem('aria-label').nodeValue).toEqual('avatar');
            expect(avatar.childElementCount).toEqual(1);

            const avatarImage = avatar.children[0];
            expect(avatarImage.attributes.getNamedItem('class').nodeValue).toContain('igx-avatar__image');
            expect(avatarImage.childElementCount).toEqual(0);

            const headerGroup = cardHeader.children[1];
            expect(headerGroup.attributes.getNamedItem('class').nodeValue).toContain('igx-card-header__tgroup');
            expect(headerGroup.childElementCount).toEqual(2);

            const headerTitle = headerGroup.children[0];
            expect(headerTitle.attributes.getNamedItem('class').nodeValue).toContain('igx-card-header__title--small');
            expect(headerTitle.innerHTML).toEqual('Brad Stanley');
            expect(headerTitle.childElementCount).toEqual(0);

            const headerSubtitle = headerGroup.children[1];
            expect(headerSubtitle.attributes.getNamedItem('class').nodeValue).toContain('igx-card-header__subtitle');
            expect(headerSubtitle.innerHTML).toEqual('Audi AG');
            expect(headerSubtitle.childElementCount).toEqual(0);

            const cardContent = card.children[1].firstElementChild;
            expect(cardContent.attributes.getNamedItem('class').nodeValue).toContain('igx-card-content__text');
            expect(cardContent.innerHTML).toEqual('Brad Stanley has requested to follow you.');
            expect(cardContent.childElementCount).toEqual(0);
        }));

        it('Should apply the appropriate display style to the banner host', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxBannerOneButtonComponent);
            fixture.detectChanges();
            const banner = fixture.componentInstance.banner;
            // Banner is collapsed, display is '';
            expect(banner.elementRef.nativeElement.style.display).toEqual('');
            banner.toggle();
            tick();
            // Banner is expanded, display is 'block';
            fixture.detectChanges();
            expect(banner.elementRef.nativeElement.style.display).toEqual('block');
            expect(banner.collapsed).toBeFalsy();
            banner.toggle();
            tick(100);
            // Banner is collapsING, display is 'block';
            expect(banner.elementRef.nativeElement.style.display).toEqual('block');
            tick();
            fixture.detectChanges();
            // Banner is collapsed, display is '';
            expect(banner.elementRef.nativeElement.style.display).toEqual('');
            expect(banner.collapsed).toBeTruthy();
        }));
    });

    const getBaseClassElements = <T>(fixture: ComponentFixture<T>) => {
        this.bannerElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER));
        this.bannerMessageElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_MESSAGE));
        this.bannerIllustrationElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ILLUSTRATION));
        this.bannerTextElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_TEXT));
        this.bannerActionsElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ACTIONS));
        this.bannerRowElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_BANNER_ROW));
    };
});

@Component({
    template: `
        <div id="wrapper" style = "width:900px">
            <igx-banner></igx-banner>
        </div>
        <div id="content" style="height:200px; border: 1px solid red;"> SOME PAGE CONTENT</div>`
})
export class IgxBannerEmptyComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
        <div id="wrapper" style = "width:900px;">
            <igx-banner>
                You have lost connection to the internet.
                <igx-banner-actions>
                    <button igxButton="raised">TURN ON WIFI</button>
                </igx-banner-actions>
            </igx-banner>
        </div>
        <div id="content" style="height:200px; border: 1px solid red;"> SOME PAGE CONTENT</div>
    `
})
export class IgxBannerOneButtonComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
        <div id="wrapper" style = "width:900px">
            <igx-banner>
                <igx-icon>error</igx-icon>
                Unfortunately, the credit card did not go through, please try again.
                <igx-banner-actions>
                    <button igxButton="raised" (click)="banner.close()">UPDATE</button>
                    <button igxButton="raised" (click)="banner.close()">DISMISS</button>
                </igx-banner-actions>
            </igx-banner>
        </div>
        <div id="content" style="height:200px; border: 1px solid red;"> SOME PAGE CONTENT</div>
    `
})
export class IgxBannerSampleComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
        <div id="wrapper" style = "width:900px">
            <igx-banner>
                <igx-card>
                    <igx-card-header class="compact">
                        <igx-avatar
                            src="https://www.infragistics.com/angular-demos/assets/images/card/avatars/brad_stanley.jpg"
                            roundShape="true">
                        </igx-avatar>
                        <div class="igx-card-header__tgroup">
                            <h3 class="igx-card-header__title--small">Brad Stanley</h3>
                            <h5 class="igx-card-header__subtitle">Audi AG</h5>
                        </div>
                    </igx-card-header>
                    <igx-card-content>
                        <p class="igx-card-content__text">Brad Stanley has requested to follow you.</p>
                    </igx-card-content>
                </igx-card>
                <igx-banner-actions >
                    <button igxButton igxRipple >Dismiss</button>
                    <button igxButton igxRipple >Approve</button>
                </igx-banner-actions>
            </igx-banner>
        </div>
        <div id="content" style="height:200px; border: 1px solid red;"> SOME PAGE CONTENT</div>`
})
export class IgxBannerCustomTemplateComponent {
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;
}

@Component({
    template: `
        <div id="wrapper" style = "width:900px">
            <igx-banner (onOpening)="handleOpening($event)" (onClosing)="handleClosing($event)">Simple message</igx-banner>
        </div>
        <div id="content" style="height:200px; border: 1px solid red;"> SOME PAGE CONTENT</div>`
})
export class SimpleBannerEventsComponent {
    public cancelFlag = false;
    @ViewChild(IgxBannerComponent, { read: IgxBannerComponent })
    public banner: IgxBannerComponent;

    public handleOpening(event: any) {
        event.cancel = this.cancelFlag;
    }

    public handleClosing(event: any) {
        event.cancel = this.cancelFlag;
    }
}
