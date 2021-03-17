import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IgxTabItemComponent, IgxTabsComponent } from '../tabs/tabs/public_api';

@Component({
    template: `
            <igx-tabs>
                <igx-tab-item>
                    <igx-tab-header>
                        Tab 1
                    </igx-tab-header>
                    <igx-tab-panel>
                        Content 1
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
                    </igx-tab-panel>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header>
                        Tab 2
                    </igx-tab-header>
                    <igx-tab-panel>
                        Content 2
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
                    </igx-tab-panel>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header>
                        Tab 3
                    </igx-tab-header>
                    <igx-tab-panel>
                        Content 3
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
                    </igx-tab-panel>
                </igx-tab-item>
            </igx-tabs>`
})
export class BasicTabsComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChildren(IgxTabItemComponent) public tabItems: QueryList<IgxTabItemComponent>;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs (onTabSelected)="tabSelectedHandler($event)">
                <igx-tab-item>
                    <igx-tab-header>
                        <igx-icon igxTabHeaderIcon>library_music</igx-icon>
                        <span igxTabHeaderLabel>Tab 1</span>
                    </igx-tab-header>
                    <igx-tab-panel>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</igx-tab-panel>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header>
                        <igx-icon igxTabHeaderIcon>video_library</igx-icon>
                        <span igxTabHeaderLabel>Tab 2</span>
                    </igx-tab-header>
                    <igx-tab-panel>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</igx-tab-panel>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header>
                        <igx-icon igxTabHeaderIcon>library_books</igx-icon>
                        <span igxTabHeaderLabel>Tab 3</span>
                    </igx-tab-header>
                    <igx-tab-panel>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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
                    </igx-tab-panel>
                </igx-tab-item>
            </igx-tabs>
        </div>`
})
export class TabsTestComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;

    public tabSelectedHandler() {
    }
}

@Component({
    template: `
        <div #wrapperDiv style="display: flex;">
            <igx-tabs>
            <!-- (onTabSelected)="tabSelectedHandler()"> -->
                <igx-tab-item *ngFor="let tab of collection">
                    <igx-tab-header><span igxTabHeaderLabel>{{ tab.name }}</span></igx-tab-header>
                </igx-tab-item>
            </igx-tabs>
        </div>`
})
export class TabsTest2Component {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
    public collection: any[];

    constructor() {
        this.resetCollectionThreeTabs();
    }

    public tabSelectedHandler() {
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
        <!-- <igx-tabs type="fixed">
            <igx-tab-item label="Tab111111111111111111111111">
                <ng-template igxTab>
                    <div>T1</div>
                 </ng-template>
                 <h1>Tab 1 Content</h1>
              </igx-tab-item>
            <igx-tab-item label="Tab 2">
                <ng-template igxTab>
                    <div>T2</div>
                </ng-template>
                <h1>Tab 2 Content</h1>
            </igx-tab-item>
            <igx-tab-item label="Tab 3">
                <ng-template igxTab>
                    <div>T3</div>
                </ng-template>
                <h1>Tab 3 Content</h1>
            </igx-tab-item>
        </igx-tabs> -->
        </div>`
})
export class TemplatedTabsTestComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
}

@Component({
    template: `
        <div>
            <igx-tabs [selectedIndex]="2">
                <igx-tab-item *ngFor="let tab of collection">
                    <igx-tab-header><span igxTabHeaderLabel>{{ tab.name }}</span></igx-tab-header>
                </igx-tab-item>
            </igx-tabs>
        </div>`
})
export class TabsTestSelectedTabComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    public collection: any[];

    constructor() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 2' },
                { name: 'Tab 3' },
                { name: 'Tab 4' }
            ];
    }
}

@Component({
    template:`
        <igx-tabs class="tabsClass">
            <igx-tab-item class="groupClass">
                <igx-tab-header><span igxTabHeaderLabel>Tab1</span></igx-tab-header>
                <igx-tab-panel>Content 1</igx-tab-panel>
            </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header><span igxTabHeaderLabel>Tab2</span></igx-tab-header>
                <igx-tab-panel>Content 2</igx-tab-panel>
            </igx-tab-item>
        </igx-tabs>`
})
export class TabsTestCustomStylesComponent {
}

