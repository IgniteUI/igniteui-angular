import { Component, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxBottomNavComponent, IgxBottomNavContentComponent, IgxBottomNavHeaderComponent, IgxBottomNavItemComponent } from '../tabs/bottom-nav/public_api';
import { IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective } from '../tabs/tabs/tabs.directives';

@Component({
    template: `
        <div #wrapperDiv>
            <igx-bottom-nav>
                <igx-bottom-nav-item>
                    <igx-bottom-nav-header>
                        <igx-icon igxTabHeaderIcon>library_music</igx-icon>
                        <span igxTabHeaderLabel>Tab 1</span>
                    </igx-bottom-nav-header>
                    <igx-bottom-nav-content>
                        <h1>Tab 1 Content</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </igx-bottom-nav-content>
                </igx-bottom-nav-item>
                <igx-bottom-nav-item>
                    <igx-bottom-nav-header>
                        <igx-icon igxTabHeaderIcon>video_library</igx-icon>
                        <span igxTabHeaderLabel>Tab 2</span>
                    </igx-bottom-nav-header>
                    <igx-bottom-nav-content>
                        <h1>Tab 2 Content</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </igx-bottom-nav-content>
                </igx-bottom-nav-item>
                <igx-bottom-nav-item>
                    <igx-bottom-nav-header>
                        <igx-icon igxTabHeaderIcon>library_books</igx-icon>
                        <span igxTabHeaderLabel>Tab 3</span>
                    </igx-bottom-nav-header>
                    <igx-bottom-nav-content>
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
                    </igx-bottom-nav-content>
                </igx-bottom-nav-item>
            </igx-bottom-nav>
        </div>`,
    imports: [IgxBottomNavComponent, IgxBottomNavItemComponent, IgxBottomNavHeaderComponent, IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective, IgxBottomNavContentComponent]
})
export class TabBarTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true }) public bottomNav: IgxBottomNavComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-bottom-nav alignment="bottom">
                <igx-bottom-nav-item>
                    <igx-bottom-nav-header>
                        <igx-icon igxTabHeaderIcon>library_music</igx-icon>
                        <span igxTabHeaderLabel>Tab 1</span>
                    </igx-bottom-nav-header>
                    <igx-bottom-nav-content>
                        <h1>Tab 1 Content</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </igx-bottom-nav-content>
                </igx-bottom-nav-item>
                <igx-bottom-nav-item>
                    <igx-bottom-nav-header>
                        <igx-icon igxTabHeaderIcon>video_library</igx-icon>
                        <span igxTabHeaderLabel>Tab 2</span>
                    </igx-bottom-nav-header>
                    <igx-bottom-nav-content>
                        <h1>Tab 2 Content</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </igx-bottom-nav-content>
                </igx-bottom-nav-item>
                <igx-bottom-nav-item>
                    <igx-bottom-nav-header>
                        <igx-icon igxTabHeaderIcon>library_books</igx-icon>
                        <span igxTabHeaderLabel>Tab 3</span>
                    </igx-bottom-nav-header>
                    <igx-bottom-nav-content>
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
                    </igx-bottom-nav-content>
                </igx-bottom-nav-item>
            </igx-bottom-nav>
        </div>`,
    imports: [IgxBottomNavComponent, IgxBottomNavItemComponent, IgxBottomNavHeaderComponent, IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective, IgxBottomNavContentComponent]
})
export class BottomTabBarTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true }) public bottomNav: IgxBottomNavComponent;
    @ViewChild('wrapperDiv', { static: true }) public wrapperDiv: any;
}

@Component({
    template: `
        <div #wrapperDiv>
            <div>
                <router-outlet></router-outlet>
            </div>
            <igx-bottom-nav>
                <igx-bottom-nav-item routerLinkActive #rla1="routerLinkActive" [selected]="rla1.isActive">
                    <igx-bottom-nav-header routerLink="/view1">
                        <igx-icon igxTabHeaderIcon>library_music</igx-icon>
                        <span igxTabHeaderLabel>Tab 1</span>
                    </igx-bottom-nav-header>
                </igx-bottom-nav-item>
                <igx-bottom-nav-item routerLinkActive #rla2="routerLinkActive" [selected]="rla2.isActive">
                    <igx-bottom-nav-header routerLink="/view2">
                        <igx-icon igxTabHeaderIcon>video_library</igx-icon>
                        <span igxTabHeaderLabel>Tab 2</span>
                    </igx-bottom-nav-header>
                </igx-bottom-nav-item>
                <igx-bottom-nav-item routerLinkActive #rla3="routerLinkActive" [selected]="rla3.isActive">
                    <igx-bottom-nav-header routerLink="/view3">
                        <igx-icon igxTabHeaderIcon>library_books</igx-icon>
                        <span igxTabHeaderLabel>Tab 3</span>
                    </igx-bottom-nav-header>
                </igx-bottom-nav-item>
            </igx-bottom-nav>
        </div>
    `,
    imports: [
        IgxBottomNavComponent,
        IgxBottomNavItemComponent,
        IgxBottomNavHeaderComponent,
        IgxTabHeaderIconDirective,
        IgxTabHeaderLabelDirective,
        IgxIconComponent,
        RouterLinkActive,
        RouterLink,
        RouterOutlet
    ]
})
export class TabBarRoutingTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true })
    public bottomNav: IgxBottomNavComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-bottom-nav>
                <igx-bottom-nav-item>
                    <igx-bottom-nav-header>
                        <igx-icon igxTabHeaderIcon>library_music</igx-icon>
                        <span igxTabHeaderLabel>Tab 1</span>
                    </igx-bottom-nav-header>
                    <igx-bottom-nav-content></igx-bottom-nav-content>
                </igx-bottom-nav-item>
                <igx-bottom-nav-item [selected]="true">
                    <igx-bottom-nav-header>
                        <igx-icon igxTabHeaderIcon>video_library</igx-icon>
                        <span igxTabHeaderLabel>Tab 2</span>
                    </igx-bottom-nav-header>
                    <igx-bottom-nav-content></igx-bottom-nav-content>
                </igx-bottom-nav-item>
                <igx-bottom-nav-item>
                    <igx-bottom-nav-header>
                        <igx-icon igxTabHeaderIcon>library_books</igx-icon>
                        <span igxTabHeaderLabel>Tab 3</span>
                    </igx-bottom-nav-header>
                    <igx-bottom-nav-content></igx-bottom-nav-content>
                </igx-bottom-nav-item>
            </igx-bottom-nav>
        </div>
    `,
    imports: [IgxBottomNavComponent, IgxBottomNavItemComponent, IgxBottomNavHeaderComponent, IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective, IgxBottomNavContentComponent]
})
export class TabBarTabsOnlyModeTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true })
    public bottomNav: IgxBottomNavComponent;
}

