
import { Component, OnInit, ViewChild } from '@angular/core';
import { async, TestBed, ComponentFixture, tick, fakeAsync, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import { IgxExpansionPanelModule } from './expansion-panel.module';
import { IgxGridComponent, IgxGridModule } from '../grid';
import { IgxListComponent, IgxListModule } from '../list';
import { IgxExpansionPanelTitleDirective } from './expansion-panel.directives';

const CSS_CLASS_EXPANSION_PANEL = 'igx-expansion-panel';
const CSS_CLASS_PANEL_HEADER = 'igx-expansion-panel__header';
const CSS_CLASS_PANEL_BODY = 'igx-expansion-panel-body';
const CSS_CLASS_HEADER_COLLAPSED = 'igx-expansion-panel__header--collapsed';
const CSS_CLASS_HEADER_EXPANDED = 'igx-expansion-panel__header--expanded';
const CSS_CLASS_LIST = 'igx-list';
const CSS_CLASS_PANEL_BUTTON = 'igx-icon';

describe('igxExpansionPanel', () => {
    beforeEach(async(() => {
        // TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            declarations: [
                IgxExpansionPanelGridComponent,
                IgxExpansionPanelListComponent,
                IgxExpansionPanelSampleComponent,
                HeaderlessComponent
            ],
            imports: [
                IgxExpansionPanelModule,
                NoopAnimationsModule,
                IgxToggleModule,
                IgxRippleModule,
                IgxButtonModule,
                IgxListModule,
                IgxGridModule.forRoot()
            ]
        }).compileComponents();
    }));


    describe('General tests: ', () => {
        it('Should initialize the expansion panel component properly', () => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            expect(fixture.componentInstance).toBeDefined();
            expect(panel).toBeDefined();
            // expect(panel.toggleBtn).toBeDefined();
            // expect(panel.headerButtons).toBeDefined();
            expect(header.disabled).toBeDefined();
            expect(header.disabled).toEqual(false);
            // expect(panel.ariaLabelledBy).toBeDefined();
            // expect(panel.ariaLabelledBy).toEqual('');
            // expect(panel.headerButtons).toBeDefined();
            // expect(panel.headerButtons).toEqual(true);
            expect(panel.animationSettings).toBeDefined();
            expect(panel.collapsed).toBeDefined();
            expect(panel.collapsed).toBeTruthy();
            panel.toggle();
            fixture.detectChanges();
            expect(panel.collapsed).toEqual(false);
        });
        it('Should properly accept input properties', () => {
            const fixture = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            // expect(panel.disabled).toEqual(false);
            // expect(panel.collapsed).toEqual(true);
            // // expect(panel.ariaLabelledBy).toEqual('');
            // // expect(panel.headerButtons).toEqual(true);
            // panel.disabled = true;
            // expect(panel.disabled).toEqual(true);
            panel.collapsed = false;
            expect(panel.collapsed).toEqual(false);
            // panel.labelledby = 'test label area';
            // expect(panel.labelledby).toEqual('test label area');
            panel.headerButtons = false;
            expect(panel.headerButtons).toEqual(false);
        });
        it('Should properly set base classes', () => {
            const fixture = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = document.getElementsByClassName(CSS_CLASS_PANEL_HEADER);
            const headerExpanded = document.getElementsByClassName(CSS_CLASS_HEADER_EXPANDED);
            const panelClass = document.getElementsByClassName(CSS_CLASS_EXPANSION_PANEL);
            expect(header.length).toEqual(1);
            expect(headerExpanded.length).toEqual(0);
            expect(panelClass.length).toEqual(1);
        });
        it('Should properly emit events', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.panel;
            const header = fixture.componentInstance.header;
            const mockEvent = new Event('click');
            expect(panel).toBeTruthy();
            expect(header).toBeTruthy();
            expect(header.disabled).toEqual(false);
            expect(header.panel).toEqual(panel);
            expect(header.onInteraction).toBeDefined();

            spyOn(panel.onCollapsed, 'emit');
            spyOn(panel.onExpanded, 'emit');
            spyOn(header.onInteraction, 'emit');
            spyOn(panel, 'toggle').and.callThrough();
            spyOn(panel, 'expand').and.callThrough();
            spyOn(panel, 'collapse').and.callThrough();

            header.onAction(mockEvent);
            tick();
            expect(panel.onCollapsed.emit).toHaveBeenCalledTimes(0); // Initially collapsed
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);
            expect(panel.toggle).toHaveBeenCalledTimes(1);
            expect(panel.toggle).toHaveBeenCalledWith(mockEvent);
            expect(panel.expand).toHaveBeenCalledTimes(1);
            expect(panel.expand).toHaveBeenCalledWith(mockEvent);
            expect(panel.collapse).toHaveBeenCalledTimes(0);
            expect(panel.onExpanded.emit).toHaveBeenCalledWith({ event: mockEvent });
            expect(header.onInteraction.emit).toHaveBeenCalledWith({ event: mockEvent });

            header.onAction(mockEvent);
            tick();
            expect(panel.onCollapsed.emit).toHaveBeenCalledTimes(1); // First Collapse
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);
            expect(panel.toggle).toHaveBeenCalledTimes(2);
            expect(panel.toggle).toHaveBeenCalledWith(mockEvent);
            expect(panel.expand).toHaveBeenCalledTimes(1);
            expect(panel.collapse).toHaveBeenCalledTimes(1);
            expect(panel.collapse).toHaveBeenCalledWith(mockEvent);
            expect(panel.onCollapsed.emit).toHaveBeenCalledWith({ event: mockEvent });

            header.disabled = true;
            header.onAction(mockEvent);
            tick(); // No additional calls, because panel.disabled === true
            expect(panel.onCollapsed.emit).toHaveBeenCalledTimes(1);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);
            expect(panel.onExpanded.emit).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Expansion tests: ', () => {
        function verifyPanelExpansionState(
            collapsed: boolean,
            panel: IgxExpansionPanelComponent,
            panelContainer: any,
            panelHeader: HTMLElement,
            button: HTMLElement,
            timesCollapsed: number = 0,
            timesExpanded: number = 0) {
            expect(panel.collapsed).toEqual(collapsed);
            const ariaExpanded = collapsed ? 'false' : 'true';
            expect(panelHeader.querySelector('div [role = \'button\']').getAttribute('aria-expanded')).toMatch(ariaExpanded);
            expect(panelHeader.classList.contains(CSS_CLASS_HEADER_EXPANDED)).toEqual(!collapsed);
            const iconName = collapsed ? 'expand_more' : 'expand_less';
            expect(button.getAttribute('ng-reflect-icon-name')).toMatch(iconName);
            if (collapsed) {
                expect(panelContainer.children[1].children.length).toEqual(0);
            } else {
                const panelBody = panelContainer.getElementsByTagName(CSS_CLASS_PANEL_BODY)[0];
                expect(panelBody).toBeDefined();
                const list = panelBody.getElementsByTagName(CSS_CLASS_LIST)[0];
                expect(list).toBeDefined();
            }
            expect(panel.onExpanded.emit).toHaveBeenCalledTimes(timesExpanded);
            expect(panel.onCollapsed.emit).toHaveBeenCalledTimes(timesCollapsed);
        }
        it('Should change panel expansion state on header interaction', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_BUTTON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(3);
        }));
        it('Should change panel expansion state on button clicking', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_BUTTON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            button.click();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);

            button.click();
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);

            button.click();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(3);
        }));
        it('Should change panel expansion state on collapsed property setting', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button =  fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_BUTTON) as HTMLElement;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button);

            panel.collapsed = false;
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button);

            panel.collapsed = true;
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button);

            panel.collapsed = false;
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button);
        }));
        it('Should change panel expansion state using API methods', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_BUTTON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.expand();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.collapse();
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.expand();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.collapse();
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
        }));
        it('Should change panel expansion state using toggle method', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_BUTTON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
        }));
        it('Should change panel expansion state on key interaction', fakeAsync(() => {
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            const spaceEvent = new KeyboardEvent('keydown', { key: 'Space' });
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_BUTTON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.dispatchEvent(enterEvent);
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);

            panelHeader.dispatchEvent(spaceEvent);
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);

            panelHeader.dispatchEvent(enterEvent);
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(3);

            panelHeader.dispatchEvent(spaceEvent);
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(4);
        }));
        it('Should change panel expansion when using different methods', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_BUTTON) as HTMLElement;

            let timesCollapsed = 0;
            let timesExpanded = 0;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.expand();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(1);

            button.click();
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(2);

            panelHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(3);

            panel.collapsed = false;
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panel.toggle();
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));
            tick();
            fixture.detectChanges();
            timesExpanded++;
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(4);

            panel.collapse();
            tick();
            fixture.detectChanges();
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
        }));
        it('Should not be interactable when disabled', fakeAsync(() => {
            const fixture: ComponentFixture<IgxExpansionPanelListComponent> = TestBed.createComponent(IgxExpansionPanelListComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.expansionPanel;
            const header = fixture.componentInstance.header;
            const panelContainer = fixture.nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL);
            const panelHeader = fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_HEADER) as HTMLElement;
            const button =  fixture.nativeElement.querySelector('.' + CSS_CLASS_PANEL_BUTTON) as HTMLElement;
            const headerButton = panelHeader.querySelector('div [role = \'button\']');

            let timesCollapsed = 0;
            const timesExpanded = 1;
            spyOn(panel.onCollapsed, 'emit').and.callThrough();
            spyOn(panel.onExpanded, 'emit').and.callThrough();
            spyOn(header.onInteraction, 'emit');

            panel.expand();
            tick();
            fixture.detectChanges();
            expect(headerButton.getAttribute('aria-disabled')).toMatch('false');
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            header.disabled = true;
            tick();
            fixture.detectChanges();
            expect(headerButton.getAttribute('aria-disabled')).toMatch('true');

            panelHeader.click();
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            button.click();
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            panelHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(false, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            panel.toggle();
            tick();
            fixture.detectChanges();
            expect(headerButton.getAttribute('aria-disabled')).toMatch('true');
            timesCollapsed++;
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);

            panelHeader.click();
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            button.click();
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            panelHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            tick();
            fixture.detectChanges();
            verifyPanelExpansionState(true, panel, panelContainer, panelHeader, button, timesCollapsed, timesExpanded);
            expect(header.onInteraction.emit).toHaveBeenCalledTimes(0);

            header.disabled = false;
            tick();
            fixture.detectChanges();
            expect(headerButton.getAttribute('aria-disabled')).toMatch('false');
        }));

        fdescribe('Aria tests', () => {
            it('Should properly apply default aria properties', fakeAsync(() => {
                const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
                fixture.detectChanges();
                const panel = fixture.componentInstance.panel;
                const panelElement = panel.elementRef.nativeElement;
                const header = fixture.componentInstance.header;
                const headerElement = header.elementRef.nativeElement;
                const title = fixture.componentInstance.title;
                // IgxExpansionPanelHeaderComponent host
                expect(headerElement.getAttribute('aria-level')).toEqual('3');
                expect(headerElement.getAttribute('role')).toEqual('heading');
                // Body of IgxExpansionPanelComponent
                expect(panelElement.lastElementChild.getAttribute('role')).toEqual('region');
                expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(title.id);
                // Button of IgxExpansionPanelHeaderComponent
                expect(headerElement.lastElementChild.getAttribute('role')).toEqual('button');
                expect(headerElement.firstElementChild.getAttribute('aria-controls')).toEqual(panel.id);
                expect(headerElement.firstElementChild.getAttribute('aria-expanded')).toEqual('false');
                expect(headerElement.firstElementChild.getAttribute('aria-disabled')).toEqual('false');
                // Disabled
                header.disabled = true;
                expect(headerElement.firstElementChild.getAttribute('aria-disabled')).toEqual('false');
                panel.expand();
                tick();
                fixture.detectChanges();
                expect(headerElement.firstElementChild.getAttribute('aria-expanded')).toEqual('true');
            }));

            it('Should properly apply aria properties if no header is shown', fakeAsync(() => {
                const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
                fixture.detectChanges();
                fixture.componentInstance.showBody = false;
                fixture.componentInstance.showHeader = false;
                fixture.componentInstance.showTitle = false;
                fixture.detectChanges();
                const panel = fixture.componentInstance.panel;
                const panelElement = panel.elementRef.nativeElement;
                const header = fixture.componentInstance.header;
                expect(header).toBeFalsy();
                const title = fixture.componentInstance.title;
                expect(title).toBeFalsy();
                // Body of IgxExpansionPanelComponent
                expect(panelElement.lastElementChild.getAttribute('role')).toEqual('region');
                expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(null);
                expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`${panelElement.id}-region`);
                panel.expand();
                tick();
                fixture.detectChanges();
            }));

            it('Should update aria properties recording to external change', fakeAsync(() => {
                const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
                fixture.detectChanges();
                const panel = fixture.componentInstance.panel;
                const panelElement = panel.elementRef.nativeElement;
                const header = fixture.componentInstance.header;
                const headerElement = header.elementRef.nativeElement;
                const title = fixture.componentInstance.title;
                // Body of IgxExpansionPanelComponent
                expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(title.id);
                // Button of IgxExpansionPanelHeaderComponent
                expect(headerElement.firstElementChild.getAttribute('aria-controls')).toEqual(panel.id);
                panel.id = 'example-test-panel-id';
                tick();
                fixture.detectChanges();
                tick();
                expect(headerElement.firstElementChild.getAttribute('aria-controls')).toEqual('example-test-panel-id');
                title.id = 'example-title-id';
                tick();
                fixture.detectChanges();
                tick();
                expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual('example-title-id');
            }));

            it('Should update properly label the control region', fakeAsync(() => {
                const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
                fixture.detectChanges();
                const panel = fixture.componentInstance.panel;
                const panelElement = panel.elementRef.nativeElement;
                const title = fixture.componentInstance.title;
                panel.expand();
                tick();
                expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(title.id);
                expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`${panel.id}-region`);
                fixture.componentInstance.showTitle = false;
                tick();
                fixture.detectChanges();
                expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(null);
                expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`${panel.id}-region`);
                panel.label = 'custom-test-label';
                tick();
                fixture.detectChanges();
                expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(null);
                expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`custom-test-label`);
                panel.label = '';
                tick();
                fixture.detectChanges();
                expect(panelElement.lastElementChild.getAttribute('aria-labelledby')).toEqual(null);
                expect(panelElement.lastElementChild.getAttribute('aria-label')).toEqual(`${panel.id}-region`);
            }));
        });
    });
});


