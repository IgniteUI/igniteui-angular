import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '12.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const migrationName = 'migration-20';
    // eslint-disable-next-line max-len
    const noteText = `<!--NOTE: This component has been updated by Infragistics migration: v${version}\nPlease check your template whether all bindings/event handlers are correct.-->`;

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should update avatar theme args', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `
$theme: igx-avatar-theme(
    $initials-background: white,
    $icon-background: green,
    $image-background: red,
    $initials-color: black,
    $icon-color: gold,
    $border-radius-round: 14px,
    $border-radius-square: 12px
);
`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
            `
$theme: igx-avatar-theme(
    $background: white,
    $color: black,
    $border-radius: 14px
);
`
        );
    });

    it('should update onColumnChange', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
<igx-grid>
  <igx-column (onColumnChange)="columnChanged()"></igx-column>
</igx-grid>
`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
<igx-grid>
  <igx-column (columnChange)="columnChanged()"></igx-column>
</igx-grid>
`
        );
    });

    it('should replace onValueChange and onValueChanged with valueChange and dragFinished in igx-slider', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/slider.component.html`,
            `<igx-slider
            (onValueChange)="someHandler($event)"
            (onValueChanged)="someHandler($event)"
            ></igx-slider>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/slider.component.html')).toEqual(
            `<igx-slider
            (valueChange)="someHandler($event)"
            (dragFinished)="someHandler($event)"
            ></igx-slider>`
        );
    });

    it('should replace onProgressChanged with progressChanged in igx-linear-bar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/linear.component.html`,
            `<igx-linear-bar [value]="currentValue" (onProgressChanged)="progressChange($event)"></igx-linear-bar>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/linear.component.html')).toEqual(
            `<igx-linear-bar [value]="currentValue" (progressChanged)="progressChange($event)"></igx-linear-bar>`
        );
    });

    it('should replace onProgressChanged with progressChanged in igx-circular-bar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/circular.component.html`,
            `<igx-circular-bar [value]="currentValue" (onProgressChanged)="progressChange($event)"></igx-circular-bar>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/circular.component.html')).toEqual(
            `<igx-circular-bar [value]="currentValue" (progressChanged)="progressChange($event)"></igx-circular-bar>`
        );
    });

    // IgxTabs
    it('Should update igx-tab-group to igx-tab-item', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs type="contentFit" [selectedIndex]="0">
<igx-tabs-group label="Tab1" icon="home" class="tabgroup">
    <div>Some Content</div>
</igx-tabs-group>
</igx-tabs>`);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-tabs [selectedIndex]="0" tabAlignment="start">
<igx-tab-item>
<igx-tab-header>
<igx-icon igxTabHeaderIcon>home</igx-icon>
<span igxTabHeaderLabel>Tab1</span>
</igx-tab-header>
<igx-tab-content class="tabgroup">
    <div>Some Content</div>
