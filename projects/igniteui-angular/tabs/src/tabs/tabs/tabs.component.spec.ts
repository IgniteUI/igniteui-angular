import { provideZonelessChangeDetection, QueryList } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IgxTabItemComponent } from './item/tab-item.component';
import { IgxTabsAlignment, IgxTabsComponent, IgxTabsHeaderPosition } from './tabs.component';
import { IgxTabHeaderComponent } from './header/tab-header.component';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import {
    AddingSelectedTabComponent, BasicTabsComponent, TabsContactsComponent,
    TabsDisabledTestComponent, TabsHeaderPositionComponent, TabsRoutingDisabledTestComponent, TabsRoutingGuardTestComponent,
    TabsRoutingTestComponent, TabsRtlComponent, TabsTabsOnlyModeTest1Component, TabsTest2Component, TabsTestBug4420Component,
    TabsTestComponent, TabsTestCustomStylesComponent, TabsTestHtmlAttributesComponent, TabsTestSelectedTabComponent,
    TabsWithPrefixSuffixTestComponent, TemplatedTabsTestComponent, ZonelessTabsCollectionComponent
} from '../../../../test-utils/tabs-components.spec';
import { frames, UIInteractions, wait } from '../../../../test-utils/ui-interactions.spec';
import { IgxTabContentComponent } from './content/tab-content.component';
import { RoutingTestGuard } from '../../../../test-utils/routing-test-guard.spec';
import { RoutingView1Component, RoutingView2Component, RoutingView3Component, RoutingView4Component, RoutingView5Component } from '../../../../test-utils/routing-view-components.spec';
import { describe, it, expect, beforeEach, afterEach, onTestFinished, vi } from 'vitest';

const KEY_RIGHT_EVENT = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
const KEY_LEFT_EVENT = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
const KEY_HOME_EVENT = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
const KEY_END_EVENT = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
const KEY_ENTER_EVENT = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
const KEY_SPACE_EVENT = new KeyboardEvent('keydown', { key: ' ', bubbles: true });

const rectOf = (element: Element) => element.getBoundingClientRect();
const isDisplayed = (element: HTMLElement) => getComputedStyle(element).display !== 'none';
const headersOf = (tabs: IgxTabsComponent) => tabs.items.map(item => item.headerComponent.nativeElement);
const contentOf = (tabs: IgxTabsComponent) =>
    tabs.headerContainer.nativeElement.parentElement.querySelector<HTMLElement>(':scope > .igx-tabs-content');

const expectNear = (actual: number, expected: number, tolerance = 1) =>
    expect(Math.abs(actual - expected), `${actual} should be within ${tolerance}px of ${expected}`).toBeLessThanOrEqual(tolerance);

const expectHeaderLayout = (tabs: IgxTabsComponent, position: IgxTabsHeaderPosition) => {
    const host = rectOf(tabs.headerContainer.nativeElement.parentElement);
    const headerContainer = rectOf(tabs.headerContainer.nativeElement);
    const content = rectOf(contentOf(tabs));
    const headers = headersOf(tabs).map(rectOf);
    const orientation = tabs.itemsWrapper.nativeElement.getAttribute('aria-orientation');

    if (position === 'top') {
        expect(orientation).toBe('horizontal');
        expectNear(headerContainer.width, host.width);
        expect(headerContainer.bottom).toBeLessThanOrEqual(content.top + 1);
        headers.forEach(header => expectNear(header.top, headers[0].top));
        return;
    }

    expect(orientation).toBe('vertical');
    expectNear(headerContainer.height, host.height);
    expectNear(content.height, host.height);
    expectNear(headerContainer.width + content.width, host.width);
    expect(content.width).toBeGreaterThan(0);

    if (position === 'left') {
        expectNear(headerContainer.left, host.left);
        expect(headerContainer.right).toBeLessThanOrEqual(content.left + 1);
    } else {
        expectNear(headerContainer.right, host.right);
        expect(headerContainer.left).toBeGreaterThanOrEqual(content.right - 1);
    }

    headers.forEach((header, i) => {
        expectNear(header.left, headerContainer.left);
        expectNear(header.width, headerContainer.width);
        if (i > 0) {
            expect(header.top).toBeGreaterThanOrEqual(headers[i - 1].bottom - 1);
        }
    });
};

const expectIndicatorAt = (tabs: IgxTabsComponent, header: HTMLElement, position: IgxTabsHeaderPosition, thickness = 2) => {
    const indicator = rectOf(tabs.selectedIndicator.nativeElement);
    const headerRect = rectOf(header);

    if (position === 'top') {
        expectNear(indicator.left, headerRect.left);
        expectNear(indicator.width, headerRect.width);
        expectNear(indicator.height, thickness, 0.5);
        expectNear(indicator.bottom, rectOf(tabs.itemsWrapper.nativeElement).bottom);
        return;
    }

    const headerContainer = rectOf(tabs.headerContainer.nativeElement);
    expectNear(indicator.top, headerRect.top);
    expectNear(indicator.height, headerRect.height);
    expectNear(indicator.width, thickness, 0.5);
    if (position === 'left') {
        expectNear(indicator.right, headerContainer.right);
    } else {
        expectNear(indicator.left, headerContainer.left);
    }
};

const expectInView = (tabs: IgxTabsComponent, element: HTMLElement) => {
    const viewPort = rectOf(tabs.viewPort.nativeElement);
    const rect = rectOf(element);
    expect(rect.top).toBeGreaterThanOrEqual(viewPort.top - 1);
    expect(rect.bottom).toBeLessThanOrEqual(viewPort.bottom + 1);
    expect(rect.left).toBeGreaterThanOrEqual(viewPort.left - 1);
    expect(rect.right).toBeLessThanOrEqual(viewPort.right + 1);
};

const chevronDirection = (button: HTMLElement, glyphX: number) => {
    const toMatrix = (element: Element) => {
        const transform = getComputedStyle(element).transform;
        return new DOMMatrix(transform === 'none' ? '' : transform);
    };
    const matrix = toMatrix(button).multiply(toMatrix(button.querySelector('igx-icon')));
    const point = matrix.transformPoint(new DOMPoint(glyphX, 0));
    return { x: Math.round(point.x) + 0, y: Math.round(point.y) + 0 };
};

