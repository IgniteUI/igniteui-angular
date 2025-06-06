import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxToggleActionDirective } from '../directives/toggle/toggle.directive';
import { IgxDropDownComponent } from '../drop-down/drop-down.component';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxPrefixDirective, IgxSuffixDirective } from '../input-group/public_api';
import { IgxTabContentComponent, IgxTabHeaderComponent, IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective, IgxTabItemComponent, IgxTabsComponent } from '../tabs/tabs/public_api';
import { SampleTestData } from './sample-test-data.spec';

@Component({
    template: `
    <igx-tabs>
        <igx-tab-item>
            <igx-tab-header>
                Tab 1
            </igx-tab-header>
            <igx-tab-content>
                Content 1
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-tab-content>
        </igx-tab-item>
        <igx-tab-item>
            <igx-tab-header>
                Tab 2
            </igx-tab-header>
            <igx-tab-content>
                Content 2
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-tab-content>
        </igx-tab-item>
        <igx-tab-item>
            <igx-tab-header>
                Tab 3
            </igx-tab-header>
            <igx-tab-content>
                Content 3
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula.
            </igx-tab-content>
        </igx-tab-item>
    </igx-tabs>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent]
})
export class BasicTabsComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChildren(IgxTabItemComponent) public tabItems: QueryList<IgxTabItemComponent>;
}

@Component({
    template: `
    <div #wrapperDiv>
        <igx-tabs>
            <igx-tab-item>
                <igx-tab-header>
                    <igx-icon igxTabHeaderIcon>library_music</igx-icon>
                    <span igxTabHeaderLabel>Tab 1</span>
                </igx-tab-header>
                <igx-tab-content>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</igx-tab-content>
            </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header>
                    <igx-icon igxTabHeaderIcon>video_library</igx-icon>
                    <span igxTabHeaderLabel>Tab 2</span>
                </igx-tab-header>
                <igx-tab-content>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</igx-tab-content>
            </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header>
                    <igx-icon igxTabHeaderIcon>library_books</igx-icon>
                    <span igxTabHeaderLabel>Tab 3</span>
                </igx-tab-header>
                <igx-tab-content>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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
                </igx-tab-content>
            </igx-tab-item>
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxIconComponent, IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective]
})
export class TabsTestComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
}

@Component({
    template: `
    <div #wrapperDiv style="display: flex;">
        <igx-tabs>
            @for (tab of collection; track trackByItemRef(tab)) {
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>{{ tab.name }}</span></igx-tab-header>
                    <igx-tab-content></igx-tab-content>
                </igx-tab-item>
            }
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective]
})
export class TabsTest2Component {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
    protected collection: any[];

    constructor() {
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

    /** Explicitly track object so collection changes entirely for index logic test */
    protected trackByItemRef = (x: any) => x;
}

@Component({
    template: `
    <div #wrapperDiv>
        <igx-tabs>
            <igx-tab-item>
                <igx-tab-header>
                    <div>T1</div>
                    <span igxTabHeaderLabel>Tab 1</span>
                </igx-tab-header>
                <igx-tab-content>
                    <h1>Tab 1 Content</h1>
                </igx-tab-content>
                </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header>
                    <div>T2</div>
                    <span igxTabHeaderLabel>Tab 2</span>
                </igx-tab-header>
                <igx-tab-content>
                    <h1>Tab 2 Content</h1>
                </igx-tab-content>
            </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header>
                    <div>T3</div>
                    <span igxTabHeaderLabel>Tab 3</span>
                </igx-tab-header>
                <igx-tab-content>
                    <h1>Tab 3 Content</h1>
                </igx-tab-content>
            </igx-tab-item>
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective]
})
export class TemplatedTabsTestComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
}

@Component({
    template: `
    <div>
        <igx-tabs [selectedIndex]="2">
            @for (tab of collection; track tab.name) {
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>{{ tab.name }}</span></igx-tab-header>
                </igx-tab-item>
            }
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabHeaderLabelDirective]
})
export class TabsTestSelectedTabComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    protected collection: any[];

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
    template: `
    <igx-tabs class="tabsClass">
        <igx-tab-item>
            <igx-tab-header><span igxTabHeaderLabel>Tab1</span></igx-tab-header>
            <igx-tab-content class="groupClass">Content 1</igx-tab-content>
        </igx-tab-item>
        <igx-tab-item>
            <igx-tab-header><span igxTabHeaderLabel>Tab2</span></igx-tab-header>
            <igx-tab-content>Content 2</igx-tab-content>
        </igx-tab-item>
    </igx-tabs>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective]
})
export class TabsTestCustomStylesComponent {
}