</igx-tab-content>
</igx-tab-item>
</igx-tabs>`);
    });

    it('Should insert routerLink to igx-tab-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs type="fixed">
<igx-tab-item routerLink="view1" [isSelected]="true" label="Tab1" icon="home" class="tabitem">
<ng-template igxTab>
<div class="horizontal-center">
<igx-icon>playlist_add_check</igx-icon>
<div class="igx-tabs__item-label" i18n>Strategies</div>
</div>
</ng-template>
</igx-tab-item>
</igx-tabs>`);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-tabs tabAlignment="justify">
<igx-tab-item [selected]="true">
<igx-tab-header routerLink="view1" class="tabitem">
<div class="horizontal-center">
<igx-icon>playlist_add_check</igx-icon>
<div class="igx-tabs__item-label" i18n>Strategies</div>
</div>
</igx-tab-header>
</igx-tab-item>
</igx-tabs>`);
    });

    it('Should not create igx-[tab|botton-nav]-content if it\'s already present', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs #tabs1>
<igx-tab-item>
<igx-tab-header>
<span igxTabHeaderLabel>Home</span>
</igx-tab-header>
<igx-tab-content>Home content.</igx-tab-content>
</igx-tab-item>
</igx-tabs>
<!--BottomNav-->
<igx-bottom-nav>
<igx-bottom-nav-item>
<igx-bottom-nav-header>
<igx-icon igxBottomNavHeaderIcon>library_music</igx-icon>
<span igxBottomNavHeaderLabel>Songs</span>
</igx-bottom-nav-header>
<igx-bottom-nav-content>
<div class="item" *ngFor="let song of songsList">
<span class="item-line1">{{song.title}}</span><br/>
<span class="item-line2">{{song.artist}}</span>
</div>
</igx-bottom-nav-content>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
<igx-tabs #tabs1>
<igx-tab-item>
<igx-tab-header>
<span igxTabHeaderLabel>Home</span>
</igx-tab-header>
<igx-tab-content>Home content.</igx-tab-content>
</igx-tab-item>
</igx-tabs>
<!--BottomNav-->
<igx-bottom-nav>
<igx-bottom-nav-item>
<igx-bottom-nav-header>
<igx-icon igxBottomNavHeaderIcon>library_music</igx-icon>
<span igxBottomNavHeaderLabel>Songs</span>
</igx-bottom-nav-header>
<igx-bottom-nav-content>
<div class="item" *ngFor="let song of songsList">
<span class="item-line1">{{song.title}}</span><br/>
<span class="item-line2">{{song.artist}}</span>
</div>
</igx-bottom-nav-content>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
    });

    it('Should insert ng-template content into igx-tab-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs type="fixed">
<igx-tabs-group>
<ng-template igxTab>
    <span>Tab1</span>
</ng-template>
<div>Tab Content</div>
</igx-tabs-group>
</igx-tabs>`);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-tabs tabAlignment="justify">
<igx-tab-item>
<igx-tab-header>
    <span>Tab1</span>
</igx-tab-header>
<igx-tab-content>
<div>Tab Content</div>
</igx-tab-content>
</igx-tab-item>
</igx-tabs>`);
    });

    // IgxBottomNav
    it('Should update igx-tab-panel to igx-bottom-nav-item', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-bottom-nav>
<igx-tab-panel label="Tab1" icon="folder" [isSelected]="true" class="tabpanel">
Some Content
</igx-tab-panel>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-bottom-nav>
<igx-bottom-nav-item [selected]="true">
<igx-bottom-nav-header>
<igx-icon igxBottomNavHeaderIcon>folder</igx-icon>
<span igxBottomNavHeaderLabel>Tab1</span>
</igx-bottom-nav-header>
<igx-bottom-nav-content class="tabpanel">
Some Content
</igx-bottom-nav-content>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
    });

    it('Should insert routerLink to igx-bottom-nav-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-bottom-nav>
<igx-tab label="Tab1" icon="folder" routerLink="view1" class="igxtab" label="Tab1" icon="home">
<ng-template igxTab>
<div>Tab1</div>
</ng-template>
</igx-tab>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-bottom-nav>
<igx-bottom-nav-item>
<igx-bottom-nav-header routerLink="view1" class="igxtab">
<div>Tab1</div>
</igx-bottom-nav-header>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
    });

    it('Should insert ng-template content into igx-bottom-nav-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-bottom-nav>
<igx-tab-panel>
<ng-template igxTab>
<div>Tab1</div>
</ng-template>
<div>Tab Content</div>
</igx-tab-panel>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-bottom-nav>
<igx-bottom-nav-item>
<igx-bottom-nav-header>
<div>Tab1</div>
</igx-bottom-nav-header>
<igx-bottom-nav-content>
<div>Tab Content</div>
</igx-bottom-nav-content>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
    });

    it('Should update the css selectors', async () => {
        appTree.create('/testSrc/appPrefix/component/custom.component.scss', `
igx-tabs-group {
    padding: 8px;
}
igx-tab-item {
    padding: 8px;
}
igx-tab-panel {
    padding: 8px;
}
igx-tab {
    padding: 8px;
}`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.scss'))
            .toEqual(`