describe('IgxTabs', () => {
    const tabItemNormalCssClass = 'igx-tab-header';
    const tabItemSelectedCssClass = 'igx-tab-header--selected';
    const headerScrollCssClass = 'igx-tabs-header-scroll';
    const testRoutes = [
        { path: 'view1', component: RoutingView1Component, canActivate: [RoutingTestGuard] },
        { path: 'view2', component: RoutingView2Component, canActivate: [RoutingTestGuard] },
        { path: 'view3', component: RoutingView3Component, canActivate: [RoutingTestGuard] },
        { path: 'view4', component: RoutingView4Component, canActivate: [RoutingTestGuard] },
        { path: 'view5', component: RoutingView5Component, canActivate: [RoutingTestGuard] }
    ];

    // Helper function to get the left and right spaces of the container
    function getLeftAndRightSpaces(headers: string | any[], container: { offsetWidth: number; }) {
        const leftSpace = headers[0].offsetLeft;
        const rightSpace = container.offsetWidth - (headers[headers.length - 1].offsetLeft + headers[headers.length - 1].offsetWidth);
        return { leftSpace, rightSpace };
    }

    beforeEach(async () => {

        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                RouterTestingModule.withRoutes(testRoutes),
                TabsTestHtmlAttributesComponent,
                TabsTestComponent,
                TabsTest2Component,
                TemplatedTabsTestComponent,
                TabsRoutingDisabledTestComponent,
                TabsTestSelectedTabComponent,
                TabsTestCustomStylesComponent,
                TabsTestBug4420Component,
                TabsRoutingTestComponent,
                TabsTabsOnlyModeTest1Component,
                TabsDisabledTestComponent,
                TabsRoutingGuardTestComponent,
                TabsWithPrefixSuffixTestComponent,
                TabsContactsComponent,
                AddingSelectedTabComponent,
                TabsRtlComponent,
                TabsHeaderPositionComponent
            ],
            providers: [RoutingTestGuard]
        }).compileComponents();
    });

    describe('IgxTabs Html Attributes', () => {
        let fixture;

        beforeEach(async () => {
            fixture = TestBed.createComponent(TabsTestHtmlAttributesComponent);
            fixture.detectChanges();
        });

        it('should set the correct attributes on the html elements', async () => {
            const igxTabs = document.querySelectorAll('igx-tabs');
            expect(igxTabs.length).toBe(2);
            const initialIndex = parseInt(document.querySelector('igx-tab-header').id.replace('igx-tabs-header-', ''), 10);

            igxTabs.forEach((tab, i) => {
                const tabHeaders = tab.querySelectorAll('igx-tab-header');
                const tabPanels = tab.querySelectorAll('igx-tab-content');
                expect(tabHeaders.length).toBe(3);
                expect(tabPanels.length).toBe(3);

                for (let itemIndex = 0; itemIndex < 3; itemIndex++) {
                    const headerId = `igx-tabs-header-${initialIndex + itemIndex + 3 * i}`;
                    const panelId = `igx-tabs-content-${initialIndex + itemIndex + 3 * i}`;

                    expect(tabHeaders[itemIndex].id).toEqual(headerId);
                    expect(tabPanels[itemIndex].id).toEqual(panelId);

                    expect(tabHeaders[itemIndex].getAttribute('aria-controls')).toEqual(panelId);
                    expect(tabPanels[itemIndex].getAttribute('aria-labelledby')).toEqual(headerId);
                }
            });
        });
    });

    describe('IgxTabs Component with static Panels Definitions', () => {
        let fixture;
        let tabs;

        beforeEach(async () => {
            fixture = TestBed.createComponent(TabsTestComponent);
            fixture.detectChanges();
            tabs = fixture.componentInstance.tabs;
        });

        it('should initialize igx-tabs, igx-tab-content and igx-tab-item', async () => {
            await wait();
            fixture.detectChanges();

            const panels: IgxTabContentComponent[] = tabs.panels.toArray();
            const tabsItems: IgxTabItemComponent[] = tabs.items.toArray();

            expect(tabs).toBeDefined();
            expect(tabs instanceof IgxTabsComponent).toBeTruthy();
            expect(tabs.panels instanceof QueryList).toBeTruthy();
            expect(tabs.panels.length).toBe(3);

            for (let i = 0; i < tabs.panels.length; i++) {
                expect(panels[i] instanceof IgxTabContentComponent).toBeTruthy();
                expect(panels[i].tab).toBe(tabsItems[i]);
            }

            expect(tabs.items.length).toBe(3);

            for (let i = 0; i < tabs.items.length; i++) {
                expect(tabsItems[i] instanceof IgxTabItemComponent).toBeTruthy();
                expect(tabsItems[i].panelComponent).toBe(panels[i]);
            }
            await fixture.whenStable();
        });

        it('should initialize default values of properties', async () => {
            await wait();
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);

            await wait();
            fixture.detectChanges();

            const tabItems = tabs.items.toArray();
            expect(tabItems[0].disabled).toBe(false);
            expect(tabItems[1].disabled).toBe(false);
        });

        it('should initialize set/get properties', async () => {
            const icons = ['library_music', 'video_library', 'library_books'];

            await wait();
            fixture.detectChanges();

            const tabItems = tabs.items.toArray();
            const tabHeaders = tabItems.map(item => item.headerComponent);
            const tabHeaderElements = tabHeaders.map(item => item.nativeElement);

            for (let i = 0; i < tabHeaderElements.length; i++) {
                const headerDiv = tabHeaderElements[i].firstChild;
                expect(headerDiv.firstChild.localName).toBe('igx-icon');
                expect(headerDiv.firstChild.textContent).toBe(icons[i]);
                expect(headerDiv.lastChild.localName).toBe('span');
                expect(headerDiv.lastChild.textContent).toBe('Tab ' + (i + 1));
            }
            await fixture.whenStable();
        });

        it('should select/deselect tabs', async () => {
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);

            await wait();
            fixture.detectChanges();
            const tabItems = tabs.items.toArray();
            const tab1: IgxTabItemComponent = tabItems[0];
            const tab2: IgxTabItemComponent = tabItems[1];

            tab2.selected = true;

            await wait();
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(1);
            expect(tabs.selectedItem).toBe(tab2);
            expect(tab2.selected).toBeTruthy();
            expect(tab1.selected).toBeFalsy();

            tab1.selected = true;

            await wait();
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedItem).toBe(tab1);
            expect(tab1.selected).toBeTruthy();
            expect(tab2.selected).toBeFalsy();

            // Disabled tab is selectable programmatically
            tab2.disabled = true;
            await wait();
            fixture.detectChanges();

            tab2.selected = true;

            await wait();
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(1);
            expect(tabs.selectedItem).toBe(tab2);
            expect(tab2.selected).toBeTruthy();
            expect(tab1.selected).toBeFalsy();
        });

        it('should select next/previous tab when pressing right/left arrow', async () => {
            await wait();
            fixture.detectChanges();
            const headers = tabs.items.map(item => item.headerComponent.nativeElement);

            headers[0].focus();
            headers[0].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            headers[1].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            headers[2].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            headers[0].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            headers[2].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);
        });

        it('should select first/last tab when pressing home/end button', async () => {
            await wait();
            fixture.detectChanges();
            const headers = tabs.items.map(item => item.headerComponent.nativeElement);

            headers[0].focus();
            headers[0].dispatchEvent(KEY_END_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            headers[2].dispatchEvent(KEY_HOME_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);
        });

        it('should scroll tab area when clicking left/right scroll buttons', async () => {
            await wait();
            fixture.detectChanges();

            fixture.componentInstance.wrapperDiv.nativeElement.style.width = '200px';
            await wait();
            fixture.detectChanges();

            const rightScrollButton = tabs.headerContainer.nativeElement.children[2];
            window.dispatchEvent(new Event('resize'));
            rightScrollButton.dispatchEvent(new Event('click', { bubbles: true }));

            await wait();
            fixture.detectChanges();
            expect(tabs.offset).toBeGreaterThan(0);

            tabs.scrollPrev(null);

            await wait();
            fixture.detectChanges();
            expect(tabs.offset).toBe(0);
        });

        it('should select tab on click', async () => {
            await wait();
            fixture.detectChanges();
            const headers = tabs.items.map(item => item.headerComponent.nativeElement);

            fixture.componentInstance.wrapperDiv.nativeElement.style.width = '400px';
            await wait();
            fixture.detectChanges();

            headers[2].dispatchEvent(new Event('click', { bubbles: true }));
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            headers[0].dispatchEvent(new Event('click', { bubbles: true }));
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);
        });

        it('should not select disabled tabs when navigating with left/right/home/end', async () => {
            fixture = TestBed.createComponent(TabsDisabledTestComponent);
            tabs = fixture.componentInstance.tabs;
            await wait();
            fixture.detectChanges();
            const headerElements = tabs.items.map(item => item.headerComponent.nativeElement);

            headerElements[1].click();
            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            headerElements[3].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            headerElements[1].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            headerElements[3].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            headerElements[1].dispatchEvent(KEY_END_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            headerElements[3].dispatchEvent(KEY_HOME_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(1);
        });
    });

    describe('IgxTabs Component with custom content in headers', () => {
        let fixture;
        let tabs;

        beforeEach(async () => {
            fixture = TestBed.createComponent(TemplatedTabsTestComponent);
            tabs = fixture.componentInstance.tabs;
        });

        it('should initialize igx-tab-header with custom content', async () => {
            await wait();
            fixture.detectChanges();
            expect(tabs.items.length).toBe(3);
            const headerDivs = tabs.items.map(item => item.headerComponent.nativeElement.firstChild); //Get header's div containers

            headerDivs.forEach((header, i) => {
                expect(header.firstChild.textContent).toBe(`T${i + 1}`);
                expect(header.lastChild.textContent).toBe(`Tab ${i + 1}`);
            });
            await fixture.whenStable();
        });

        it('should change selection in runtime using selectedIndex', async () => {
            await wait();
            fixture.detectChanges();

            const tabsItems = tabs.items.toArray();
            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedItem).toBe(tabsItems[0]);

            tabs.selectedIndex = 2;
            await wait();
            fixture.detectChanges();

            expect(tabs.selectedItem).toBe(tabsItems[2]);
            expect(tabs.selectedItem.headerComponent.nativeElement.firstChild.lastChild.textContent).toBe('Tab 3');
        });

    });

    describe('IgxTabs Miscellaneous Tests', () => {

        it('check selection when tabs collection is modified', async () => {
            const fixture = TestBed.createComponent(TabsTest2Component);
            const tabs = fixture.componentInstance.tabs;
            fixture.detectChanges();

            await wait();
            fixture.detectChanges();

            const tabItems = tabs.items.toArray();
            const tab3: IgxTabItemComponent = tabItems[2];

            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            tab3.selected = true;
            await wait();
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(2);

            fixture.componentInstance.resetCollectionFourTabs();
            fixture.detectChanges();
            await wait();
            expect(tabs.selectedIndex).toBe(2);

            fixture.componentInstance.resetCollectionOneTab();
            await wait();
            fixture.detectChanges();

            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            fixture.componentInstance.resetCollectionTwoTabs();
            await wait();
            fixture.detectChanges();

            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(0);

            fixture.componentInstance.resetToEmptyCollection();
            await wait();
            fixture.detectChanges();

            await wait();
            fixture.detectChanges();
            expect(tabs.panels.length).toBe(0);
            expect(tabs.selectedItem).toBe(null);
        });

        it('should select third tab by default', async () => {
            const fixture = TestBed.createComponent(TabsTestSelectedTabComponent);
            const tabs = fixture.componentInstance.tabs;

            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            await wait();
            fixture.detectChanges();
            expect(tabs.items.toArray()[2].selected).toBeTruthy();

            await wait();
            fixture.detectChanges();
            expect(tabs.selectedIndicator.nativeElement.style.transform).toBe('translate(180px)');
        });

        it('tabs in drop down, bug #4420 - check selection indicator width', async () => {
            const fixture = TestBed.createComponent(TabsTestBug4420Component);
            const dom = fixture.debugElement;
            const tabs = fixture.componentInstance.tabs;
            await wait(50);
            fixture.detectChanges();

            const button = dom.query(By.css('.igx-button--flat'));
            UIInteractions.simulateClickAndSelectEvent(button);
            await wait();
            fixture.detectChanges();
            await wait();
            fixture.detectChanges();

            expect(tabs.selectedIndex).toBe(1);
            const selectedPanel = document.getElementsByTagName('igx-tab-content')[1] as HTMLElement;
            expect(selectedPanel.textContent.trim()).toEqual('Tab content 2');
            const indicator = dom.query(By.css('.igx-tabs-header__active-indicator'));
            expect(indicator.nativeElement.style.width).toBe('90px');
        });

        it('add a tab with selected set to true', async () => {
            const fixture = TestBed.createComponent(AddingSelectedTabComponent);
            const tabs = fixture.componentInstance.tabs;
            fixture.detectChanges();

            await wait();
            fixture.detectChanges();

            expect(tabs.items.length).toBe(2);
            expect(tabs.selectedIndex).toBe(0);

            fixture.componentInstance.addTab();
            fixture.detectChanges();
            await wait();

            expect(tabs.items.length).toBe(3);
            expect(tabs.selectedIndex).toBe(2);
        });

        it('should keep the added selected tab in view when it makes the header overflow', async () => {
            const fixture = TestBed.createComponent(AddingSelectedTabComponent);
            const tabs = fixture.componentInstance.tabs;
            const host = fixture.debugElement.query(By.css('igx-tabs')).nativeElement as HTMLElement;
            // Two tabs fit, the third one brings in the scroll buttons.
            host.style.width = '230px';
            // Assert on the final scroll position rather than on the smooth scroll animation.
            tabs.viewPort.nativeElement.style.scrollBehavior = 'auto';
            fixture.detectChanges();
            // Let the resize observer settle the initial scroll button state.
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            await wait();

            const nextButton = tabs.scrollNextButton.nativeElement as HTMLButtonElement;
            expect(nextButton.clientWidth).toBeFalsy();

            fixture.componentInstance.addTab();
            fixture.detectChanges();
            await wait();

            expect(nextButton.clientWidth).toBeTruthy();
            expect(tabs.selectedIndex).toBe(2);

            const viewPort = tabs.viewPort.nativeElement.getBoundingClientRect();
            const header = tabs.items.get(2).headerComponent.nativeElement.getBoundingClientRect();
            expect(header.left).toBeGreaterThanOrEqual(viewPort.left - 1);
            expect(header.right).toBeLessThanOrEqual(viewPort.right + 1);
        });
    });

    describe('Routing Navigation Tests', () => {
        let router;
        let location;
        let fixture;
        let tabsComp;
        let headerElements;
        let tabItems;

        beforeEach(async () => {
            router = TestBed.inject(Router);
            location = TestBed.inject(Location);
            fixture = TestBed.createComponent(TabsRoutingTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);
        });

        it('should navigate to the correct URL when clicking on tab buttons', async () => {
            fixture.ngZone.run(() => router.initialNavigation());
            await fixture.whenStable();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => {
                UIInteractions.simulateClickAndSelectEvent(headerElements[2]);
            });
            await fixture.whenStable();
            expect(location.path()).toBe('/view3');

            fixture.ngZone.run(() => {
                UIInteractions.simulateClickAndSelectEvent(headerElements[1]);
            });
            await fixture.whenStable();
            expect(location.path()).toBe('/view2');

            fixture.ngZone.run(() => {
                UIInteractions.simulateClickAndSelectEvent(headerElements[0]);
            });
            await fixture.whenStable();
            expect(location.path()).toBe('/view1');
        });

        it('should select the correct tab button/panel when navigating an URL', async () => {
            fixture.ngZone.run(() => router.initialNavigation());
            await fixture.whenStable();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => {
                router.navigate(['/view3']);
            });
            await fixture.whenStable();
            expect(location.path()).toBe('/view3');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(tabItems[2].selected).toBe(true);
            expect(tabItems[0].selected).toBe(false);
            expect(tabItems[1].selected).toBe(false);

            fixture.ngZone.run(() => {
                router.navigate(['/view2']);
            });
            await fixture.whenStable();
            expect(location.path()).toBe('/view2');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(1);
            expect(tabItems[1].selected).toBe(true);
            expect(tabItems[0].selected).toBe(false);
            expect(tabItems[2].selected).toBe(false);

            fixture.ngZone.run(() => {
                router.navigate(['/view1']);
            });
            await fixture.whenStable();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(tabItems[0].selected).toBe(true);
            expect(tabItems[1].selected).toBe(false);
            expect(tabItems[2].selected).toBe(false);
        });

        it('should focus next/previous tab when pressing right/left arrow', async () => {
            tabsComp.activation = 'manual';
            await fixture.whenStable();
            fixture.detectChanges();

            headerElements[0].click();
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            headerElements[0].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[1]);

            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[0]);

            headerElements[0].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[1]);
        });

        it('should focus first/last tab when pressing home/end button', async () => {
            tabsComp.activation = 'manual';
            await fixture.whenStable();
            fixture.detectChanges();

            headerElements[0].click();
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            headerElements[0].dispatchEvent(KEY_END_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_HOME_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[0]);
        });

        it('should select focused tabs on enter/space', async () => {
            tabsComp.activation = 'manual';
            await fixture.whenStable();
            fixture.detectChanges();

            headerElements[0].click();
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            headerElements[0].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_ENTER_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_HOME_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(document.activeElement).toBe(headerElements[0]);

            headerElements[0].dispatchEvent(KEY_SPACE_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[0]);
        });

        it('should not focus disabled tabs when navigating with keyboard', async () => {
            fixture = TestBed.createComponent(TabsRoutingDisabledTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);

            headerElements[1].click();
            await wait();
            fixture.detectChanges();

            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(document.activeElement).toBe(headerElements[3]);

            headerElements[3].dispatchEvent(KEY_HOME_EVENT);
            await wait();
            fixture.detectChanges();
            expect(document.activeElement).toBe(headerElements[1]);

            headerElements[1].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(document.activeElement).toBe(headerElements[3]);
        });

        it('should not navigate to an URL blocked by activate guard', async () => {
            fixture = TestBed.createComponent(TabsRoutingGuardTestComponent);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);

            fixture.ngZone.run(() => {
                router.initialNavigation();
            });
            await fixture.whenStable();
            expect(location.path()).toBe('/');

            fixture.ngZone.run(() => {
                UIInteractions.simulateClickAndSelectEvent(headerElements[0]);
            });
            await fixture.whenStable();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(tabItems[0].selected).toBe(true);
            expect(tabItems[1].selected).toBe(false);

            fixture.ngZone.run(() => {
                UIInteractions.simulateClickAndSelectEvent(headerElements[1]);
            });
            await fixture.whenStable();
            expect(location.path()).toBe('/view1');
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(tabItems[0].selected).toBe(true);
            expect(tabItems[1].selected).toBe(false);
        });

        it('should set auto activation mode by default and change selectedIndex on arrow keys', async () => {
            expect(tabsComp.activation).toBe('auto');

            headerElements[0].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(1);

            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
        });

        it('should update focus and selectedIndex correctly in auto mode when navigating with arrow keys', async () => {
            expect(tabsComp.selectedIndex).toBe(-1);

            headerElements[0].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(1);
            expect(document.activeElement).toBe(headerElements[1]);

            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
            expect(document.activeElement).toBe(headerElements[2]);

            headerElements[2].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(1);
            expect(document.activeElement).toBe(headerElements[1]);

            headerElements[1].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[0]);
        });

        it('should not change selectedIndex when using arrow keys in manual mode', async () => {
            tabsComp.activation = 'manual';
            fixture.detectChanges();

            headerElements[0].click();
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            headerElements[0].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[1]);

            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[2]);
        });

        it('should select focused tab on Enter or Space in manual mode', async () => {
            tabsComp.activation = 'manual';
            fixture.detectChanges();

            headerElements[0].click();
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);

            headerElements[0].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(0);
            expect(document.activeElement).toBe(headerElements[1]);

            headerElements[1].dispatchEvent(KEY_ENTER_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(1);

            headerElements[1].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fixture.detectChanges();
            headerElements[2].dispatchEvent(KEY_SPACE_EVENT);
            await wait();
            fixture.detectChanges();
            expect(tabsComp.selectedIndex).toBe(2);
        });
    });

    describe('Tabs-only Mode With Initial Selection Set on TabItems Tests', () => {
        let fixture;
        let tabsComp;
        let tabItems;
        let headerElements;

        beforeEach(async () => {
            fixture = TestBed.createComponent(TabsTabsOnlyModeTest1Component);
            tabsComp = fixture.componentInstance.tabs;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);
        });

        it('should retain the correct initial selection set by the isSelected property', () => {
            expect(tabItems[0].selected).toBe(false);
            expect(headerElements[0].classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(tabItems[1].selected).toBe(true);
            expect(headerElements[1].classList.contains(tabItemSelectedCssClass)).toBe(true);

            expect(tabItems[2].selected).toBe(false);
            expect(headerElements[2].classList.contains(tabItemNormalCssClass)).toBe(true);
        });

        it('should hide the selection indicator when no tab item is selected', () => {
            expect(tabsComp.selectedIndicator.nativeElement.style.visibility).toBe('visible');
            tabItems[1].selected = false;
            fixture.detectChanges();
            expect(tabsComp.selectedIndicator.nativeElement.style.visibility).toBe('hidden');
        });
    });

    describe('Tabs-only Mode With Initial Selection Set on Tabs Component Tests', () => {
        let fixture;
        let tabsComp;
        let tabItems;
        let headerElements;

        beforeEach(async () => {
            fixture = TestBed.createComponent(TabsTabsOnlyModeTest1Component);
            tabsComp = fixture.componentInstance.tabs;
            tabsComp.selectedIndex = 2;
            fixture.detectChanges();
            tabItems = tabsComp.items.toArray();
            headerElements = tabItems.map(item => item.headerComponent.nativeElement);
        });

        it('should retain the correct initial selection set by the selectedIndex property', () => {
            fixture.detectChanges();

            expect(tabItems[0].selected).toBe(false);
            expect(headerElements[0].classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(tabItems[1].selected).toBe(false);
            expect(headerElements[1].classList.contains(tabItemNormalCssClass)).toBe(true);

            expect(tabItems[2].selected).toBe(true);
            expect(headerElements[2].classList.contains(tabItemSelectedCssClass)).toBe(true);
        });

    });

    describe('Events', () => {
        let fixture;
        let tabs;
        let tabItems;
        let headers;
        let itemChangeSpy;
        let indexChangeSpy;
        let indexChangingSpy;

        describe('', () => {
            beforeEach(async () => {
                fixture = TestBed.createComponent(TabsTestComponent);
                fixture.detectChanges();
                tabs = fixture.componentInstance.tabs;
                tabItems = tabs.items.toArray();
                headers = tabItems.map(item => item.headerComponent.nativeElement);
                itemChangeSpy = vi.spyOn(tabs.selectedItemChange, 'emit');
                indexChangeSpy = vi.spyOn(tabs.selectedIndexChange, 'emit');
                indexChangingSpy = vi.spyOn(tabs.selectedIndexChanging, 'emit');
            });

            it('Validate the fired events on clicking tab headers.', async () => {
                await wait();

                headers[1].dispatchEvent(new Event('click', { bubbles: true }));
                await wait();
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(1);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 0,
                    newIndex: 1
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(1);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[0],
                    newItem: tabItems[1]
                });
            });

            it('Cancel selectedIndexChanging event.', async () => {
                await wait();
                tabs.selectedIndexChanging.pipe().subscribe((e) => e.cancel = true);
                fixture.detectChanges();

                headers[1].dispatchEvent(new Event('click', { bubbles: true }));
                await wait();
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(0);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: true,
                    oldIndex: 0,
                    newIndex: 1
                });
                expect(indexChangeSpy).not.toHaveBeenCalled();
                expect(itemChangeSpy).not.toHaveBeenCalled();
            });

            it('Validate the fired events when navigating between tabs with left and right arrows.', async () => {
                await wait();

                headers[0].focus();
                headers[0].dispatchEvent(KEY_RIGHT_EVENT);
                await wait();
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(1);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 0,
                    newIndex: 1
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(1);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[0],
                    newItem: tabItems[1]
                });

                headers[1].dispatchEvent(KEY_LEFT_EVENT);
                await wait();
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(0);

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 1,
                    newIndex: 0
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(0);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[1],
                    newItem: tabItems[0]
                });
            });

            it('Validate the fired events when navigating between tabs with home and end keys.', async () => {
                await wait();

                headers[0].focus();
                headers[0].dispatchEvent(KEY_END_EVENT);
                await wait();
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(2);

                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[0],
                    newItem: tabItems[2]
                });
                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 0,
                    newIndex: 2
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(2);

                headers[2].dispatchEvent(KEY_HOME_EVENT);
                await wait();
                fixture.detectChanges();
                expect(tabs.selectedIndex).toBe(0);

                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[2],
                    newItem: tabItems[0]
                });
                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 2,
                    newIndex: 0
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(0);
            });
        });

        describe('& Routing', () => {
            let router;
            let location;
            beforeEach(async () => {
                router = TestBed.inject(Router);
                location = TestBed.inject(Location);
                fixture = TestBed.createComponent(TabsRoutingTestComponent);
                tabs = fixture.componentInstance.tabs;
                fixture.detectChanges();
                tabItems = tabs.items.toArray();
                headers = tabItems.map(item => item.headerComponent.nativeElement);
                itemChangeSpy = vi.spyOn(tabs.selectedItemChange, 'emit');
                indexChangeSpy = vi.spyOn(tabs.selectedIndexChange, 'emit');
                indexChangingSpy = vi.spyOn(tabs.selectedIndexChanging, 'emit');
            });

            it('Validate the events are not fired on clicking tab headers before pressing enter/space key.', async () => {
                fixture.ngZone.run(() => router.initialNavigation());
                await fixture.whenStable();
                expect(location.path()).toBe('/');

                fixture.ngZone.run(() => {
                    UIInteractions.simulateClickAndSelectEvent(headers[1]);
                });
                await fixture.whenStable();
                expect(location.path()).toBe('/view2');
                expect(tabs.selectedIndex).toBe(-1);

                expect(indexChangingSpy).not.toHaveBeenCalled();
                expect(indexChangeSpy).not.toHaveBeenCalled();
                expect(itemChangeSpy).not.toHaveBeenCalled();

                headers[1].dispatchEvent(KEY_ENTER_EVENT);
                await wait();
                fixture.detectChanges();

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: -1,
                    newIndex: 1
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(1);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: undefined,
                    newItem: tabItems[1]
                });
            });

            it('Validate the events are not fired when navigating between tabs with arrow keys before pressing enter/space key.', async () => {
                tabs.activation = 'manual';
                await fixture.whenStable();
                fixture.detectChanges();

                await wait();
                headers[0].focus();

                headers[0].dispatchEvent(KEY_LEFT_EVENT);
                await wait();
                fixture.detectChanges();

                expect(indexChangingSpy).not.toHaveBeenCalled();
                expect(indexChangeSpy).not.toHaveBeenCalled();
                expect(itemChangeSpy).not.toHaveBeenCalled();

                headers[2].dispatchEvent(KEY_ENTER_EVENT);
                await wait();
                fixture.detectChanges();

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: -1,
                    newIndex: 2
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(2);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: undefined,
                    newItem: tabItems[2]
                });

                expect(indexChangingSpy).toHaveBeenCalledTimes(1);
                expect(indexChangeSpy).toHaveBeenCalledTimes(1);
                expect(itemChangeSpy).toHaveBeenCalledTimes(1);

                headers[2].dispatchEvent(KEY_RIGHT_EVENT);
                await wait();
                fixture.detectChanges();

                expect(indexChangingSpy).toHaveBeenCalledTimes(1);
                expect(indexChangeSpy).toHaveBeenCalledTimes(1);
                expect(itemChangeSpy).toHaveBeenCalledTimes(1);

                headers[0].dispatchEvent(KEY_SPACE_EVENT);
                await wait();
                fixture.detectChanges();

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 2,
                    newIndex: 0
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(0);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[2],
                    newItem: tabItems[0]
                });

                expect(indexChangingSpy).toHaveBeenCalledTimes(2);
                expect(indexChangeSpy).toHaveBeenCalledTimes(2);
                expect(itemChangeSpy).toHaveBeenCalledTimes(2);
            });

            it('Validate the events are not fired when navigating between tabs with home/end before pressing enter/space key.', async () => {
                tabs.activation = 'manual';
                await fixture.whenStable();
                fixture.detectChanges();

                await wait();
                headers[0].focus();

                headers[0].dispatchEvent(KEY_END_EVENT);
                await wait();
                fixture.detectChanges();

                expect(indexChangingSpy).not.toHaveBeenCalled();
                expect(indexChangeSpy).not.toHaveBeenCalled();
                expect(itemChangeSpy).not.toHaveBeenCalled();

                headers[2].dispatchEvent(KEY_ENTER_EVENT);
                await wait();
                fixture.detectChanges();

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: -1,
                    newIndex: 2
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(2);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: undefined,
                    newItem: tabItems[2]
                });

                expect(indexChangingSpy).toHaveBeenCalledTimes(1);
                expect(indexChangeSpy).toHaveBeenCalledTimes(1);
                expect(itemChangeSpy).toHaveBeenCalledTimes(1);

                headers[2].dispatchEvent(KEY_HOME_EVENT);
                await wait();
                fixture.detectChanges();

                expect(indexChangingSpy).toHaveBeenCalledTimes(1);
                expect(indexChangeSpy).toHaveBeenCalledTimes(1);
                expect(itemChangeSpy).toHaveBeenCalledTimes(1);

                headers[0].dispatchEvent(KEY_SPACE_EVENT);
                await wait();
                fixture.detectChanges();

                expect(indexChangingSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    cancel: false,
                    oldIndex: 2,
                    newIndex: 0
                });
                expect(indexChangeSpy).toHaveBeenCalledWith(0);
                expect(itemChangeSpy).toHaveBeenCalledWith({
                    owner: tabs,
                    oldItem: tabItems[2],
                    newItem: tabItems[0]
                });

                expect(indexChangingSpy).toHaveBeenCalledTimes(2);
                expect(indexChangeSpy).toHaveBeenCalledTimes(2);
                expect(itemChangeSpy).toHaveBeenCalledTimes(2);
            });

        });
    });
    describe('', () => {
        let fixture;
        let tabs;
        let tabItems;
        let headers;
        let actualHeadersContainer;

        beforeEach(async () => {
            fixture = TestBed.createComponent(TabsWithPrefixSuffixTestComponent);
            fixture.detectChanges();
            tabs = fixture.componentInstance.tabs;
            tabItems = tabs.items.toArray();
            headers = tabItems.map(item => item.headerComponent.nativeElement);
            actualHeadersContainer = fixture.debugElement.query(By.css('.' + headerScrollCssClass)).nativeNode;
        });

        it('show tabs prefix and suffix properly.', () => {
            const header0Elements = headers[0].children;
            expect(header0Elements[0].localName).toBe('span');
            expect(header0Elements[0].textContent).toBe('Test:');
            expect(header0Elements[1].children[0].localName).toBe('igx-icon');
            expect(header0Elements[1].children[0].textContent).toBe('library_music');
            expect(header0Elements[1].children[1].localName).toBe('span');
            expect(header0Elements[1].children[1].innerText).toBe('TAB 1');
            expect(header0Elements[2].localName).toBe('igx-icon');
            expect(header0Elements[2].textContent).toBe('close');

            const header1Elements = headers[1].children;
            expect(header1Elements[0].localName).toBe('span');
            expect(header1Elements[0].textContent).toBe('Test:');
            expect(header1Elements[1].children[0].localName).toBe('igx-icon');
            expect(header1Elements[1].children[0].textContent).toBe('video_library');
            expect(header1Elements[1].children[1].localName).toBe('span');
            expect(header1Elements[1].children[1].innerText).toBe('TAB 2');

            const header2Elements = headers[2].children;
            expect(header2Elements[0].children[0].localName).toBe('igx-icon');
            expect(header2Elements[0].children[0].textContent).toBe('library_books');
            expect(header2Elements[0].children[1].localName).toBe('span');
            expect(header2Elements[0].children[1].innerText).toBe('TAB 3');
            expect(header2Elements[1].localName).toBe('igx-icon');
            expect(header2Elements[1].textContent).toBe('close');
        });

        it('tabAlignment is set to "start" by default.', () => {
            expect(tabs.tabAlignment).toBe(IgxTabsAlignment.start);
            expect(actualHeadersContainer).toBeTruthy();
            expect(actualHeadersContainer.classList.contains(headerScrollCssClass + '--start')).toBeTruthy();
        });

        it('tabAlignment changes in runtime are properly applied.', () => {
            tabs.tabAlignment = IgxTabsAlignment.justify;
            fixture.detectChanges();

            expect(tabs.tabAlignment).toBe(IgxTabsAlignment.justify);
            expect(actualHeadersContainer.classList.contains(headerScrollCssClass + '--justify')).toBeTruthy();

            tabs.tabAlignment = IgxTabsAlignment.end;
            fixture.detectChanges();

            expect(tabs.tabAlignment).toBe(IgxTabsAlignment.end);
            expect(actualHeadersContainer.classList.contains(headerScrollCssClass + '--end')).toBeTruthy();
        });

        it('aligns tab headers properly when tabAlignment="justify".', async () => {
            tabs.tabAlignment = IgxTabsAlignment.justify;
            fixture.detectChanges();

            // Ensure the correct `justify` class is applied
            expect(actualHeadersContainer.classList.contains(headerScrollCssClass + '--justify')).toBeTruthy();

            // The headers are laid out asynchronously after the alignment change, so wait for their widths to settle
            await vi.waitFor(() => {
                // Calculate the expected width for each tab by dividing the total container width by the number of tabs
                const totalContainerWidth = actualHeadersContainer.offsetWidth;
                const expectedWidth = totalContainerWidth / tabItems.length;

                // Define a reasonable tolerance margin (3px or 1% of the expected width, whichever is greater)
                const tolerance = Math.max(3, expectedWidth * 0.03); // 3px or 3% of the expected width, whichever is greater

                // Assert that each tab's width is within the tolerance of the expected width
                headers.forEach((elem: { offsetWidth: number; }) => {
                    const diff = Math.abs(elem.offsetWidth - expectedWidth);
                    expect(diff).toBeLessThan(tolerance); // Tolerance margin
                });
            });
        });

        it('aligns tab headers properly when tabAlignment="center".', async () => {
            tabs.tabAlignment = IgxTabsAlignment.center;
            fixture.detectChanges();
            await wait();

            // Ensure the correct centering class is applied
            expect(actualHeadersContainer.classList.contains(headerScrollCssClass + '--center')).toBeTruthy();

            // Get left and right space for the tabs to be centered
            const { leftSpace, rightSpace } = getLeftAndRightSpaces(headers, actualHeadersContainer);

            // Assert that the left and right spaces are approximately equal
            expect(Math.abs(leftSpace - rightSpace)).toBeLessThan(3);
        });

        it('aligns tab headers properly when tabAlignment="start".', async () => {
            tabs.tabAlignment = IgxTabsAlignment.start;
            fixture.detectChanges();
            await wait();

            expect(headers[0].offsetLeft).toBe(0);
        });

        it('aligns tab headers properly when tabAlignment="end".', async () => {
            tabs.tabAlignment = IgxTabsAlignment.end;
            fixture.detectChanges();
            await wait();

            const offsetRight = actualHeadersContainer.offsetWidth - (headers[headers.length - 1].offsetLeft + headers[headers.length - 1].offsetWidth);

            expect(offsetRight).toBe(0);
        });

        it('should hide scroll buttons if visible when alignment is set to "justify".', async () => {
            // Set the container width and trigger change detection
            fixture.componentInstance.wrapperDiv.nativeElement.style.width = '360px';
            fixture.detectChanges();
            await wait();

            const scrollButtons = fixture.debugElement.query(By.css('.igx-tabs-header-button')).nativeElement;

            tabs.tabAlignment = IgxTabsAlignment.justify;
            fixture.detectChanges();
            await wait();

            const updatedStyle = window.getComputedStyle(scrollButtons);
            expect(updatedStyle.display).toBe('none');
        });
    });

    it('should hide scroll buttons when no longer needed after deleting tabs.', async () => {
        const fixture = TestBed.createComponent(TabsContactsComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.componentInstance.wrapperDiv.nativeElement.style.width = '260px';
        fixture.detectChanges();

        const rightScrollButton = tabs.headerContainer.nativeElement.children[2];
        const leftScrollButton = tabs.headerContainer.nativeElement.children[0];
        expect(leftScrollButton.clientWidth).toBeTruthy();
        expect(rightScrollButton.clientWidth).toBeTruthy();

        fixture.componentInstance.contacts.splice(0, 1);
        fixture.detectChanges();
        await wait();

        expect(leftScrollButton.clientWidth).toBeFalsy();
        expect(rightScrollButton.clientWidth).toBeFalsy();
    });

    it('should hide scroll buttons when no longer needed after deleting tabs from a scrolled header.', async () => {
        const fixture = TestBed.createComponent(TabsContactsComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.componentInstance.wrapperDiv.nativeElement.style.width = '260px';
        tabs.viewPort.nativeElement.style.scrollBehavior = 'auto';
        fixture.detectChanges();
        await wait();

        const rightScrollButton = tabs.headerContainer.nativeElement.children[2];
        const leftScrollButton = tabs.headerContainer.nativeElement.children[0];
        expect(leftScrollButton.clientWidth).toBeTruthy();
        expect(rightScrollButton.clientWidth).toBeTruthy();

        // Selecting the last tab scrolls the header to its end.
        tabs.selectedIndex = tabs.items.length - 1;
        fixture.detectChanges();
        await wait();
        expect(tabs.viewPort.nativeElement.scrollLeft).toBeGreaterThan(0);

        // Removing the selected last tab selects the one before it, which is already in
        // view at the clamped scroll position, so nothing scrolls the header back.
        fixture.componentInstance.contacts.pop();
        fixture.detectChanges();
        await wait();

        expect(tabs.selectedIndex).toBe(tabs.items.length - 1);
        expect(leftScrollButton.clientWidth).toBeFalsy();
        expect(rightScrollButton.clientWidth).toBeFalsy();
        expect(tabs.viewPort.nativeElement.scrollLeft).toBe(0);
    });

    it('should keep the header strip at its minimum height when all tabs are removed.', async () => {
        const fixture = TestBed.createComponent(TabsContactsComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.detectChanges();
        await wait();

        const header = tabs.headerContainer.nativeElement;
        expect(header.getBoundingClientRect().height).toBeGreaterThan(0);

        fixture.componentInstance.contacts = [];
        fixture.detectChanges();
        await wait();

        expect(tabs.items.length).toBe(0);
        // 48px in the Material theme the tests run with.
        expect(header.getBoundingClientRect().height).toBe(48);
    });

    it('should size the scroll button icons like the header icons.', async () => {
        const fixture = TestBed.createComponent(TabsContactsComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.componentInstance.wrapperDiv.nativeElement.style.width = '260px';
        fixture.detectChanges();
        await wait();

        const icon = tabs.scrollNextButton.nativeElement.querySelector('igx-icon');
        expect(tabs.scrollNextButton.nativeElement.clientWidth).toBeTruthy();
        // 24px in the Material theme the tests run with, the same as the Web Components tabs.
        expect(icon.getBoundingClientRect().width).toBe(24);
        expect(icon.getBoundingClientRect().height).toBe(24);
    });

    it('should keep the scroll position when a tab is added to an already scrolled header.', async () => {
        const fixture = TestBed.createComponent(TabsContactsComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.componentInstance.wrapperDiv.nativeElement.style.width = '260px';
        tabs.viewPort.nativeElement.style.scrollBehavior = 'auto';
        fixture.detectChanges();
        await wait();

        tabs.scrollNext();
        await wait();
        const scrollLeft = tabs.viewPort.nativeElement.scrollLeft;
        expect(scrollLeft).toBeGreaterThan(0);

        fixture.componentInstance.contacts.push({ Name: 'Added Contact', Avatar: '' });
        fixture.detectChanges();
        await wait();

        expect(tabs.selectedIndex).toBe(0);
        expect(tabs.viewPort.nativeElement.scrollLeft).toBe(scrollLeft);
    });

    it('should keep the scroll buttons when a single remaining tab still overflows.', async () => {
        const fixture = TestBed.createComponent(TabsContactsComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.componentInstance.wrapperDiv.nativeElement.style.width = '200px';
        tabs.viewPort.nativeElement.style.scrollBehavior = 'auto';
        fixture.detectChanges();
        await wait();

        // A single header wider than the wrapper, the header width is capped at 360px.
        fixture.componentInstance.contacts = [{ Name: 'A contact with a name that is much too long for the header', Avatar: '' }];
        fixture.detectChanges();
        await wait();

        expect(tabs.items.length).toBe(1);
        const rightScrollButton = tabs.scrollNextButton.nativeElement;
        const leftScrollButton = tabs.scrollPrevButton.nativeElement;
        expect(leftScrollButton.clientWidth).toBeTruthy();
        expect(rightScrollButton.clientWidth).toBeTruthy();

        // Next scrolls to the end of the single header, Previous restores its start.
        tabs.scrollNext();
        await wait();
        expect(tabs.viewPort.nativeElement.scrollLeft).toBeGreaterThan(0);
        expect(rightScrollButton.disabled).toBe(true);
        expect(leftScrollButton.disabled).toBe(false);

        tabs.scrollPrev();
        await wait();
        expect(tabs.viewPort.nativeElement.scrollLeft).toBe(0);
        expect(leftScrollButton.disabled).toBe(true);
        expect(rightScrollButton.disabled).toBe(false);
    });

    describe('IgxTabs RTL', () => {
        let fix;
        let tabs;
        let tabItems;
        let headers;

        beforeEach(() => {
            document.body.dir = 'rtl';
            fix = TestBed.createComponent(TabsRtlComponent);
            tabs = fix.componentInstance.tabs;
            fix.detectChanges();
            tabItems = tabs.items.toArray();
            headers = tabItems.map(item => item.headerComponent.nativeElement);
        });

        // Specs that run later in the same browser would inherit RTL.
        afterEach(() => {
            document.body.removeAttribute('dir');
        });

        it('should position scroll buttons properly', async () => {
            fix.componentInstance.wrapperDiv.nativeElement.style.width = '300px';
            fix.detectChanges();
            await frames(2);

            const scrollNextButton = fix.componentInstance.tabs.scrollNextButton;
            const scrollPrevButton = fix.componentInstance.tabs.scrollPrevButton;
            expect(scrollNextButton.nativeElement.offsetLeft).toBeLessThan(scrollPrevButton.nativeElement.offsetLeft);
        });

        it('should select next tab when left arrow is pressed and previous tab when right arrow is pressed', async () => {
            await wait();
            fix.detectChanges();
            headers = tabs.items.map(item => item.headerComponent.nativeElement);

            headers[0].focus();
            headers[0].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fix.detectChanges();
            expect(tabs.selectedIndex).toBe(1);

            headers[1].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fix.detectChanges();
            expect(tabs.selectedIndex).toBe(2);

            headers[2].dispatchEvent(KEY_LEFT_EVENT);
            await wait();
            fix.detectChanges();
            expect(tabs.selectedIndex).toBe(3);

            headers[0].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fix.detectChanges();
            expect(tabs.selectedIndex).toBe(8);

            headers[8].dispatchEvent(KEY_RIGHT_EVENT);
            await wait();
            fix.detectChanges();
            expect(tabs.selectedIndex).toBe(7);
        });
    });

    describe('Header Position', () => {
        let fixture: ComponentFixture<TabsHeaderPositionComponent>;
        let host: TabsHeaderPositionComponent;
        let tabs: IgxTabsComponent;

        const settle = async () => {
            await fixture.whenStable();
            await frames(2);
            fixture.detectChanges();
        };

        const createTabs = async (configure?: (component: TabsHeaderPositionComponent) => void) => {
            fixture = TestBed.createComponent(TabsHeaderPositionComponent);
            host = fixture.componentInstance;
            configure?.(host);
            fixture.detectChanges();
            tabs = host.tabs;
            await settle();
        };

        const keyDown = (element: Element, key: string) => {
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            element.dispatchEvent(event);
            fixture.detectChanges();
            return event;
        };

        const spyOnSelectionEvents = () => ({
            indexChanging: vi.spyOn(tabs.selectedIndexChanging, 'emit'),
            indexChange: vi.spyOn(tabs.selectedIndexChange, 'emit'),
            itemChange: vi.spyOn(tabs.selectedItemChange, 'emit')
        });

        const getMaxOffset = () => {
            const headers = headersOf(tabs);
            const last = headers[headers.length - 1];
            const viewPort = tabs.viewPort.nativeElement;
            return tabs.verticalHeaders()
                ? Math.max(0, last.offsetTop + last.offsetHeight - viewPort.offsetHeight)
                : Math.max(0, last.offsetLeft + last.offsetWidth - viewPort.offsetWidth);
        };

        const limitSize = (component: TabsHeaderPositionComponent, position: IgxTabsHeaderPosition, size: number) => {
            component.headerPosition.set(position);
            if (position === 'top') {
                component.width.set(`${size + 100}px`);
            } else {
                component.height.set(`${size}px`);
            }
        };

        // ResizeObserver loop errors are reported to the window and do not fail a test by themselves
        const collectResizeObserverErrors = () => {
            const errors: string[] = [];
            const collect = (event: ErrorEvent) => {
                if (event.message.includes('ResizeObserver loop')) {
                    errors.push(event.message);
                }
            };
            window.addEventListener('error', collect);
            onTestFinished(() => window.removeEventListener('error', collect));
            return errors;
        };

        for (const position of ['left', 'right'] as const) {
            for (const dir of ['ltr', 'rtl'] as const) {
                it(`should place the headers in a column on the ${position} side of the content (${dir})`, async () => {
                    await createTabs(component => {
                        component.headerPosition.set(position);
                        component.dir.set(dir);
                    });
                    const headers = headersOf(tabs);
                    const headerContainerWidth = rectOf(tabs.headerContainer.nativeElement).width;

                    expectHeaderLayout(tabs, position);
                    expect(headerContainerWidth).toBeGreaterThanOrEqual(90);
                    expect(headerContainerWidth).toBeLessThanOrEqual(360);
                    const label = headers[0].querySelector('[igxTabHeaderLabel]');
                    expect(getComputedStyle(headers[0]).transform).toBe('none');
                    expect(rectOf(label).width).toBeGreaterThan(rectOf(label).height);
                    expect(isDisplayed(tabs.scrollPrevButton.nativeElement)).toBe(false);
                    expect(isDisplayed(tabs.scrollNextButton.nativeElement)).toBe(false);
                    await vi.waitFor(() => expectIndicatorAt(tabs, headers[0], position));
                });
            }
        }

        it('should change the header position at runtime without changing the selection, the focus, the headers or the panels', async () => {
            await createTabs(component => {
                component.height.set('320px');
                component.tabs.selectedIndex = 2;
            });

            const headers = headersOf(tabs);
            const panels = tabs.panels.map(panel => panel.nativeElement);
            const action = panels[2].querySelector<HTMLButtonElement>('.panel-action');
            action.focus();
            const events = spyOnSelectionEvents();

            for (const position of ['left', 'right', 'top', 'right', 'left', 'top'] as const) {
                host.headerPosition.set(position);
                fixture.detectChanges();
                await settle();

                expectHeaderLayout(tabs, position);
                headersOf(tabs).forEach((header, i) => {
                    expect(header).toBe(headers[i]);
                    expect(header.getAttribute('role')).toBe('tab');
                    expect(header.getAttribute('aria-controls')).toBe(panels[i].id);
                });
                tabs.panels.forEach((panel, i) => {
                    expect(panel.nativeElement).toBe(panels[i]);
                    expect(panels[i].getAttribute('aria-labelledby')).toBe(headers[i].id);
                });
                expect(panels[2].contains(action)).toBe(true);
                expect(document.activeElement).toBe(action);
                expect(tabs.selectedIndex).toBe(2);
                await vi.waitFor(() => expectIndicatorAt(tabs, headers[2], position));

                const indicatorStyle = tabs.selectedIndicator.nativeElement.style;
                if (position === 'top') {
                    expect(indicatorStyle.height).toBe('');
                    expect(indicatorStyle.width).toBe(`${headers[2].offsetWidth}px`);
                    expect(indicatorStyle.transform).toBe(`translate(${headers[2].offsetLeft}px)`);
                } else {
                    expect(indicatorStyle.width).toBe('');
                }
            }

            expect(events.indexChanging).not.toHaveBeenCalled();
            expect(events.indexChange).not.toHaveBeenCalled();
            expect(events.itemChange).not.toHaveBeenCalled();
        });

        for (const dir of ['ltr', 'rtl'] as const) {
            it(`should select the next and previous enabled tab with ArrowDown and ArrowUp in a column of headers (${dir})`, async () => {
                await createTabs(component => {
                    component.headerPosition.set('left');
                    component.dir.set(dir);
                    component.items.update(items => items.map((item, i) => ({ ...item, disabled: i === 2 || i === 5 })));
                });
                const headers = headersOf(tabs);
                headers[0].focus();

                const steps: [string, number][] = [
                    ['ArrowDown', 1], ['ArrowDown', 3], ['ArrowUp', 1], ['ArrowUp', 0], ['ArrowUp', 7], ['ArrowDown', 0],
                    ['End', 7], ['Home', 0]
                ];
                for (const [key, index] of steps) {
                    const event = keyDown(document.activeElement, key);
                    expect(event.defaultPrevented, key).toBe(true);
                    expect(tabs.selectedIndex, key).toBe(index);
                    expect(document.activeElement, key).toBe(headers[index]);
                }

                for (const key of ['ArrowRight', 'ArrowLeft']) {
                    const event = keyDown(headers[0], key);
                    expect(event.defaultPrevented, key).toBe(false);
                    expect(tabs.selectedIndex, key).toBe(0);
                    expect(document.activeElement, key).toBe(headers[0]);
                }
            });
        }

        it('should not handle ArrowUp and ArrowDown in a row of headers', async () => {
            await createTabs();
            const headers = headersOf(tabs);
            headers[0].focus();

            for (const key of ['ArrowDown', 'ArrowUp']) {
                const event = keyDown(headers[0], key);
                expect(event.defaultPrevented, key).toBe(false);
                expect(tabs.selectedIndex, key).toBe(0);
                expect(document.activeElement, key).toBe(headers[0]);
            }
        });

        for (const position of ['top', 'left'] as const) {
            it(`should scroll the header focused in manual activation into view when the headers do not fit (${position})`, async () => {
                await createTabs(component => {
                    limitSize(component, position, 200);
                    component.activation.set('manual');
                });
                const headers = headersOf(tabs);
                const previousKey = position === 'top' ? 'ArrowLeft' : 'ArrowUp';
                headers[0].focus();

                keyDown(headers[0], 'End');
                expect(document.activeElement).toBe(headers[7]);
                await vi.waitFor(() => expectInView(tabs, headers[7]));

                keyDown(headers[7], 'Home');
                await vi.waitFor(() => expectInView(tabs, headers[0]));

                keyDown(headers[0], previousKey);
                expect(document.activeElement).toBe(headers[7]);
                await vi.waitFor(() => expectInView(tabs, headers[7]));

                expect(tabs.selectedIndex).toBe(0);
                expectIndicatorAt(tabs, headers[0], position);
            });
        }

        it('should keep the focused header in view when the header position changes', async () => {
            await createTabs(component => {
                component.headerPosition.set('left');
                component.height.set('240px');
                component.activation.set('manual');
            });
            const headers = headersOf(tabs);
            headers[0].focus();
            keyDown(headers[0], 'End');
            await vi.waitFor(() => expectInView(tabs, headers[7]));

            for (const position of ['top', 'right', 'left', 'top'] as const) {
                host.headerPosition.set(position);
                fixture.detectChanges();
                await settle();

                expect(isDisplayed(tabs.scrollNextButton.nativeElement), position).toBe(true);
                expect(document.activeElement, position).toBe(headers[7]);
                expect(tabs.selectedIndex, position).toBe(0);
                await vi.waitFor(() => {
                    expectInView(tabs, headers[7]);
                    expectIndicatorAt(tabs, headers[0], position);
                });
            }

            // For example, a close button in the header
            const button = document.createElement('button');
            headers[6].appendChild(button);
            button.focus({ preventScroll: true });
            host.headerPosition.set('left');
            fixture.detectChanges();
            await settle();
            await vi.waitFor(() => expectInView(tabs, headers[6]));
        });

        for (const dir of ['ltr', 'rtl'] as const) {
            it(`should scroll a column of headers with a limited height up and down with the scroll buttons (${dir})`, async () => {
                await createTabs(component => {
                    component.headerPosition.set('left');
                    component.height.set('240px');
                    component.dir.set(dir);
                });
                const headers = headersOf(tabs);
                const prev = tabs.scrollPrevButton.nativeElement;
                const next = tabs.scrollNextButton.nativeElement;
                const viewPort = tabs.viewPort.nativeElement;
                const headerContainer = rectOf(tabs.headerContainer.nativeElement);

                expect(isDisplayed(prev)).toBe(true);
                expect(isDisplayed(next)).toBe(true);
                expect(prev.disabled).toBe(true);
                expect(next.disabled).toBe(false);
                expect(rectOf(prev).bottom).toBeLessThanOrEqual(rectOf(viewPort).top + 1);
                expect(rectOf(next).top).toBeGreaterThanOrEqual(rectOf(viewPort).bottom - 1);
                expectNear(rectOf(prev).width, headerContainer.width);
                expectNear(rectOf(next).width, headerContainer.width);
                expect(chevronDirection(prev, -1)).toEqual({ x: 0, y: -1 });
                expect(chevronDirection(next, 1)).toEqual({ x: 0, y: 1 });

                for (let clicks = 0; !next.disabled && clicks < headers.length; clicks++) {
                    next.click();
                }
                expect(next.disabled).toBe(true);
                expect(prev.disabled).toBe(false);
                expectNear(tabs.offset, getMaxOffset());
                await vi.waitFor(() => expectNear(viewPort.scrollTop, tabs.offset));
                expect(viewPort.scrollLeft).toBe(0);
                expectInView(tabs, headers[7]);

                for (let clicks = 0; !prev.disabled && clicks < headers.length; clicks++) {
                    prev.click();
                }
                expect(tabs.offset).toBe(0);
                expect(next.disabled).toBe(false);
                await vi.waitFor(() => expect(viewPort.scrollTop).toBe(0));
                expectInView(tabs, headers[0]);
            });
        }

        it('should scroll the selected header into view in a column of headers with a limited height', async () => {
            await createTabs(component => {
                component.headerPosition.set('right');
                component.height.set('240px');
                component.tabs.selectedIndex = 7;
            });
            const headers = headersOf(tabs);
            await vi.waitFor(() => {
                expectInView(tabs, headers[7]);
                expectIndicatorAt(tabs, headers[7], 'right');
            });

            tabs.items.get(0).selected = true;
            fixture.detectChanges();
            expect(tabs.offset).toBe(0);
            await vi.waitFor(() => {
                expectInView(tabs, headers[0]);
                expectIndicatorAt(tabs, headers[0], 'right');
            });
        });

        for (const position of ['top', 'left'] as const) {
            it(`should keep the scroll offset in range when the headers get fewer or the tabs larger (${position})`, async () => {
                await createTabs(component => limitSize(component, position, 240));
                const viewPort = tabs.viewPort.nativeElement;
                const next = tabs.scrollNextButton.nativeElement;
                const scrollPosition = () => position === 'top' ? viewPort.scrollLeft : viewPort.scrollTop;
                for (let clicks = 0; !next.disabled && clicks < 8; clicks++) {
                    next.click();
                }
                expectNear(tabs.offset, getMaxOffset());

                host.items.update(items => items.slice(0, 6));
                fixture.detectChanges();
                await settle();
                expect(tabs.selectedIndex).toBe(0);
                expect(getMaxOffset()).toBeGreaterThan(0);
                expectNear(tabs.offset, getMaxOffset());
                expect(next.disabled).toBe(true);
                await vi.waitFor(() => expectNear(scrollPosition(), tabs.offset));

                limitSize(host, position, 300);
                fixture.detectChanges();
                await settle();
                await vi.waitFor(() => {
                    expectNear(tabs.offset, getMaxOffset());
                    expectNear(scrollPosition(), tabs.offset);
                });

                limitSize(host, position, 1000);
                fixture.detectChanges();
                await settle();
                await vi.waitFor(() => {
                    expect(isDisplayed(tabs.scrollPrevButton.nativeElement)).toBe(false);
                    expect(isDisplayed(next)).toBe(false);
                    expect(tabs.offset).toBe(0);
                    expect(scrollPosition()).toBe(0);
                });
            });
        }

        it('should show and hide the scroll buttons when the headers in a column change their height', async () => {
            await createTabs(component => {
                component.headerPosition.set('left');
                component.height.set('320px');
                component.items.update(items => items.slice(0, 3));
            });
            const prev = tabs.scrollPrevButton.nativeElement;
            const next = tabs.scrollNextButton.nativeElement;
            const resizeObserverErrors = collectResizeObserverErrors();
            expect(isDisplayed(prev)).toBe(false);
            expect(isDisplayed(next)).toBe(false);

            host.items.update(items => items.map((item, i) => i === 2 ? { ...item, spacer: 200 } : item));
            fixture.detectChanges();
            await vi.waitFor(() => {
                expect(isDisplayed(prev)).toBe(true);
                expect(isDisplayed(next)).toBe(true);
                expect(next.disabled).toBe(false);
            });

            host.items.update(items => items.map(item => ({ ...item, spacer: undefined })));
            fixture.detectChanges();
            await vi.waitFor(() => {
                expect(isDisplayed(prev)).toBe(false);
                expect(isDisplayed(next)).toBe(false);
            });
            expect(resizeObserverErrors).toEqual([]);
        });

        for (const position of ['top', 'left'] as const) {
            it(`should scroll the headers when the last header is not displayed (${position})`, async () => {
                await createTabs(component => limitSize(component, position, 200));
                const headers = headersOf(tabs);
                headers[7].style.display = 'none';
                tabs.selectedIndex = 5;
                fixture.detectChanges();
                await settle();

                await vi.waitFor(() => {
                    expectInView(tabs, headers[5]);
                    expect(isDisplayed(tabs.scrollNextButton.nativeElement)).toBe(true);
                    expect(tabs.scrollPrevButton.nativeElement.disabled).toBe(false);
                });
            });
        }

        it('should align a column of headers vertically with tabAlignment', async () => {
            // Headers of different heights, without icons that change their size when the icon font loads
            const items = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `Tab ${i + 1}`, spacer: i === 1 ? 24 : undefined }));
            await createTabs(component => {
                component.headerPosition.set('left');
                component.height.set('480px');
                component.items.set(items.slice(0, 3));
            });
            const viewPort = () => rectOf(tabs.viewPort.nativeElement);
            let headers = headersOf(tabs);
            const heights = headers.map(header => rectOf(header).height);
            expectNear(rectOf(headers[0]).top, viewPort().top);

            host.tabAlignment.set('end');
            fixture.detectChanges();
            await settle();
            expectNear(rectOf(headers[2]).bottom, viewPort().bottom);

            host.tabAlignment.set('center');
            fixture.detectChanges();
            await settle();
            expectNear(rectOf(headers[0]).top - viewPort().top, viewPort().bottom - rectOf(headers[2]).bottom, 2);

            host.tabAlignment.set('justify');
            fixture.detectChanges();
            await settle();
            await vi.waitFor(() => {
                expectNear(rectOf(headers[0]).top, viewPort().top);
                expectNear(rectOf(headers[2]).bottom, viewPort().bottom);
                headers.forEach((header, i) => expect(rectOf(header).height).toBeGreaterThan(heights[i]));
                expect(rectOf(headers[1]).height - rectOf(headers[0]).height).toBeGreaterThanOrEqual(heights[1] - heights[0]);
                expectIndicatorAt(tabs, headers[0], 'left');
            });

            host.items.set(items);
            host.height.set('240px');
            for (const alignment of ['start', 'center', 'end', 'justify'] as const) {
                host.tabAlignment.set(alignment);
                fixture.detectChanges();
                await settle();
                headers = headersOf(tabs);
                await vi.waitFor(() => {
                    expectNear(rectOf(headers[0]).top, viewPort().top);
                    heights.forEach((height, i) => expectNear(rectOf(headers[i]).height, height));
                });
                expect(tabs.offset).toBe(0);
                expect(isDisplayed(tabs.scrollNextButton.nativeElement)).toBe(true);
            }
        });

        it('should not display the scroll buttons of a column before its headers are measured', async () => {
            await createTabs(component => component.headerPosition.set('left'));
            const buttons = [tabs.scrollPrevButton.nativeElement, tabs.scrollNextButton.nativeElement];
            const height = rectOf(tabs.headerContainer.nativeElement).height;

            // The buttons as rendered on the server
            buttons.forEach(button => button.style.removeProperty('display'));

            buttons.forEach(button => expect(isDisplayed(button)).toBe(false));
            expectNear(rectOf(tabs.headerContainer.nativeElement).height, height);
        });

        it('should keep the selected header in view when justified headers move to a column', async () => {
            const longLabel = 'A long tab header label that is much wider than the maximum width of a header on a single line';
            await createTabs(component => {
                component.tabAlignment.set('justify');
                component.height.set('300px');
                component.items.update(items => items.map(item => ({ ...item, label: `${item.label} ${longLabel}` })));
                component.tabs.selectedIndex = 7;
            });
            const headers = headersOf(tabs);

            host.headerPosition.set('left');
            fixture.detectChanges();
            await settle();
            await Promise.all(headers.flatMap(header => header.getAnimations()).map(animation => animation.finished));

            await vi.waitFor(() => expectInView(tabs, headers[7]));
        });

        it('should hide the scroll buttons when the height limit of a column is removed', async () => {
            await createTabs(component => component.headerPosition.set('left'));
            const tabsElement = tabs.headerContainer.nativeElement.parentElement;
            const next = tabs.scrollNextButton.nativeElement;
            const resizeObserverErrors = collectResizeObserverErrors();

            tabsElement.style.maxHeight = '240px';
            await vi.waitFor(() => expect(isDisplayed(next)).toBe(true));

            tabsElement.style.maxHeight = '';
            await vi.waitFor(() => expect(isDisplayed(next)).toBe(false));
            expect(resizeObserverErrors).toEqual([]);
        });

        it('should keep the width of a column of justified headers within the maximum width of a header', async () => {
            const longLabel = 'A long tab header label that is much wider than the maximum width of a header on a single line';
            await createTabs(component => {
                component.headerPosition.set('left');
                component.height.set('320px');
                component.items.set([{ id: 1, label: 'Tab 1' }, { id: 2, label: longLabel }]);
            });
            const width = rectOf(tabs.headerContainer.nativeElement).width;
            expect(width).toBeLessThanOrEqual(360);

            host.tabAlignment.set('justify');
            fixture.detectChanges();
            await settle();
            await vi.waitFor(() => {
                expectNear(rectOf(tabs.headerContainer.nativeElement).width, width);
                expectNear(rectOf(contentOf(tabs)).width, 600 - width);
                expectHeaderLayout(tabs, 'left');
            });
        });

        for (const position of ['top', 'left'] as const) {
            it(`should handle no headers and scroll a single header that is larger than the visible area (${position})`, async () => {
                await createTabs(component => {
                    limitSize(component, position, 200);
                    component.items.set([]);
                });
                const prev = tabs.scrollPrevButton.nativeElement;
                const next = tabs.scrollNextButton.nativeElement;
                const viewPort = tabs.viewPort.nativeElement;
                const vertical = position === 'left';
                expect(tabs.itemsWrapper.nativeElement.getAttribute('aria-orientation')).toBe(vertical ? 'vertical' : 'horizontal');
                expect(isDisplayed(prev)).toBe(false);
                expect(isDisplayed(next)).toBe(false);

                host.items.set([vertical
                    ? { id: 1, label: 'Tall tab', spacer: 400 }
                    : { id: 1, label: 'A long tab header label that does not fit on a single line of the header' }]);
                fixture.detectChanges();
                await settle();
                tabs.selectedIndex = 0;
                fixture.detectChanges();
                await settle();

                const header = headersOf(tabs)[0];
                const start = () => vertical ? rectOf(header).top - rectOf(viewPort).top : rectOf(header).left - rectOf(viewPort).left;
                const end = () => vertical ? rectOf(header).bottom - rectOf(viewPort).bottom : rectOf(header).right - rectOf(viewPort).right;
                expect(end()).toBeGreaterThan(1);
                expect(isDisplayed(prev)).toBe(true);
                expect(isDisplayed(next)).toBe(true);
                expect(prev.disabled).toBe(true);
                expect(next.disabled).toBe(false);
                expect(tabs.offset).toBe(0);
                expectNear(start(), 0);
                await vi.waitFor(() => expectIndicatorAt(tabs, header, position));

                next.click();
                expect(next.disabled).toBe(true);
                expect(prev.disabled).toBe(false);
                expect(tabs.offset).toBeGreaterThan(0);
                expectNear(tabs.offset, getMaxOffset());
                await vi.waitFor(() => expectNear(end(), 0));

                prev.click();
                expect(tabs.offset).toBe(0);
                expect(prev.disabled).toBe(true);
                expect(next.disabled).toBe(false);
                await vi.waitFor(() => expectNear(start(), 0));
            });
        }

        for (const position of ['left', 'right'] as const) {
            it(`should run the active indicator along the selected header on the content side of a column on the ${position}`, async () => {
                await createTabs(component => {
                    component.headerPosition.set(position);
                    component.height.set('240px');
                });
                const headers = headersOf(tabs);
                await vi.waitFor(() => expectIndicatorAt(tabs, headers[0], position));

                headers[1].click();
                fixture.detectChanges();
                expect(rectOf(headers[1]).height).toBeGreaterThan(rectOf(headers[0]).height);
                await vi.waitFor(() => expectIndicatorAt(tabs, headers[1], position));

                tabs.selectedIndex = 6;
                fixture.detectChanges();
                await vi.waitFor(() => {
                    expectInView(tabs, headers[6]);
                    expectIndicatorAt(tabs, headers[6], position);
                });

                host.items.update(items => items.map((item, i) => i === 6 ? { ...item, spacer: 40 } : item));
                fixture.detectChanges();
                await vi.waitFor(() => expectIndicatorAt(tabs, headers[6], position));
            });
        }

        for (const position of ['top', 'left'] as const) {
            it(`should scroll to the selected header and align the indicator when hidden tabs are shown (${position})`, async () => {
                await createTabs(component => {
                    limitSize(component, position, 240);
                    component.hidden.set(true);
                });
                tabs.selectedIndex = 6;
                fixture.detectChanges();
                await settle();

                host.hidden.set(false);
                fixture.detectChanges();
                const headers = headersOf(tabs);
                await vi.waitFor(() => {
                    expectInView(tabs, headers[6]);
                    expectIndicatorAt(tabs, headers[6], position);
                });
            });
        }

        it('should size a column of headers from the headers and give the rest of the width to the content', async () => {
            await createTabs(component => {
                component.headerPosition.set('left');
                component.items.set([
                    { id: 1, label: 'Tab 1', prefix: 'Prefix', suffix: 'Suffix' },
                    { id: 2, label: 'A long tab header label that does not fit on a single line of the header' },
                    { id: 3, label: 'Tab 3', icon: 'folder' }
                ]);
            });
            const tabsElement = tabs.headerContainer.nativeElement.parentElement;
            const headerContainer = rectOf(tabs.headerContainer.nativeElement);
            const headers = headersOf(tabs);

            expect(headerContainer.width).toBeLessThanOrEqual(360);
            const shortLabel = rectOf(headers[0].querySelector('[igxTabHeaderLabel]'));
            const longLabel = rectOf(headers[1].querySelector('[igxTabHeaderLabel]'));
            expect(longLabel.height).toBeGreaterThan(shortLabel.height * 1.5);
            expect(longLabel.height).toBeLessThanOrEqual(shortLabel.height * 2 + 1);

            const [prefix, inner, suffix] = Array.from(headers[0].children).map(rectOf);
            expect(prefix.right).toBeLessThanOrEqual(inner.left + 1);
            expect(suffix.left).toBeGreaterThanOrEqual(inner.right - 1);
            expectNear(prefix.top + prefix.height / 2, inner.top + inner.height / 2);

            expectNear(rectOf(tabsElement).height, headerContainer.height);
            expect(isDisplayed(tabs.scrollNextButton.nativeElement)).toBe(false);

            const narrowWidth = Math.round(headerContainer.width) + 100;
            host.width.set(`${narrowWidth}px`);
            fixture.detectChanges();
            await settle();
            expectNear(rectOf(tabs.headerContainer.nativeElement).width, headerContainer.width);
            expectNear(rectOf(contentOf(tabs)).width, narrowWidth - headerContainer.width);

            host.contentLines.set(Array.from({ length: 40 }, (_, i) => i));
            host.height.set('240px');
            fixture.detectChanges();
            await settle();
            const panel = tabs.panels.get(0).nativeElement;
            expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
            expectNear(rectOf(panel).height, 240);
            expectNear(rectOf(tabs.headerContainer.nativeElement).height, 240);
        });

        it('should place the theme specific selection indicators and borders on the content side of the headers', async () => {
            await createTabs(component => component.height.set('240px'));
            const wrapper = host.wrapperDiv.nativeElement;
            // The test page includes only the tokens of the Material theme
            wrapper.style.setProperty('--border-color', 'rgb(255, 0, 0)');
            wrapper.style.setProperty('--border-radius', '6px');
            const headerContainer = tabs.headerContainer.nativeElement;
            const prev = tabs.scrollPrevButton.nativeElement;
            const header = headersOf(tabs)[0];
            // The styles are checked right after the theme changes
            const noTransitions = document.createElement('style');
            noTransitions.textContent = '.igx-tab-header, .igx-tabs-header__active-indicator { transition: none !important; }';
            document.head.appendChild(noTransitions);
            onTestFinished(() => noTransitions.remove());

            for (const dir of ['ltr', 'rtl'] as const) {
                for (const position of ['top', 'left', 'right'] as const) {
                    for (const variant of ['light', 'dark']) {
                        for (const theme of ['material', 'fluent', 'indigo', 'bootstrap']) {
                            host.dir.set(dir);
                            host.headerPosition.set(position);
                            // The icon buttons of the page set the theme of the Material tokens on themselves
                            for (const element of [wrapper, prev, tabs.scrollNextButton.nativeElement]) {
                                element.style.setProperty('--ig-theme', theme);
                                element.style.setProperty('--ig-theme-variant', variant);
                            }
                            fixture.detectChanges();
                            await settle();
                            const context = `${theme} ${variant} ${position} ${dir}`;
                            const vertical = position !== 'top';
                            const contentSide = position === 'top' ? 'Bottom' : position === 'left' ? 'Right' : 'Left';
                            const outerSide = position === 'left' ? 'Left' : 'Right';
                            const thickness = vertical ? 'width' : 'height';
                            const length = vertical ? 'height' : 'width';

                            expectNear(rectOf(prev)[thickness], rectOf(headerContainer)[thickness]);

                            if (theme === 'bootstrap') {
                                expect(isDisplayed(tabs.selectedIndicator.nativeElement), context).toBe(false);
                                const line = getComputedStyle(headerContainer, '::after');
                                expect(line[thickness], context).toBe('1px');
                                expectNear(parseFloat(line[length]), rectOf(headerContainer)[length]);
                                expectNear(parseFloat(line[contentSide.toLowerCase()]), 0);
                                const cover = getComputedStyle(header, '::before');
                                expect(cover[thickness], context).toBe('1px');
                                expectNear(parseFloat(cover[length]), rectOf(header)[length]);
                                expectNear(parseFloat(cover[contentSide.toLowerCase()]), 0);
                                const headerStyle = getComputedStyle(header);
                                if (vertical) {
                                    expect(headerStyle[`borderTop${outerSide}Radius`], context).toBe('6px');
                                    expect(headerStyle[`borderBottom${outerSide}Radius`], context).toBe('6px');
                                    expect(headerStyle[`borderTop${contentSide}Radius`], context).toBe('0px');
                                    expect(headerStyle[`borderBottom${contentSide}Radius`], context).toBe('0px');
                                } else {
                                    expect(headerStyle.borderTopLeftRadius, context).toBe('6px');
                                    expect(headerStyle.borderTopRightRadius, context).toBe('6px');
                                    expect(headerStyle.borderBottomLeftRadius, context).toBe('0px');
                                    expect(headerStyle.borderBottomRightRadius, context).toBe('0px');
                                }
                                header.focus({ preventScroll: true });
                                const focusedStyle = getComputedStyle(header);
                                if (vertical) {
                                    expect(focusedStyle[`borderTop${outerSide}Radius`], `${context} focus`).toBe('6px');
                                    expect(focusedStyle[`borderBottom${outerSide}Radius`], `${context} focus`).toBe('6px');
                                    expect(focusedStyle[`borderTop${contentSide}Radius`], `${context} focus`).toBe('4px');
                                    expect(focusedStyle[`borderBottom${contentSide}Radius`], `${context} focus`).toBe('4px');
                                } else {
                                    expect(focusedStyle.borderTopLeftRadius, `${context} focus`).toBe('6px');
                                    expect(focusedStyle.borderTopRightRadius, `${context} focus`).toBe('6px');
                                    expect(focusedStyle.borderBottomLeftRadius, `${context} focus`).toBe('4px');
                                    expect(focusedStyle.borderBottomRightRadius, `${context} focus`).toBe('4px');
                                }
                                header.blur();
                                continue;
                            }

                            await vi.waitFor(() => expectIndicatorAt(tabs, header, position, theme === 'indigo' ? 3 : 2));

                            if (theme === 'indigo') {
                                const headerStyle = getComputedStyle(header);
                                const buttonLine = getComputedStyle(prev, '::after');
                                expect(headerStyle[`border${contentSide}Width`], context).toBe('1px');
                                expect(headerStyle[`border${contentSide}Color`], context).toBe('rgb(255, 0, 0)');
                                expect(buttonLine[`border${contentSide}Width`], context).toBe('1px');
                                expectNear(rectOf(prev)[length], 40);
                                if (vertical) {
                                    expect(headerStyle.borderBottomStyle, context).toBe('none');
                                    expect(buttonLine.borderBottomStyle, context).toBe('none');
                                }
                            }
                        }
                    }
                }
            }
        });
    });
});

describe('IgxTabs zoneless change detection', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                BasicTabsComponent,
                ZonelessTabsCollectionComponent,
                TabsHeaderPositionComponent
            ],
            providers: [provideZonelessChangeDetection()]
        });
    });

    it('should lay out a column of headers and update it on selection, position and collection changes without zone.js', async () => {
        const fixture = TestBed.createComponent(TabsHeaderPositionComponent);
        const host = fixture.componentInstance;
        host.headerPosition.set('left');
        host.height.set('240px');
        fixture.detectChanges();
        await fixture.whenStable();

        const tabs = host.tabs;
        const headers = headersOf(tabs);
        await vi.waitFor(() => {
            expectHeaderLayout(tabs, 'left');
            expectIndicatorAt(tabs, headers[0], 'left');
        });

        tabs.selectedIndex = 7;
        await fixture.whenStable();
        expect(headers[7].classList.contains('igx-tab-header--selected')).toBe(true);
        await vi.waitFor(() => {
            expectInView(tabs, headers[7]);
            expectIndicatorAt(tabs, headers[7], 'left');
        });

        host.headerPosition.set('right');
        await fixture.whenStable();
        expect(tabs.selectedIndex).toBe(7);
        await vi.waitFor(() => {
            expectHeaderLayout(tabs, 'right');
            expectInView(tabs, headers[7]);
            expectIndicatorAt(tabs, headers[7], 'right');
        });

        host.items.update(items => items.slice(0, 3));
        await fixture.whenStable();
        await vi.waitFor(() => {
            const remaining = headersOf(tabs);
            expect(tabs.selectedIndex).toBe(2);
            expect(remaining[2].classList.contains('igx-tab-header--selected')).toBe(true);
            expect(isDisplayed(tabs.scrollNextButton.nativeElement)).toBe(false);
            expect(tabs.offset).toBe(0);
            expectIndicatorAt(tabs, remaining[2], 'right');
        });
    });

    it('should render the initially selected tab panel without zone.js', async () => {
        const fixture = TestBed.createComponent(BasicTabsComponent);
        fixture.detectChanges();
        await Promise.resolve();
        await fixture.whenStable();

        const tabs: IgxTabsComponent = fixture.componentInstance.tabs;
        const firstHeader = fixture.debugElement.query(By.directive(IgxTabHeaderComponent)).nativeElement;

        expect(tabs.selectedIndex).toBe(0);
        expect(tabs.selectedItem.selected).toBe(true);
        expect(firstHeader.classList.contains('igx-tab-header--selected')).toBe(true);
    });

    it('should render a tab selected from code without zone.js', async () => {
        const fixture = TestBed.createComponent(ZonelessTabsCollectionComponent);
        fixture.detectChanges();
        await Promise.resolve();
        await fixture.whenStable();

        const tabs = fixture.componentInstance.tabsComponent;
        tabs.selectedIndex = 2;
        await fixture.whenStable();

        const headers = fixture.debugElement.queryAll(By.directive(IgxTabHeaderComponent));

        expect(headers[0].nativeElement.classList.contains('igx-tab-header--selected')).toBe(false);
        expect(headers[2].nativeElement.classList.contains('igx-tab-header--selected')).toBe(true);
    });

    it('should keep the same selected index when the tab collection changes but the index is still valid, without zone.js', async () => {
        const fixture = TestBed.createComponent(ZonelessTabsCollectionComponent);
        fixture.detectChanges();
        await Promise.resolve();
        await fixture.whenStable();

        const tabs = fixture.componentInstance.tabsComponent;
        expect(tabs.selectedIndex).toBe(0);

        fixture.componentInstance.removeSelectedTab();
        await fixture.whenStable();

        const selectedHeader = fixture.debugElement.queryAll(By.directive(IgxTabHeaderComponent))[0].nativeElement;

        expect(tabs.items.length).toBe(3);
        expect(tabs.selectedIndex).toBe(0);
        expect(selectedHeader.classList.contains('igx-tab-header--selected')).toBe(true);
    });

    it('should select the last tab when the previous selected index is out of range, without zone.js', async () => {
        const fixture = TestBed.createComponent(ZonelessTabsCollectionComponent);
        fixture.componentInstance.startIndex.set(3);
        fixture.detectChanges();
        await Promise.resolve();
        await fixture.whenStable();

        const tabs = fixture.componentInstance.tabsComponent;
        expect(tabs.selectedIndex).toBe(3);

        fixture.componentInstance.shrinkToFirstTab();
        await fixture.whenStable();

        const selectedHeader = fixture.debugElement.queryAll(By.directive(IgxTabHeaderComponent))[0].nativeElement;

        expect(tabs.items.length).toBe(1);
        expect(tabs.selectedIndex).toBe(0);
        expect(selectedHeader.classList.contains('igx-tab-header--selected')).toBe(true);
    });
});


