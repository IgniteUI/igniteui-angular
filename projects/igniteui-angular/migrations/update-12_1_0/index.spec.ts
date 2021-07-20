import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '12.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    const migrationName = 'migration-21';

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    // IgxOverlayService
    it('should update overlay events subscriptions', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/service/test.component.ts', `
import { Component, OnInit } from '@angular/core';
import { IgxOverlayService } from 'igniteui-angular';
export class SimpleComponent implements OnInit {
    constructor(@Inject(IgxOverlayService) protected overlayService: IgxOverlayService){}

    public ngOnInit() {
        this.overlayService.onOpening.subscribe();
        this.overlayService.opened.subscribe();
        this.overlayService.onClosing.subscribe();
        this.overlayService.onClosed.subscribe();
        this.overlayService.onAppended.subscribe();
        this.overlayService.onAnimation.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/service/test.component.ts'))
            .toEqual(`
import { Component, OnInit } from '@angular/core';
import { IgxOverlayService } from 'igniteui-angular';
export class SimpleComponent implements OnInit {
    constructor(@Inject(IgxOverlayService) protected overlayService: IgxOverlayService){}

    public ngOnInit() {
        this.overlayService.opening.subscribe();
        this.overlayService.opened.subscribe();
        this.overlayService.closing.subscribe();
        this.overlayService.closed.subscribe();
        this.overlayService.contentAppended.subscribe();
        this.overlayService.animationStarting.subscribe();
    }
}`);
    });

    it('should update banner event subscriptions in .ts file', async () => {
        pending('ts language service tests do not pass');
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts', `
import { Component, OnInit } from '@angular/core';
import { IgxBannerComponent } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxBannerComponent)
    public banner: IgxBannerComponent

    public ngOnInit() {
        this.banner.onOpening.subscribe();
        this.banner.onOpened.subscribe();
        this.banner.onClosing.subscribe();
        this.banner.onClosed.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(`
import { Component, OnInit } from '@angular/core';
import { IgxBannerComponent } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxBannerComponent)
    public banner: IgxBannerComponent

    public ngOnInit() {
        this.banner.opening.subscribe();
        this.banner.opened.subscribe();
        this.banner.closing.subscribe();
        this.banner.closed.subscribe();
    }
}`);
    });

    it('should update banner event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-banner
    (onOpening)="handleEvent($event, 'opening')"
    (onOpened)="handleEvent($event, 'opened')"
    (onClosing)="handleEvent($event, 'closing')"
    (onClosed)="handleEvent($event, 'closed')"
>
    Display something onOpening, onClosing, onOpened, onClosed
</igx-banner>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<igx-banner
    (opening)="handleEvent($event, 'opening')"
    (opened)="handleEvent($event, 'opened')"
    (closing)="handleEvent($event, 'closing')"
    (closed)="handleEvent($event, 'closed')"
>
    Display something onOpening, onClosing, onOpened, onClosed
</igx-banner>`);
    });

    it('should update expansion panel event subscriptions in .ts file', async () => {
        pending('ts language service tests do not pass');
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts', `
import { Component, OnInit } from '@angular/core';
import { IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxExpansionPanelComponent)
    public panel: IgxExpansionPanelComponent

    @ViewChild(IgxExpansionPanelHeaderComponent)
    public header: IgxExpansionPanelHeaderComponent

    public ngOnInit() {
        this.panel.onExpanded.subscribe();
        this.panel.onCollapsed.subscribe();
        this.header.onInteraction.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(`
import { Component, OnInit } from '@angular/core';
import { IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxExpansionPanelComponent)
    public panel: IgxExpansionPanelComponent

    @ViewChild(IgxExpansionPanelHeaderComponent)
    public header: IgxExpansionPanelHeaderComponent

    public ngOnInit() {
        this.panel.contentExpanded.subscribe();
        this.panel.contentCollapsed.subscribe();
        this.header.interaction.subscribe();
    }
}`);
    });

    it('should update mask event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<input igxInput type="text" [igxMask]="'(####) 00-00-00 Ext. 9999'" (onValueChange)="handleEvent()" />`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<input igxInput type="text" [igxMask]="'(####) 00-00-00 Ext. 9999'" (valueChanged)="handleEvent()" />`);
    });

    it('should update mask event subscriptions .ts file', async () => {
        pending('ts language service tests do not pass');
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts', `
import { Component, OnInit } from '@angular/core';
import { IgxMaskDirective } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxMaskDirective)
    public mask: IgxMaskDirective

    public ngOnInit() {
        this.mask.onValueChange.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(`
import { Component, OnInit } from '@angular/core';
import { IgxMaskDirective } from 'igniteui-angular';
export class TestComponent implements OnInit {
    @ViewChild(IgxMaskDirective)
    public mask: IgxMaskDirective

    public ngOnInit() {
        this.mask.valueChanged;
    }
}`);
    });


    it('should update expansion panel event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-expansion-panel (onExpanded)="handleExpanded($event)" (onCollapsed)="handleCollapsed($event)">
    <igx-expansion-panel-header (onInteraction)="handleInteraction($event)">
        Trigger something onInteraction and onExpanded and onCollapsed
    </igx-expansion-panel-header>
</igx-expansion-panel>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<igx-expansion-panel (contentExpanded)="handleExpanded($event)" (contentCollapsed)="handleCollapsed($event)">
    <igx-expansion-panel-header (interaction)="handleInteraction($event)">
        Trigger something onInteraction and onExpanded and onCollapsed
    </igx-expansion-panel-header>
</igx-expansion-panel>`);
    });

it('Should remove references to deprecated `banner` property of `BannerEventArgs`', async () => {
    pending('set up tests for migrations through lang service');
    appTree.create(
        '/testSrc/appPrefix/component/expansion-test.component.ts',
        `import { Component, ViewChild } from '@angular/core';
import { IgxBanner } from 'igniteui-angular';

@Component({
selector: 'app-banner-test',
templateUrl: './banner-test.component.html',
styleUrls: ['./banner-test.component.scss']
})
export class BannerTestComponent {

@ViewChild(IgxBannerComponent, { static: true })
public panel: IgxBannerComponent;

public onBannerOpened(event: BannerEventArgs) {
    console.log(event.banner);
}
}`
    );
    const tree = await schematicRunner
        .runSchematicAsync('migration-17', {}, appTree)
        .toPromise();
    const expectedContent =  `import { Component, ViewChild } from '@angular/core';
import { IgxBanner } from 'igniteui-angular';

@Component({
selector: 'app-banner-test',
templateUrl: './banner-test.component.html',
styleUrls: ['./banner-test.component.scss']
})
export class BannerTestComponent {

@ViewChild(IgxBannerComponent, { static: true })
public panel: IgxBannerComponent;

public onBannerOpened(event: BannerEventArgs) {
    console.log(event.owner);
}
}`;
    expect(
            tree.readContent('/testSrc/appPrefix/component/expansion-test.component.ts')
        ).toEqual(expectedContent);
});
});
