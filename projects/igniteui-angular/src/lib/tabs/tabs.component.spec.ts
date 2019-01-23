import { Component, QueryList, ViewChild } from '@angular/core';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabsGroupComponent } from './tabs-group.component';
import { IgxTabsComponent, IgxTabsModule } from './tabs.component';

import { configureTestSuite } from '../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('IgxTabs', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TabsTestComponent, TabsTest2Component, TemplatedTabsTestComponent, TabsTestSelectedTabComponent],
            imports: [IgxTabsModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));

    it('should initialize igx-tabs, igx-tabs-group and igx-tab-item', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        let groups: IgxTabsGroupComponent[];
        let tabsItems: IgxTabItemComponent[];

        tick(100);
        fixture.detectChanges();

        groups = tabs.groups.toArray();
        tabsItems = tabs.tabs.toArray();

        expect(tabs).toBeDefined();
        expect(tabs instanceof IgxTabsComponent).toBeTruthy();
        expect(tabs.groups instanceof QueryList).toBeTruthy();
        expect(tabs.groups.length).toBe(3);

        for (let i = 0; i < tabs.groups.length; i++) {
            expect(groups[i] instanceof IgxTabsGroupComponent).toBeTruthy();
            expect(groups[i].relatedTab).toBe(tabsItems[i]);
        }

        expect(tabs.tabs instanceof QueryList).toBeTruthy();
        expect(tabs.tabs.length).toBe(3);

        for (let i = 0; i < tabs.tabs.length; i++) {
            expect(tabsItems[i] instanceof IgxTabItemComponent).toBeTruthy();
            expect(tabsItems[i].relatedGroup).toBe(groups[i]);
        }
        tick();
    }));

    it('should initialize default values of properties', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        let tabItems;

        tick(100);
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(0);

        fixture.componentInstance.tabSelectedHandler = () => {
            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedTabItem).toBe(tabItems[0]);
        };

        tick(100);
        fixture.detectChanges();

        tabItems = tabs.tabs.toArray();
        expect(tabItems[0].disabled).toBe(false);
        expect(tabItems[1].disabled).toBe(false);
    }));

    it('should initialize set/get properties', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabbar = fixture.componentInstance.tabs;
        const icons = ['library_music', 'video_library', 'library_books'];
        let tabItems;
        let groups;

        tick(100);
        fixture.detectChanges();

        tabItems = tabbar.tabs.toArray();
        groups = tabbar.groups.toArray();

        for (let i = 0; i < tabItems.length; i++) {
            expect(groups[i].label).toBe('Tab ' + (i + 1));
            expect(groups[i].icon).toBe(icons[i]);
        }
        tick();
    }));

    it('should select/deselect tabs', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        let tabItems;
        let tab1: IgxTabItemComponent;
        let tab2: IgxTabItemComponent;

        expect(tabs.selectedIndex).toBe(0);
        fixture.componentInstance.tabSelectedHandler = () => {
            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedTabItem).toBe(tab1);
        };

        tick(100);
        fixture.detectChanges();
        tabItems = tabs.tabs.toArray();
        tab1 = tabItems[0];
        tab2 = tabItems[1];

        fixture.componentInstance.tabSelectedHandler = () => { };

        tab2.select();
        tick(100);
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(1);
        expect(tabs.selectedTabItem).toBe(tab2);
        expect(tab2.isSelected).toBeTruthy();
        expect(tab1.isSelected).toBeFalsy();

        tab1.select();
        tick(100);
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(0);
        expect(tabs.selectedTabItem).toBe(tab1);
        expect(tab1.isSelected).toBeTruthy();
        expect(tab2.isSelected).toBeFalsy();

        // select disabled tab
        tab2.relatedGroup.disabled = true;
        tick(100);
        fixture.detectChanges();

        tab2.select();
        tick(100);
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(0);
        expect(tabs.selectedTabItem).toBe(tab1);
        expect(tab1.isSelected).toBeTruthy();
        expect(tab2.isSelected).toBeFalsy();
    }));

    it('check select selection when tabs collection is modified', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTest2Component);
        fixture.detectChanges();
        const tabs = fixture.componentInstance.tabs;
        let tabItems;
        let tab1: IgxTabItemComponent;
        let tab3: IgxTabItemComponent;

        tick(100);
        fixture.detectChanges();

        tabItems = tabs.tabs.toArray();
        tab1 = tabItems[0];
        tab3 = tabItems[2];

        tick(100);
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(0);
        expect(tabs.selectedTabItem.index).toBe(tab1.index);

        fixture.componentInstance.tabSelectedHandler = () => { };

        tab3.select();

        tick(200);
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(2);
        expect(tabs.selectedTabItem).toBe(tab3);
        expect(tab3.isSelected).toBeTruthy();

        fixture.componentInstance.resetCollectionFourTabs();
        fixture.detectChanges();
        tick(200);
        expect(tabs.selectedIndex).toBe(2);

        fixture.componentInstance.resetCollectionOneTab();
        tick(100);
        fixture.detectChanges();

        tick(100);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(0);

        fixture.componentInstance.resetCollectionTwoTabs();
        tick(100);
        fixture.detectChanges();

        tick(100);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(0);

        fixture.componentInstance.resetToEmptyCollection();
        tick(100);
        fixture.detectChanges();

        tick(100);
        fixture.detectChanges();
        expect(tabs.groups.length).toBe(0);
        expect(tabs.selectedTabItem).toBe(undefined);
    }));

    it('should initialize igx-tab custom template', fakeAsync(() => {
        const fixture = TestBed.createComponent(TemplatedTabsTestComponent);
        const tabs = fixture.componentInstance.tabs;

        tick(100);
        fixture.detectChanges();
        expect(tabs.tabs.length).toBe(3);
        tabs.tabs.forEach((tabItem) => expect(tabItem.relatedGroup.customTabTemplate).toBeDefined());
        tick();
    }));

    it('should select next/previous tab when pressing right/left arrow', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;

        tick(100);
        fixture.detectChanges();

        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.focus();
        let args = { key: 'ArrowRight', bubbles: true };
        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        tick(200);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(1);

        tabs.tabs.toArray()[1].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        tick(200);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(2);

        args = { key: 'ArrowLeft', bubbles: true };
        tabs.tabs.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        tick(200);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(1);
    }));

    it('should select first/last tab when pressing home/end button', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;

        tick(100);
        fixture.detectChanges();

        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.focus();

        let args = { key: 'End', bubbles: true };
        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        tick(200);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(2);

        args = { key: 'Home', bubbles: true };
        tabs.tabs.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        tick(200);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(0);
    }));

    it('should scroll tab area when clicking left/right scroll buttons', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;

        tick(100);
        fixture.detectChanges();

        fixture.componentInstance.wrapperDiv.nativeElement.style.width = '400px';
        tick(100);
        fixture.detectChanges();

        const rightScrollButton = tabs.headerContainer.nativeElement.children[2];
        window.dispatchEvent(new Event('resize'));
        rightScrollButton.dispatchEvent(new Event('click', { bubbles: true }));

        tick(100);
        fixture.detectChanges();
        expect(tabs.offset).toBeGreaterThan(0);

        tabs.scrollLeft(null);

        tick(100);
        fixture.detectChanges();
        expect(tabs.offset).toBe(0);
    }));

    it('should select tab on click', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;

        tick(100);
        fixture.detectChanges();

        fixture.componentInstance.wrapperDiv.nativeElement.style.width = '400px';
        tick(100);
        fixture.detectChanges();

        tabs.tabs.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        tick(200);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(2);

        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        tick(200);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(0);
    }));

    it('should select third tab by default', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestSelectedTabComponent);
        const tabs = fixture.componentInstance.tabs;

        tick(100);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(2);

        tick();
        fixture.detectChanges();
        expect(tabs.groups.toArray()[2].isSelected).toBeTruthy();

        tick();
        fixture.detectChanges();
        expect(tabs.selectedIndicator.nativeElement.style.transform).toBe('translate(320px)');
    }));
});

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs (onTabSelected)="tabSelectedHandler($event)">
                <igx-tabs-group label="Tab 1" icon="library_music">
                    <h1>Tab 1 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tabs-group>
                <igx-tabs-group label="Tab 2" icon="video_library">
                    <h1>Tab 2 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tabs-group>
                <igx-tabs-group label="Tab 3" icon="library_books">
                    <h1>Tab 3 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Vivamus vitae malesuada odio. Praesent ante lectus, porta a eleifend vel, sodales eu nisl.
                        Vivamus sit amet purus eu lectus cursus rhoncus quis non ex.
                        Cras ac nulla sed arcu finibus volutpat.
                        Vivamus risus ipsum, pharetra a augue nec, euismod fringilla odio.
                        Integer id velit rutrum, accumsan ante a, semper nunc.
                        Phasellus ultrices tincidunt imperdiet. Nullam vulputate mauris diam.
                         Nullam elementum, libero vel varius fermentum, lorem ex bibendum nulla,
                         pretium lacinia erat nibh vel massa.
                        In hendrerit, sapien ac mollis iaculis, dolor tellus malesuada sem,
                        a accumsan lectus nisl facilisis leo.
                        Curabitur consequat sit amet nulla at consequat. Duis volutpat tristique luctus.
                    </p>
                </igx-tabs-group>
            </igx-tabs>
        </div>`
})
class TabsTestComponent {
    @ViewChild(IgxTabsComponent) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv') public wrapperDiv: any;

    public tabSelectedHandler(args) {
    }
}

@Component({
    template: `
        <div #wrapperDiv style="display: flex;">
            <igx-tabs (onTabSelected)="tabSelectedHandler($event)">
                <igx-tabs-group *ngFor="let tab of collection" [label]="tab.name"></igx-tabs-group>
            </igx-tabs>
        </div>`
})
class TabsTest2Component {
    @ViewChild(IgxTabsComponent) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv') public wrapperDiv: any;
    public collection: any[];

    public tabSelectedHandler(args) {
    }

    public constructor() {
        this.resetCollectionThreeTabs();
    }
    public resetCollectionOneTab() {
        this.collection =
            [
                { name: 'Tab 3' }
            ];
    }
    public resetCollectionTwoTabs() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 3' }
            ];
    }
    public resetCollectionThreeTabs() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 2' },
                { name: 'Tab 3' }
            ];
    }
    public resetCollectionFourTabs() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 2' },
                { name: 'Tab 3' },
                { name: 'Tab 4' }
            ];
    }
    public resetToEmptyCollection() {
        this.collection = [];
    }
}

@Component({
    template: `
        <div #wrapperDiv>
        <igx-tabs tabsType="fixed">
            <igx-tabs-group label="Tab111111111111111111111111">
                <ng-template igxTab>
                    <div>T1</div>
                 </ng-template>
                 <h1>Tab 1 Content</h1>
              </igx-tabs-group>
            <igx-tabs-group label="Tab 2">
                <ng-template igxTab>
                    <div>T2</div>
                </ng-template>
                <h1>Tab 2 Content</h1>
            </igx-tabs-group>
            <igx-tabs-group label="Tab 3">
                <ng-template igxTab>
                    <div>T3</div>
                </ng-template>
                <h1>Tab 3 Content</h1>
            </igx-tabs-group>
        </igx-tabs>
        </div>`
})
class TemplatedTabsTestComponent {
    @ViewChild(IgxTabsComponent) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv') public wrapperDiv: any;
}

@Component({
    template: `
        <div>
            <igx-tabs [selectedIndex]="2">
                <igx-tabs-group *ngFor="let tab of collection" [label]="tab.name"></igx-tabs-group>
            </igx-tabs>
        </div>`
})
class TabsTestSelectedTabComponent {
    @ViewChild(IgxTabsComponent) public tabs: IgxTabsComponent;
    public collection: any[];

    public constructor() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 2' },
                { name: 'Tab 3' },
                { name: 'Tab 4' }
            ];
    }
}