igx-tab-content {
    padding: 8px;
}
igx-tab-header {
    padding: 8px;
}
igx-bottom-nav-content {
    padding: 8px;
}
igx-bottom-nav-header {
    padding: 8px;
}`);

    });

    // IgxDateTimeEditor
    it('should update isSpinLoop', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <input igxDateTimeEditorDirective [isSpinLoop]="true"/>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <input igxDateTimeEditorDirective [spinLoop]="true"/>
    `
        );
    });

    it('should update onValueChange', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <input igxDateTimeEditorDirective (onValueChange)="change()" mode="dialog"/>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <input igxDateTimeEditorDirective (valueChange)="change()" mode="dialog"/>
    `
        );
    });

    // IgxDatePicker
    it('should update onSelection', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onSelection)="change()" mode="dialog" labelVisibility="false"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (valueChange)="change()" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update onClosing', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onClosing)="close()" mode="dialog" labelVisibility="false"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (closing)="close()" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update onClosed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onClosed)="close()" mode="dialog" labelVisibility="false"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (closed)="close()" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update onOpening', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onOpening)="open()" mode="dialog" labelVisibility="false"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (opening)="open()" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update onOpened', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onOpened)="open()" mode="dialog" labelVisibility="false"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (opened)="open()" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update onValidationFailed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onValidationFailed)="fail()" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (validationFailed)="fail()" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should remove onDisabledDate', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onDisabledDate)="disable()" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update editorTabIndex', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [editorTabIndex]="1" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [tabIndex]="1" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should remove labelVisibility', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [labelVisibility]="true" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update mask', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [mask]="string" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [inputFormat]="string" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update format', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [format]="string" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [displayFormat]="string" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update displayData', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [displayData]="string" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [displayFormat]="string" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update monthsViewNumber', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [monthsViewNumber]="3" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [displayMonthsCount]="3" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update vertical', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [vertical]="true" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [headerOrientation]="true" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update dropDownOverlaySettings', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [dropDownOverlaySettings]="settings" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [overlaySettings]="settings" mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should update modalOverlaySettings', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [modalOverlaySettings]="settings" mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [overlaySettings]="settings" mode="dialog"></igx-date-picker>
    `
        );
    });

    // IgxTimePicker
    it('should update onValueChanged', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onValueChanged)="change()" mode="dialog" labelVisibility='false'></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (valueChange)="change()" mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should update onClosing', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onClosing)="close()" mode="dialog" labelVisibility="false"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (closing)="close()" mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should update onClosed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onClosed)="close()" mode="dialog" labelVisibility='false'></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (closed)="close()" mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should update onOpening', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onOpening)="open()" mode="dialog" labelVisibility='false'></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (opening)="open()" mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should update onOpened', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onOpened)="open()" mode="dialog" labelVisibility='false'></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (opened)="open()" mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should update onValidationFailed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onValidationFailed)="fail()" mode="dialog" labelVisibility='false'></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (validationFailed)="fail()" mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should update isSpinLoop', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [isSpinLoop]="true" mode="dialog" labelVisibility='false'></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker [spinLoop]="true" mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should update vertical', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [vertical]="true" mode="dialog" labelVisibility='false'></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker [headerOrientation]="true" mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should update format', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [format]="string" mode="dialog" labelVisibility='false'></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker [inputFormat]="string" mode="dialog"></igx-time-picker>
    `
        );
    });

    // IgxDateRangePicker
    it('should update rangeSelected', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (rangeSelected)="change()" mode="dialog"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (valueChange)="change()" mode="dialog"></igx-date-range-picker>
    `
        );
    });

    it('should update onClosing', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (onClosing)="close()" mode="dialog"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (closing)="close()" mode="dialog"></igx-date-range-picker>
    `
        );
    });

    it('should update onClosed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (onClosed)="close()" mode="dialog"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (closed)="close()" mode="dialog"></igx-date-range-picker>
    `
        );
    });

    it('should update onOpening', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (onOpening)="open()" mode="dialog"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (opening)="open()" mode="dialog"></igx-date-range-picker>
    `
        );
    });

    it('should update onOpened', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (onOpened)="open()" mode="dialog"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (opened)="open()" mode="dialog"></igx-date-range-picker>
    `
        );
    });

    it('should update monthsViewNumber', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker [monthsViewNumber]="3"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker [displayMonthsCount]="3"></igx-date-range-picker>
    `
        );
    });

    // Custom migrations

    // igxDatePicker
    it('should remove [mode]=dropdown and add default date label', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [mode]="'dropdown'"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker >
<label igxLabel>Date</label></igx-date-picker>
    `
        );
    });

    it('should remove mode=dropdown', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker mode="dropdown" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker></igx-date-picker>
    `
        );
    });

    it('should not remove [mode]=dialog', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [mode]="'dialog'" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [mode]="'dialog'"></igx-date-picker>
    `
        );
    });

    it('should remove mode=dialog', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker mode="dialog" labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should add mode=dialog', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker labelVisibility='false'></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker mode="dialog"></igx-date-picker>
    `
        );
    });

    it('should remove label property and add it as a child elem', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker label="toRemove" mode="dialog"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker  mode="dialog">
<label igxLabel>toRemove</label></igx-date-picker>
    `
        );
    });

    it('should remove label property and add it as a child elem (interpolation)', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [label]="boundLabel" mode="dialog"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker  mode="dialog">
<label igxLabel>{{boundLabel}}</label></igx-date-picker>
    `
        );
    });

    it('should remove label and labelVisibility properties and add it as a child elem (interpolation) with ngIf', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [label]="boundLabel" mode="dialog" [labelVisibility]="labelVisibility"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker  mode="dialog">
<label igxLabel *ngIf="labelVisibility">{{boundLabel}}</label></igx-date-picker>
    `
        );
    });

    it('should not add default label if there is already such', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker mode="dialog"><label igxLabel>text</label></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker mode="dialog"><label igxLabel>text</label></igx-date-picker>
    `
        );
    });

    // igxTimePicker
    it('should remove [mode]=dropdown and add default time label', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [mode]="'dropdown'"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker >
<label igxLabel>Time</label></igx-time-picker>
    `
        );
    });

    it('should remove mode=dropdown', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker mode="dropdown" labelVisibility="false"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker></igx-time-picker>
    `
        );
    });

    it('should not remove [mode]=dialog', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [mode]="'dialog'" labelVisibility="false"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker [mode]="'dialog'"></igx-time-picker>
    `
        );
    });

    it('should remove mode=dialog', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker mode="dialog" labelVisibility="false"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should add mode=dialog', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker labelVisibility="true"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker mode="dialog"></igx-time-picker>
    `
        );
    });

    it('should remove label property and add it as a child elem', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker mode="dialog" label="toRemove"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker mode="dialog" >
<label igxLabel>toRemove</label></igx-time-picker>
    `
        );
    });

    it('should remove label property and add it as a child elem (interpolation)', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [label]="boundLabel" mode="dialog"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker  mode="dialog">
<label igxLabel>{{boundLabel}}</label></igx-time-picker>
    `
        );
    });

    it('should remove label and labelVisibility properties and add it as a child elem (interpolation) with ngIf', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [label]="boundLabel" mode="dialog" [labelVisibility]="labelVisibility"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker  mode="dialog">
<label igxLabel *ngIf="labelVisibility">{{boundLabel}}</label></igx-time-picker>
    `
        );
    });

    it('should not add default label if there is already such', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker mode="dialog"><label igxLabel>text</label></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker mode="dialog"><label igxLabel>text</label></igx-time-picker>
    `
        );
    });

    it('should rename InteractionMode to PickerInteractionMode', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component } from '@angular/core';
import { InteractionMode } from 'igniteui-angular';

@Component({
    selector: 'pickers-mode',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class PickerModeComponent {
    public mode: InteractionMode = InteractionMode.DropDown;
}
`);

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        const expectedContent = `import { Component } from '@angular/core';
import { PickerInteractionMode } from 'igniteui-angular';

@Component({
    selector: 'pickers-mode',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class PickerModeComponent {
    public mode: PickerInteractionMode = PickerInteractionMode.DropDown;
}
`;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('Should update row component types with RowType', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/rows.component.ts', `
import { IgxGridComponent, IgxGridRowComponent, IgxHierarchicalRowComponent,
    IgxTreeGridRowComponent, IgxGridGroupByRowComponent, RowPinningPosition } from 'igniteui-angular';
export class HGridMultiRowDragComponent {
    public onDropAllowed(args: IDropDroppedEventArgs)
        const hierRow: IgxHierarchicalRowComponent = args.dragData;
        const row: IgxGridRowComponent = args.dragData;
        const treeRow: IgxTreeGridRowComponent = args.dragData;
        const groupByRow: IgxGridGroupByRowComponent = args.dragData;
        const children = (cell.row as IgxTreeGridRowComponent).children;
    }
    public ngOnInit() {
        const hierRow: this.hierGrid1.getRowByIndex(0) as IgxHierarchicalRowComponent;
        const row: this.grid1.getRowByIndex(0) as IgxGridRowComponent;
        const treeRow: this.treeGrid1.getRowByIndex(0) as IgxTreeGridRowComponent;
        const hierRowComp: this.hierGrid1.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
        const rowComp: this.grid1.gridAPI.get_row_by_index(0) as IgxGridRowComponent;
        const treeRowComp: this.gridAPI.get_row_by_index(0) as IgxTreeGridRowComponent;
    }
}`);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/rows.component.ts'))
            .toEqual(`