@Component({
    template: `
    <igx-expansion-panel #expansionPanel>
<igx-expansion-panel-header headerHeight="50px">
                <igx-expansion-panel-title>Product orders</igx-expansion-panel-title>
                <igx-expansion-panel-description>Product orders details</igx-expansion-panel-description>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>
<igx-grid #grid1 [data] = "data" [autoGenerate]="true" [width]="width" [height]="height">
        </igx-grid>
       </igx-expansion-panel-body>
</igx-expansion-panel>
`
})
export class IgxExpansionPanelGridComponent {

    @ViewChild('expansionPanel', { read: IgxExpansionPanelComponent })
    public expansionPanel: IgxExpansionPanelComponent;
    @ViewChild('grid1', { read: IgxGridComponent })
    public grid1: IgxGridComponent;

    public width = '800px';
    public height = '600px';

    public data = [
        { ProductID: 1, ProductName: 'Chai', InStock: true, UnitsInStock: 2760, OrderDate: '2005-03-21' },
        { ProductID: 2, ProductName: 'Aniseed Syrup', InStock: false, UnitsInStock: 198, OrderDate: '2008-01-15' },
        { ProductID: 3, ProductName: 'Chef Antons Cajun Seasoning', InStock: true, UnitsInStock: 52, OrderDate: '2010-11-20' },
        { ProductID: 4, ProductName: 'Grandmas Boysenberry Spread', InStock: false, UnitsInStock: 0, OrderDate: '2007-10-11' },
        { ProductID: 5, ProductName: 'Uncle Bobs Dried Pears', InStock: false, UnitsInStock: 0, OrderDate: '2001-07-27' },
        { ProductID: 6, ProductName: 'Northwoods Cranberry Sauce', InStock: true, UnitsInStock: 1098, OrderDate: '1990-05-17' },
        { ProductID: 7, ProductName: 'Queso Cabrales', InStock: false, UnitsInStock: 0, OrderDate: '2005-03-03' },
        { ProductID: 8, ProductName: 'Tofu', InStock: true, UnitsInStock: 7898, OrderDate: '2017-09-09' },
        { ProductID: 9, ProductName: 'Teatime Chocolate Biscuits', InStock: true, UnitsInStock: 6998, OrderDate: '2025-12-25' },
        { ProductID: 10, ProductName: 'Chocolate', InStock: true, UnitsInStock: 20000, OrderDate: '2018-03-01' }
    ];
}