@Component({
    template: `
    <button type="button" igxButton="flat" [igxToggleAction]="userProfile">
        Click
    </button>
    <igx-drop-down #userProfile>
        <div>
            <igx-tabs [selectedIndex]="1">
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>tab2</span></igx-tab-header>
                    <igx-tab-content>Tab content 1</igx-tab-content>
                </igx-tab-item>
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>tab2</span></igx-tab-header>
                    <igx-tab-content>Tab content 2</igx-tab-content>
                </igx-tab-item>
            </igx-tabs>
        </div>
    </igx-drop-down>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective, IgxDropDownComponent, IgxToggleActionDirective, IgxButtonDirective]
})
export class TabsTestBug4420Component {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
}

@Component({
    template: `
    <div #wrapperDiv>
        <igx-tabs>
            <igx-tab-item routerLinkActive #rla1="routerLinkActive" [selected]="rla1.isActive">
                <igx-tab-header routerLink="/view1"><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
            </igx-tab-item>
            <igx-tab-item routerLinkActive #rla2="routerLinkActive" [selected]="rla2.isActive">
                <igx-tab-header routerLink="/view2"><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
            </igx-tab-item>
            <igx-tab-item routerLinkActive #rla3="routerLinkActive" [selected]="rla3.isActive">
                <igx-tab-header routerLink="/view3"><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
            </igx-tab-item>
        </igx-tabs>
        <div>
            <router-outlet></router-outlet>
        </div>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabHeaderLabelDirective, RouterLinkActive, RouterLink, RouterOutlet]
})
export class TabsRoutingTestComponent {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
    <div #wrapperDiv>
        <igx-tabs>
            <igx-tab-item routerLinkActive #rla1="routerLinkActive" [selected]="rla1.isActive"
                [disabled]="true">
                <igx-tab-header routerLink="/view1"><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
            </igx-tab-item>
            <igx-tab-item routerLinkActive #rla2="routerLinkActive" [selected]="rla2.isActive">
                <igx-tab-header routerLink="/view2"><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
            </igx-tab-item>
            <igx-tab-item routerLinkActive #rla3="routerLinkActive" [selected]="rla3.isActive"
                [disabled]="true">
                <igx-tab-header routerLink="/view3"><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
            </igx-tab-item>
            <igx-tab-item routerLinkActive #rla4="routerLinkActive" [selected]="rla4.isActive">
                <igx-tab-header routerLink="/view4"><span igxTabHeaderLabel>Tab 4</span></igx-tab-header>
            </igx-tab-item>
            <igx-tab-item routerLinkActive #rla5="routerLinkActive" [selected]="rla5.isActive"
                [disabled]="true">
                <igx-tab-header routerLink="/view5"><span igxTabHeaderLabel>Tab 5</span></igx-tab-header>
            </igx-tab-item>
        </igx-tabs>
        <div>
            <router-outlet></router-outlet>
        </div>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabHeaderLabelDirective, RouterLink, RouterLinkActive, RouterOutlet]
})
export class TabsRoutingDisabledTestComponent {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
    <div #wrapperDiv>
        <igx-tabs>
            <igx-tab-item routerLinkActive #rla1="routerLinkActive" [selected]="rla1.isActive">
                <igx-tab-header routerLink="/view1"><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
            </igx-tab-item>
            <igx-tab-item routerLinkActive #rlaX="routerLinkActive" [selected]="rlaX.isActive">
                <igx-tab-header routerLink="/view5"><span igxTabHeaderLabel>Tab X</span></igx-tab-header>
            </igx-tab-item>
        </igx-tabs>
        <div>
            <router-outlet></router-outlet>
        </div>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabHeaderLabelDirective, RouterLinkActive, RouterLink, RouterOutlet]
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
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabHeaderLabelDirective]
})
export class TabsTabsOnlyModeTest1Component {
    @ViewChild(IgxTabsComponent, { static: true })
    public tabs: IgxTabsComponent;
}