@Component({
    template:`
        <button igxButton="flat" [igxToggleAction]="userProfile">
            Click
        </button>
        <igx-drop-down #userProfile>
            <div>
                <igx-tabs selectedIndex="1">
                    <igx-tab-item>
                        <igx-tab-header><span igxTabHeaderLabel>tab2</span></igx-tab-header>
                        <igx-tab-panel>Tab content 1</igx-tab-panel>
                    </igx-tab-item>
                    <igx-tab-item>
                        <igx-tab-header><span igxTabHeaderLabel>tab2</span></igx-tab-header>
                        <igx-tab-panel>Tab content 2</igx-tab-panel>
                    </igx-tab-item>
                </igx-tabs>
            </div>
        </igx-drop-down>`
})
export class TabsTestBug4420Component {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs>
                <igx-tab-item routerLink="/view1" routerLinkActive #rla1="routerLinkActive" [selected]="rla1.isActive">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item routerLink="/view2" routerLinkActive #rla2="routerLinkActive" [selected]="rla2.isActive">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item routerLink="/view3" routerLinkActive #rla3="routerLinkActive" [selected]="rla3.isActive">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
                </igx-tab-item>
            </igx-tabs>
            <div>
                <router-outlet></router-outlet>
            </div>
        </div>
    `
})
export class TabsRoutingTestComponent {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs>
                <igx-tab-item routerLink="/view1" routerLinkActive #rla1="routerLinkActive" [selected]="rla1.isActive"
                    [disabled]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item routerLink="/view2" routerLinkActive #rla2="routerLinkActive" [selected]="rla2.isActive">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item routerLink="/view3" routerLinkActive #rla3="routerLinkActive" [selected]="rla3.isActive"
                    [disabled]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item routerLink="/view4" routerLinkActive #rla4="routerLinkActive" [selected]="rla4.isActive">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 4</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item routerLink="/view5" routerLinkActive #rla5="routerLinkActive" [selected]="rla5.isActive"
                    [disabled]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 5</span></igx-tab-header>
                </igx-tab-item>
            </igx-tabs>
            <div>
                <router-outlet></router-outlet>
            </div>
        </div>
    `
})
export class TabsRoutingDisabledTestComponent {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs>
                <igx-tab-item routerLink="/view1" routerLinkActive #rla1="routerLinkActive" [selected]="rla1.isActive">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item routerLink="/view5" routerLinkActive #rlaX="routerLinkActive" [selected]="rlaX.isActive">
                    <igx-tab-header><span igxTabHeaderLabel>Tab X</span></igx-tab-header>
                </igx-tab-item>
            </igx-tabs>
            <div>
                <router-outlet></router-outlet>
            </div>
        </div>
    `
})
export class TabsRoutingGuardTestComponent {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs>
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item [selected]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
                </igx-tab-item>
            </igx-tabs>
        </div>
    `
})
export class TabsTabsOnlyModeTest1Component {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs selectedIndex="2">
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
                </igx-tab-item>
            </igx-tabs>
        </div>
    `
})
export class TabsTabsOnlyModeTest2Component {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs>
                <igx-tab-item [disabled]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item [selected]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item [disabled]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 4</span></igx-tab-header>
                </igx-tab-item>
                <igx-tab-item [disabled]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 5</span></igx-tab-header>
                </igx-tab-item>
            </igx-tabs>
        </div>
    `
})
export class TabsDisabledTestComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
}

@Component({
    template: `
        <div #wrapperDiv1>
            <igx-tabs [selectedIndex]="0">
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
                    <igx-tab-panel><div>Content 1</div></igx-tab-panel>
                </igx-tab-item>
                <igx-tab-item [selected]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
                    <igx-tab-panel><div>Content 2</div></igx-tab-panel>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
                    <igx-tab-panel><div>Content 3</div></igx-tab-panel>
                </igx-tab-item>
            </igx-tabs>
        </div>
        <div #wrapperDiv2>
            <igx-tabs [selectedIndex]="0">
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 4</span></igx-tab-header>
                    <igx-tab-panel><div>Content 4</div></igx-tab-panel>
                </igx-tab-item>
                <igx-tab-item [selected]="true">
                    <igx-tab-header><span igxTabHeaderLabel>Tab 5</span></igx-tab-header>
                    <igx-tab-panel><div>Content 5</div></igx-tab-panel>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>Tab 6</span></igx-tab-header>
                    <igx-tab-panel><div>Content 6</div></igx-tab-panel>
                </igx-tab-item>
            </igx-tabs>
        </div>`
})
export class TabsTestHtmlAttributesComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
}