@Component({
    template: `
<div style = "width:300px">
<igx-expansion-panel #expansionPanel>
<igx-expansion-panel-header headerHeight="50px">
<igx-expansion-panel-title>Product List</igx-expansion-panel-title>
<igx-expansion-panel-button *ngIf="templatedIcon">
                        {{collapsed() ? 'Expand':'Collapse'}}
                    </igx-expansion-panel-button>
</igx-expansion-panel-header>
<igx-expansion-panel-body>
<igx-list>
<igx-list-item [isHeader]="true">Products</igx-list-item>
<igx-list-item>Product 1</igx-list-item>
<igx-list-item>Product 2</igx-list-item>
<igx-list-item>Product 3</igx-list-item>
<igx-list-item>Product 4</igx-list-item>
<igx-list-item>Product 5</igx-list-item>
</igx-list>
</igx-expansion-panel-body>
</igx-expansion-panel>
</div>
`
})
export class IgxExpansionPanelListComponent {
    @ViewChild(IgxExpansionPanelHeaderComponent, { read: IgxExpansionPanelHeaderComponent })
    public header: IgxExpansionPanelHeaderComponent;
    @ViewChild(IgxExpansionPanelComponent, { read: IgxExpansionPanelComponent })
    public expansionPanel: IgxExpansionPanelComponent;
}


