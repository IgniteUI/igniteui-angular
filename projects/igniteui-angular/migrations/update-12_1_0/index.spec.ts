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
    // eslint-disable-next-line max-len
    const noteText = `<!--NOTE: This component has been updated by Infragistics migration: v${version}\nPlease check your template whether all bindings/event handlers are correct.-->`;

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

    // IgxDropDown
    it('should update IgxDropDown event subscriptions', () => {
        pending('ts language service tests do not pass');
    });

    it('should update dropdown event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-drop-down
            (onOpening)="handleEvent($event, 'opening')"
            (onOpened)="handleEvent($event, 'opened')"
            (onClosing)="handleEvent($event, 'closing')"
            (onClosed)="handleEvent($event, 'closed')"
            (onSelection)="handleEvent($event, 'selection')"
        >
            Display something onOpening, onClosing, onOpened, onClosed
        </igx-drop-down>`);
                const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
                    .toPromise();

                expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
                    .toEqual(`
        <igx-drop-down
            (opening)="handleEvent($event, 'opening')"
            (opened)="handleEvent($event, 'opened')"
            (closing)="handleEvent($event, 'closing')"
            (closed)="handleEvent($event, 'closed')"
            (selecting)="handleEvent($event, 'selection')"
        >
            Display something onOpening, onClosing, onOpened, onClosed
        </igx-drop-down>`);
    });

    // IgxToggleDirective
    it('should update IgxToggleDirective event subscriptions', () => {
        pending('ts language service tests do not pass');
    });

    it('should update dropdown event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
            <div igxToggle
                (onOpening)="eventHandler($event)"
                (onAppended)="eventHandler($event)"
                (onOpened)="eventHandler($event)"
                (onClosing)="eventHandler($event)"
                (onClosed)="eventHandler($event)"
            >
                <p>Some content that user would like to make it togglable.</p>
            </div>`);
                const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
                    .toPromise();

                expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
                    .toEqual(`
            <div igxToggle
                (opening)="eventHandler($event)"
                (appended)="eventHandler($event)"
                (opened)="eventHandler($event)"
                (closing)="eventHandler($event)"
                (closed)="eventHandler($event)"
            >
                <p>Some content that user would like to make it togglable.</p>
            </div>`);
    });

    // IgxCombo
    it('should update IgxCombo event subscriptions', () => {
        pending('ts language service tests do not pass');
    });

    it('should update combo event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
                <igx-combo
                    (onSelectionChange)="eventHandler($event)"
                    (onSearchInput)="eventHandler($event)"
                    (onAddition)="eventHandler($event)"
                    (onDataPreLoad)="eventHandler($event)"
                    (onOpening)="eventHandler($event)"
                    (onOpened)="eventHandler($event)"
                    (onClosing)="eventHandler($event)"
                    (onClosed)="eventHandler($event)"
                >
                </igx-combo>`);
            const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
                <igx-combo
                    (selectionChange)="eventHandler($event)"
                    (searchInputUpdate)="eventHandler($event)"
                    (addition)="eventHandler($event)"
                    (dataPreLoad)="eventHandler($event)"
                    (opening)="eventHandler($event)"
                    (opened)="eventHandler($event)"
                    (closing)="eventHandler($event)"
                    (closed)="eventHandler($event)"
                >
                </igx-combo>`);
    });

    // IgxSelect
    it('should update IgxSelect event subscriptions', () => {
        pending('ts language service tests do not pass');
    });

    it('should update select event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
                <igx-select
                    (onOpening)="eventHandler($event)"
                    (onOpened)="eventHandler($event)"
                    (onClosing)="eventHandler($event)"
                    (onClosed)="eventHandler($event)"
                >
                </igx-select>`);
            const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
                <igx-select
                    (opening)="eventHandler($event)"
                    (opened)="eventHandler($event)"
                    (closing)="eventHandler($event)"
                    (closed)="eventHandler($event)"
                >
                </igx-select>`);
    });

    // IgxAutocomplete
    it('should update IgxAutocomplete event subscriptions', () => {
        pending('ts language service tests do not pass');
    });

    it('should update autocomplete event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
            <input
                igxInput
                [igxAutocomplete]="townsPanel"
                (onItemSelected)='itemSelected($event)'
            />`);
            const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
            <input
                igxInput
                [igxAutocomplete]="townsPanel"
                (itemSelected)='itemSelected($event)'
            />`);
    });

    // IgxDialog
    it('should update IgxDialog event subscriptions', () => {
        pending('ts language service tests do not pass');
    });

    it('should update dialog event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-dialog
            (onOpen)="eventHandler($event)"
            (onOpened)="eventHandler($event)"
            (onClose)="eventHandler($event)"
            (onClosed)="eventHandler($event)"
            (onLeftButtonSelect)="eventHandler($event)"
            (onRightButtonSelect)="eventHandler($event)"
        >
        </igx-dialog>`);
            const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
        <igx-dialog
            (opening)="eventHandler($event)"
            (opened)="eventHandler($event)"
            (closing)="eventHandler($event)"
            (closed)="eventHandler($event)"
            (leftButtonSelect)="eventHandler($event)"
            (rightButtonSelect)="eventHandler($event)"
        >
        </igx-dialog>`);
    });
});