import { IgxGridComponent, RowType,
    RowPinningPosition } from 'igniteui-angular';
export class HGridMultiRowDragComponent {
    public onDropAllowed(args: IDropDroppedEventArgs)
        const hierRow: RowType = args.dragData;
        const row: RowType = args.dragData;
        const treeRow: RowType = args.dragData;
        const groupByRow: RowType = args.dragData;
        const children = (cell.row as RowType).children;
    }
    public ngOnInit() {
        const hierRow: this.hierGrid1.getRowByIndex(0) as RowType;
        const row: this.grid1.getRowByIndex(0) as RowType;
        const treeRow: this.treeGrid1.getRowByIndex(0) as RowType;
        const hierRowComp: this.hierGrid1.gridAPI.get_row_by_index(0) as RowType;
        const rowComp: this.grid1.gridAPI.get_row_by_index(0) as RowType;
        const treeRowComp: this.gridAPI.get_row_by_index(0) as RowType;
    }
}`);
    });

    it('should replace output names in toast', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-toast (showing)="method()" (shown)="method()" (hiding)="method()" (hidden)="method()"></igx-toast>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-toast (onOpening)="method()" (onOpened)="method()" (onClosing)="method()" (onClosed)="method()"></igx-toast>
    `
        );
    });

    it('Should update toast output subscriptions', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/toast.component.ts', `
import { IgxToastComponent } from 'igniteui-angular';
import { Component, OnInit, ViewChild } from '@angular/core';
export class SimpleComponent {
    @ViewChild('toast', { static: true })
    public toast: IgxToastComponent;

    public ngOnInit() {
        this.toast.showing.subscribe();
        this.toast.shown.subscribe();
        this.toast.hiding.subscribe();
        this.toast.hidden.subscribe();
        this.toast.show();
        this.toast.hide();
    }
}`);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: true }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/toast.component.ts'))
            .toEqual(`
import { IgxToastComponent } from 'igniteui-angular';
import { Component, OnInit, ViewChild } from '@angular/core';
export class SimpleComponent {
    @ViewChild('toast', { static: true })
    public toast: IgxToastComponent;

    public ngOnInit() {
        this.toast.onOpening.subscribe();
        this.toast.onOpened.subscribe();
        this.toast.onClosing.subscribe();
        this.toast.onClosed.subscribe();
        this.toast.open();
        this.toast.close();
    }
}`);
    });

    it('should rename DataType to GridColumnDataType', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
        import { IgxColumnComponent, DataType } from 'igniteui-angular';

        @Component({
            selector: 'column-dataType',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class ColumnDataType {
            public dataType: DataType = DataType.Boolean;
        }
        `);
        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
        import { IgxColumnComponent, GridColumnDataType } from 'igniteui-angular';

        @Component({
            selector: 'column-dataType',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class ColumnDataType {
            public dataType: GridColumnDataType = GridColumnDataType.Boolean;
        }
        `;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('Should move input-group disabled property to input child', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-input-group [disabled]="true">
        <input igxInput [(ngModel)]="name">
    </igx-input-group>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-input-group>
        <input igxInput [(ngModel)]="name" [disabled]="true">
    </igx-input-group>
    `
        );
    });

    it('Should move input-group disabled property to input child', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-input-group [disabled]="true">
        <input igxInput [(ngModel)]="name">
    </igx-input-group>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-input-group>
        <input igxInput [(ngModel)]="name" [disabled]="true">
    </igx-input-group>
    `
        );
    });

    it('Should move input group disabled property w/ XHTML syntax closing', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-input-group [disabled]="true">
        <input igxInput [(ngModel)]="name"/>
    </igx-input-group>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-input-group>
        <input igxInput [(ngModel)]="name" [disabled]="true"/>
    </igx-input-group>
    `
        );
    });

    it('Should only move input-group disabled to igxInput directive', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-input-group [disabled]="true">
        <input [(ngModel)]="name">
    </igx-input-group>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-input-group>
        <input [(ngModel)]="name">
    </igx-input-group>
    `
        );
    });

    it('Should move input-group disabled string values to underlying igxInput', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-input-group disabled="true">
        <input igxInput [(ngModel)]="name">
    </igx-input-group>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-input-group>
        <input igxInput [(ngModel)]="name" disabled="true">
    </igx-input-group>
    `
        );
    });

    it('Should move disabled attribute w/ no value to igxInput', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-input-group disabled>
        <input igxInput [(ngModel)]="name">
    </igx-input-group>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);
        // this is the expected output
        // putting just the disabled attribute on an igx-input-group is an invalid scenario
        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-input-group disabled>
        <input igxInput [(ngModel)]="name" disabled>
    </igx-input-group>
    `
        );
    });

    it('Should not add duplicate disabled to igxInput when moving the property from input-group', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-input-group [disabled]="true">
        <input igxInput [(ngModel)]="name" disabled>
    </igx-input-group>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);
        // this is the expected output
        // putting just the disabled attribute on an igx-input-group is an invalid scenario
        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-input-group>
        <input igxInput [(ngModel)]="name" disabled>
    </igx-input-group>
    `
        );
    });

    it('Should move disabled input group to textarea w/ igxInput', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-input-group [disabled]="true">
        <textarea igxInput [(ngModel)]="name">Some Text</textarea>
    </igx-input-group>
    `
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);
        // this is the expected output
        // putting just the disabled attribute on an igx-input-group is an invalid scenario
        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-input-group>
        <textarea igxInput [(ngModel)]="name" [disabled]="true">Some Text</textarea>
    </igx-input-group>
    `
        );
    });

    it('Should properly rename InteractionMode to PickerInteractionMode', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
            `
        import { InteractionMode } from 'igniteui-angular';
        export class MyClass {
            public interactionMode: InteractionMode = InteractionMode.Dialog;
        }
        `);

        const tree = await schematicRunner
            .runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
            `
        import { PickerInteractionMode } from 'igniteui-angular';
        export class MyClass {
            public interactionMode: PickerInteractionMode = PickerInteractionMode.Dialog;
        }
        `
        );
    });
});
