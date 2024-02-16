import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '17.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    const configJson = {
        projects: {
            testProj: {
                root: '/',
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    const migrationName = 'migration-33';

    it('should rename raised to contained type in all components with igxButton="raised"', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <button type="button" igxButton="raised">
            Read More
        </button>
        <span igxButton="raised">
            Go Back
        </span>
        <div igxButton="raised">
            Button
        </div>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <button type="button" igxButton="contained">
            Read More
        </button>
        <span igxButton="contained">
            Go Back
        </span>
        <div igxButton="contained">
            Button
        </div>
        `
        );
    });

    it('should not rename outlined and flat type buttons', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <button type="button" igxButton="flat">
            Flat Button
        </button>
        <button type="button" igxButton="outlined">
            Outlined Button
        </button>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <button type="button" igxButton="flat">
            Flat Button
        </button>
        <button type="button" igxButton="outlined">
            Outlined Button
        </button>
        `
        );
    });

    it('should replace buttons of icon type with icon buttons of flat type ', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <button igxButton="icon">
            <igx-icon family="fa" name="fa-home"></igx-icon>
        </button>
        <span igxRipple igxButton="icon">
            <igx-icon>favorite</igx-icon>
        </span>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <button igxIconButton="flat">
            <igx-icon family="fa" name="fa-home"></igx-icon>
        </button>
        <span igxRipple igxIconButton="flat">
            <igx-icon>favorite</igx-icon>
        </span>
        `
        );
    });

    it('should rename the $header-text-color property to the $header-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($header-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($header-foreground: red);`
        );
    });

    it('should rename the $picker-text-color property to the $picker-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($picker-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($picker-foreground: red);`
        );
    });

    it('should rename the $picker-text-hover-color property to the $picker-hover-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($picker-text-hover-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($picker-hover-foreground: red);`
        );
    });

    it('should rename the $picker-arrow-color property to the $month-nav-arrow-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($picker-arrow-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($month-nav-arrow-color: red);`
        );
    });

    it('should rename the $picker-arrow-hover-color property to the $month-nav-arrow-hover-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($picker-arrow-hover-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($month-nav-arrow-hover-color: red);`
        );
    });

    it('should rename the $inactive-text-color property to the $inactive-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($inactive-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($inactive-color: red);`
        );
    });

    it('should rename the $weekend-text-color property to the $weekend-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($weekend-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($weekend-color: red);`
        );
    });

    it('should rename the $year-current-text-color property to the $year-current-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($year-current-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($year-current-foreground: red);`
        );
    });

    it('should rename the $year-hover-text-color property to the $year-hover-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($year-hover-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($year-hover-foreground: red);`
        );
    });

    it('should rename the $month-hover-text-color property to the $month-hover-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($month-hover-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($month-hover-foreground: red);`
        );
    });

    it('should rename the $date-selected-text-color property to the $date-selected-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($date-selected-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($date-selected-foreground: red);`
        );
    });

    it('should rename the $date-current-text-color property to the $date-current-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($date-current-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($date-current-foreground: red);`
        );
    });

    it('should rename the $date-special-text-color property to the $date-special-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($date-special-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($date-special-foreground: red);`
        );
    });

    it('should rename the $date-disabled-text-color property to the $date-disabled-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($date-disabled-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($date-disabled-foreground: red);`

    it('should remove toolbar grid property', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-hierarchical-grid #grid1>
            <igx-grid-toolbar>
                <app-grid-search-box [grid]="grid1"></app-grid-search-box>
            </igx-grid-toolbar>
            <igx-row-island>
                <igx-grid-toolbar [grid]="childGrid" *igxGridToolbar="let childGrid">
                    <igx-grid-toolbar-title>Child toolbar {{ gridRef.parentIsland.level }}</igx-grid-toolbar-title>
                    <igx-grid-toolbar-actions>
                        <igx-grid-toolbar-exporter></igx-grid-toolbar-exporter>
                    </igx-grid-toolbar-actions>
                </igx-grid-toolbar>
            </igx-row-island>
        </igx-hierarchical-grid>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-hierarchical-grid #grid1>
            <igx-grid-toolbar>
                <app-grid-search-box [grid]="grid1"></app-grid-search-box>
            </igx-grid-toolbar>
            <igx-row-island>
                <igx-grid-toolbar *igxGridToolbar="let childGrid">
                    <igx-grid-toolbar-title>Child toolbar {{ gridRef.parentIsland.level }}</igx-grid-toolbar-title>
                    <igx-grid-toolbar-actions>
                        <igx-grid-toolbar-exporter></igx-grid-toolbar-exporter>
                    </igx-grid-toolbar-actions>
                </igx-grid-toolbar>
            </igx-row-island>
        </igx-hierarchical-grid>
        `
        );
    });
});