@Component({
    template: `
        <div #wrapperDiv>
            <div>
                <router-outlet></router-outlet>
            </div>
            <igx-bottom-nav>
                <igx-bottom-nav-item routerLinkActive #rla1="routerLinkActive" [selected]="rla1.isActive">
                    <igx-bottom-nav-header routerLink="/view1">
                        <igx-icon igxTabHeaderIcon>library_music</igx-icon>
                        <span igxTabHeaderLabel>Tab 1</span>
                    </igx-bottom-nav-header>
                </igx-bottom-nav-item>
                <igx-bottom-nav-item routerLinkActive #rlaX="routerLinkActive" [selected]="rlaX.isActive">
                    <igx-bottom-nav-header routerLink="/view5">
                        <igx-icon igxTabHeaderIcon>library_books</igx-icon>
                        <span igxTabHeaderLabel>Tab 5</span>
                    </igx-bottom-nav-header>
                </igx-bottom-nav-item>
            </igx-bottom-nav>
        </div>
    `,
    imports: [IgxBottomNavComponent, IgxBottomNavItemComponent, IgxBottomNavHeaderComponent, IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective, RouterLink, RouterLinkActive, RouterOutlet]
})
export class BottomNavRoutingGuardTestComponent {
    @ViewChild(IgxBottomNavComponent, { static: true })
    public bottomNav: IgxBottomNavComponent;
}

@Component({
    template: `
        <div>
            <div>
                <igx-bottom-nav>
                    <igx-bottom-nav-item>
                        <igx-bottom-nav-header>
                            <span igxTabHeaderLabel>Tab 1</span>
                        </igx-bottom-nav-header>
                        <igx-bottom-nav-content>
                            <div>Content 1</div>
                        </igx-bottom-nav-content>
                    </igx-bottom-nav-item>
                    <igx-bottom-nav-item>
                        <igx-bottom-nav-header>
                            <span igxTabHeaderLabel>Tab 2</span>
                        </igx-bottom-nav-header>
                        <igx-bottom-nav-content>
                            <div>Content 2</div>
                        </igx-bottom-nav-content>
                    </igx-bottom-nav-item>
                    <igx-bottom-nav-item>
                        <igx-bottom-nav-header>
                            <span igxTabHeaderLabel>Tab 3</span>
                        </igx-bottom-nav-header>
                        <igx-bottom-nav-content>
                            <div>Content 3</div>
                        </igx-bottom-nav-content>
                    </igx-bottom-nav-item>
                </igx-bottom-nav>
            </div>
            <div>
                <igx-bottom-nav>
                    <igx-bottom-nav-item>
                        <igx-bottom-nav-header>
                            <span igxTabHeaderLabel>Tab 4</span>
                        </igx-bottom-nav-header>
                        <igx-bottom-nav-content>
                            <div>Content 4</div>
                        </igx-bottom-nav-content>
                    </igx-bottom-nav-item>
                    <igx-bottom-nav-item>
                        <igx-bottom-nav-header>
                            <span igxTabHeaderLabel>Tab 5</span>
                        </igx-bottom-nav-header>
                        <igx-bottom-nav-content>
                            <div>Content 5</div>
                        </igx-bottom-nav-content>
                    </igx-bottom-nav-item>
                    <igx-bottom-nav-item>
                        <igx-bottom-nav-header>
                            <span igxTabHeaderLabel>Tab 6</span>
                        </igx-bottom-nav-header>
                        <igx-bottom-nav-content>
                            <div>Content 6</div>
                        </igx-bottom-nav-content>
                    </igx-bottom-nav-item>
                </igx-bottom-nav>
            </div>
        </div>
    `,
    imports: [IgxBottomNavComponent, IgxBottomNavItemComponent, IgxBottomNavHeaderComponent, IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective, IgxBottomNavContentComponent]
})
export class BottomNavTestHtmlAttributesComponent {
    @ViewChild(IgxBottomNavComponent, { static: true }) public bottomNav: IgxBottomNavComponent;
}
