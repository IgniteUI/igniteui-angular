import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '12.0.0';

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

    const migrationName = 'migration-20';
    // eslint-disable-next-line max-len
    const noteText = `<!--NOTE: This component has been updated by Infragistics migration: v${version}\nPlease check your template whether all bindings/event handlers are correct.-->`;

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
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
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

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
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

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

    // IgxTabs
    it('Should update igx-tab-group to igx-tab-item', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs type="contentFit" [selectedIndex]="0">
<igx-tabs-group label="Tab1" icon="home">
    <div>Some Content</div>
</igx-tabs-group>
</igx-tabs>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-tabs [selectedIndex]="0" tabAlignment="start">
<igx-tab-item>
<igx-tab-header>
<igx-icon igxTabHeaderIcon>home</igx-icon>
<span igxTabHeaderLabel>Tab1</span>
</igx-tab-header>
<igx-tab-content>
    <div>Some Content</div>
</igx-tab-content>
</igx-tab-item>
</igx-tabs>`);
    });

    it('Should insert routerLink to igx-tab-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs type="fixed">
<igx-tab-item label="Tab1" icon="folder" routerLink="view1" [isSelected]="true">
</igx-tab-item>
</igx-tabs>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-tabs tabAlignment="justify">
<igx-tab-item [selected]="true">
<igx-tab-header routerLink="view1">
<igx-icon igxTabHeaderIcon>folder</igx-icon>
<span igxTabHeaderLabel>Tab1</span>
</igx-tab-header>
</igx-tab-item>
</igx-tabs>`);
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
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

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
<igx-tab-panel label="Tab1" icon="folder" [isSelected]="true">
Some Content
</igx-tab-panel>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-bottom-nav>
<igx-bottom-nav-item [selected]="true">
<igx-bottom-nav-header>
<igx-icon igxBottomNavHeaderIcon>folder</igx-icon>
<span igxBottomNavHeaderLabel>Tab1</span>
</igx-bottom-nav-header>
<igx-bottom-nav-content>
Some Content
</igx-bottom-nav-content>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
    });

    it('Should insert routerLink to igx-bottom-nav-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-bottom-nav>
<igx-tab label="Tab1" icon="folder" routerLink="view1">
</igx-tab>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-bottom-nav>
<igx-bottom-nav-item>
<igx-bottom-nav-header routerLink="view1">
<igx-icon igxBottomNavHeaderIcon>folder</igx-icon>
<span igxBottomNavHeaderLabel>Tab1</span>
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
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

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

    // IgxDateTimeEditor
    it('should update isSpinLoop', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <input igxDateTimeEditorDirective [isSpinLoop]="true"/>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

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
    <input igxDateTimeEditorDirective (onValueChange)="change()"/>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <input igxDateTimeEditorDirective (valueChange)="change()"/>
    `
        );
    });

    // IgxDatePicker
    it('should update onSelection', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onSelection)="change()"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (valueChange)="change()"></igx-date-picker>
    `
        );
    });

    it('should update onClosing', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onClosing)="close()"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (closing)="close()"></igx-date-picker>
    `
        );
    });

    it('should update onClosed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onClosed)="close()"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (closed)="close()"></igx-date-picker>
    `
        );
    });

    it('should update onOpening', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onOpening)="open()"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (opening)="open()"></igx-date-picker>
    `
        );
    });

    it('should update onOpened', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onOpened)="open()"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (opened)="open()"></igx-date-picker>
    `
        );
    });

    it('should update onValidationFailed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onValidationFailed)="fail()"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker (validationFailed)="fail()"></igx-date-picker>
    `
        );
    });

    it('should remove onDisabledDate', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker (onDisabledDate)="disable()"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker></igx-date-picker>
    `
        );
    });

    it('should update editorTabIndex', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [editorTabIndex]="1"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [tabIndex]="1"></igx-date-picker>
    `
        );
    });

    it('should remove formatter', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [formatter]="formatter()"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker></igx-date-picker>
    `
        );
    });

    it('should remove labelVisibility', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [labelVisibility]="true"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker></igx-date-picker>
    `
        );
    });

    it('should update mask', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [mask]="string"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [inputFormat]="string"></igx-date-picker>
    `
        );
    });

    it('should update format', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [format]="string"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [inputFormat]="string"></igx-date-picker>
    `
        );
    });

    it('should update displayData', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [displayData]="string"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [displayFormat]="string"></igx-date-picker>
    `
        );
    });

    it('should update monthsViewNumber', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [monthsViewNumber]="3"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [displayMonthsCount]="3"></igx-date-picker>
    `
        );
    });

    it('should update vertical', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [vertical]="true"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [headerOrientation]="true"></igx-date-picker>
    `
        );
    });

    it('should update dropDownOverlaySettings', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [dropDownOverlaySettings]="settings"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [overlaySettings]="settings"></igx-date-picker>
    `
        );
    });

    it('should update modalOverlaySettings', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-picker [modalOverlaySettings]="settings"></igx-date-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-picker [overlaySettings]="settings"></igx-date-picker>
    `
        );
    });

    // IgxTimePicker
    it('should update onValueChanged', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onValueChanged)="change()"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (valueChange)="change()"></igx-time-picker>
    `
        );
    });

    it('should update onClosing', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onClosing)="close()"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (closing)="close()"></igx-time-picker>
    `
        );
    });

    it('should update onClosed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onClosed)="close()"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (closed)="close()"></igx-time-picker>
    `
        );
    });

    it('should update onOpening', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onOpening)="open()"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (opening)="open()"></igx-time-picker>
    `
        );
    });

    it('should update onOpened', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onOpened)="open()"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (opened)="open()"></igx-time-picker>
    `
        );
    });

    it('should update onValidationFailed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker (onValidationFailed)="fail()"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker (validationFailed)="fail()"></igx-time-picker>
    `
        );
    });

    it('should update isSpinLoop', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [isSpinLoop]="true"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker [spinLoop]="true"></igx-time-picker>
    `
        );
    });

    it('should update vertical', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [vertical]="true"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker [headerOrientation]="true"></igx-time-picker>
    `
        );
    });

    it('should update format', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-time-picker [format]="string"></igx-time-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-time-picker [inputFormat]="string"></igx-time-picker>
    `
        );
    });

    // IgxDateRangePicker
    it('should update rangeSelected', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (rangeSelected)="change()"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (valueChange)="change()"></igx-date-range-picker>
    `
        );
    });

    it('should update onClosing', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (onClosing)="close()"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (closing)="close()"></igx-date-range-picker>
    `
        );
    });

    it('should update onClosed', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (onClosed)="close()"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (closed)="close()"></igx-date-range-picker>
    `
        );
    });

    it('should update onOpening', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (onOpening)="open()"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (opening)="open()"></igx-date-range-picker>
    `
        );
    });

    it('should update onOpened', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
    <igx-date-range-picker (onOpened)="open()"></igx-date-range-picker>
    `
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker (opened)="open()"></igx-date-range-picker>
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
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
    <igx-date-range-picker [displayMonthsCount]="3"></igx-date-range-picker>
    `
        );
    });
});