@Component({
    template: `
<igx-expansion-panel
    (onCollapsed)="handleCollapsing($event)"
    (onExpanded)="handleExpanded($event)">
    <igx-expansion-panel-header *ngIf="showHeader" headerHeight="50px">
        <igx-expansion-panel-title *ngIf="showTitle">Example Title</igx-expansion-panel-title>
        <igx-expansion-panel-description>Example Description</igx-expansion-panel-description>
    </igx-expansion-panel-header>
    <igx-expansion-panel-body *ngIf="showBody">
    Example body
    </igx-expansion-panel-body>
</igx-expansion-panel>
`
})
export class IgxExpansionPanelSampleComponent {
    public disabled = false;
    public collapsed = true;
    public showTitle = true;
    public showBody = true;
    public showHeader = true;
    @ViewChild(IgxExpansionPanelHeaderComponent, { read: IgxExpansionPanelHeaderComponent })
    public header: IgxExpansionPanelHeaderComponent;
    @ViewChild(IgxExpansionPanelComponent, { read: IgxExpansionPanelComponent })
    public panel: IgxExpansionPanelComponent;
    @ViewChild(IgxExpansionPanelTitleDirective, { read: IgxExpansionPanelTitleDirective })
    public title: IgxExpansionPanelTitleDirective;
    public handleExpanded(event?) {
    }
    public handleCollapsed(event?) {
    }
    public handleInterraction() {
    }
@Component({
    template: `<igx-expansion-panel>
    <igx-expansion-panel-body>
    Example body
    </igx-expansion-panel-body>
    </igx-expansion-panel>`
})
class HeaderlessComponent {
    public disabled = false;
    public collapsed = true;
    @ViewChild(IgxExpansionPanelHeaderComponent, { read: IgxExpansionPanelHeaderComponent })
    public header: IgxExpansionPanelHeaderComponent;
    @ViewChild(IgxExpansionPanelComponent, { read: IgxExpansionPanelComponent })
    public panel: IgxExpansionPanelComponent;
    @ViewChild(IgxExpansionPanelTitleDirective, { read: IgxExpansionPanelTitleDirective })
    public title: IgxExpansionPanelTitleDirective;

}