@Component({
    template: `
    <div #wrapperDiv>
        <igx-tabs>
            <igx-tab-item [disabled]="true">
                <igx-tab-header><span igxTabHeaderLabel>Tab 1</span></igx-tab-header>
                <igx-tab-content></igx-tab-content>
            </igx-tab-item>
            <igx-tab-item [selected]="true">
                <igx-tab-header><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
                <igx-tab-content></igx-tab-content>
            </igx-tab-item>
            <igx-tab-item [disabled]="true">
                <igx-tab-header><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
                <igx-tab-content></igx-tab-content>
            </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header><span igxTabHeaderLabel>Tab 4</span></igx-tab-header>
                <igx-tab-content></igx-tab-content>
            </igx-tab-item>
            <igx-tab-item [disabled]="true">
                <igx-tab-header><span igxTabHeaderLabel>Tab 5</span></igx-tab-header>
                <igx-tab-content></igx-tab-content>
            </igx-tab-item>
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective]
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
                <igx-tab-content><div>Content 1</div></igx-tab-content>
            </igx-tab-item>
            <igx-tab-item [selected]="true">
                <igx-tab-header><span igxTabHeaderLabel>Tab 2</span></igx-tab-header>
                <igx-tab-content><div>Content 2</div></igx-tab-content>
            </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header><span igxTabHeaderLabel>Tab 3</span></igx-tab-header>
                <igx-tab-content><div>Content 3</div></igx-tab-content>
            </igx-tab-item>
        </igx-tabs>
    </div>
    <div #wrapperDiv2>
        <igx-tabs [selectedIndex]="0">
            <igx-tab-item>
                <igx-tab-header><span igxTabHeaderLabel>Tab 4</span></igx-tab-header>
                <igx-tab-content><div>Content 4</div></igx-tab-content>
            </igx-tab-item>
            <igx-tab-item [selected]="true">
                <igx-tab-header><span igxTabHeaderLabel>Tab 5</span></igx-tab-header>
                <igx-tab-content><div>Content 5</div></igx-tab-content>
            </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header><span igxTabHeaderLabel>Tab 6</span></igx-tab-header>
                <igx-tab-content><div>Content 6</div></igx-tab-content>
            </igx-tab-item>
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective]
})
export class TabsTestHtmlAttributesComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
}

@Component({
    template: `
    <div #wrapperDiv>
        <igx-tabs>
            <igx-tab-item>
                <igx-tab-header>
                    <span igxPrefix>Test:</span>
                    <igx-icon igxTabHeaderIcon>library_music</igx-icon>
                    <span igxTabHeaderLabel>Tab 1</span>
                    <igx-icon igxSuffix>close</igx-icon>
                </igx-tab-header>
                <igx-tab-content>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</igx-tab-content>
            </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header>
                    <span igxPrefix>Test:</span>
                    <igx-icon igxTabHeaderIcon>video_library</igx-icon>
                    <span igxTabHeaderLabel>Tab 2</span>
                </igx-tab-header>
                <igx-tab-content>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</igx-tab-content>
            </igx-tab-item>
            <igx-tab-item>
                <igx-tab-header>
                    <igx-icon igxTabHeaderIcon>library_books</igx-icon>
                    <span igxTabHeaderLabel>Tab 3</span>
                    <igx-icon igxSuffix>close</igx-icon>
                </igx-tab-header>
                <igx-tab-content>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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
                </igx-tab-content>
            </igx-tab-item>
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective, IgxIconComponent, IgxTabHeaderIconDirective, IgxPrefixDirective, IgxSuffixDirective]
})
export class TabsWithPrefixSuffixTestComponent extends TabsTestComponent {
}

@Component({
    selector: 'igx-tabs-contacts',
    template: `
    <div #wrapperDiv>
        <igx-tabs>
            @for (contact of contacts; track contact.Name) {
                <igx-tab-item>
                    <igx-tab-header>
                        <span igxTabHeaderLabel>{{contact.Name}}</span>
                    </igx-tab-header>
                    <igx-tab-content>
                    </igx-tab-content>
                </igx-tab-item>
            }
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective]
})
export class TabsContactsComponent extends TabsTestComponent {
    public contacts = SampleTestData.personAvatarData();
}

@Component({
    template: `
    <div #wrapperDiv style="display: flex;">
        <igx-tabs>
            @for (tab of collection; track tab.name) {
                <igx-tab-item [(selected)]="tab.selected">
                    <igx-tab-header><span igxTabHeaderLabel>{{ tab.name }}</span></igx-tab-header>
                    <igx-tab-content></igx-tab-content>
                </igx-tab-item>
            }
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective]
})
export class AddingSelectedTabComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    protected collection: any[];
    constructor() {
        this.collection = [
            { name: 'tab1', selected: true },
            { name: 'tab2', selected: false }
        ];
    }

    public addTab() {
        this.collection.forEach(t => t.selected = false);
        this.collection.push({ name: 'tab' + (this.collection.length + 1), selected: true });
    }
}

@Component({
    template: `
    <div #wrapperDiv>
        <igx-tabs>
            @for (tab of collection; track tab.name) {
                <igx-tab-item>
                    <igx-tab-header><span igxTabHeaderLabel>{{ tab.name }}</span></igx-tab-header>
                    <igx-tab-content></igx-tab-content>
                </igx-tab-item>
            }
        </igx-tabs>
    </div>
    `,
    imports: [IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxTabContentComponent, IgxTabHeaderLabelDirective]
})
export class TabsRtlComponent {
    @ViewChild(IgxTabsComponent, { static: true }) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
    protected collection = [
        { name: 'tab1', selected: true },
        { name: 'tab2', selected: false },
        { name: 'tab3', selected: false },
        { name: 'tab4', selected: false },
        { name: 'tab5', selected: false },
        { name: 'tab6', selected: false },
        { name: 'tab7', selected: false },
        { name: 'tab8', selected: false },
        { name: 'tab9', selected: false },
    ];
}
