import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '17.2.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-35';

    it('should rename the $content-text-color property to the $content-text-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($content-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($content-foreground: red);`
        );
    });

    it('should rename the $month-border-radius property to the $month-year-border-radius', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($month-border-radius: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($month-year-border-radius: red);`
        );
    });

    it('should rename the $month-hover-current-text-color property to the $month-current-hover-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($month-hover-current-text-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($month-current-hover-foreground: red);`
        );
    });

    it('should rename the $label-color property to the $weekday-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($label-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($weekday-color: red);`
        );
    });

    it('should rename the $week-number-color property to the $week-number-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($week-number-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($week-number-foreground: red);`
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

    it('should rename the $picker-background-color property to the $picker-background', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($picker-background-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($picker-background: red);`
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

    it('should rename the $picker-arrow-color property to the $navigation-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($picker-arrow-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($navigation-color: red);`
        );
    });

    it('should rename the $picker-arrow-hover-color property to the $navigation-hover-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($picker-arrow-hover-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($navigation-hover-color: red);`
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

    it('should rename the $date-current-bg-color property to the $date-current-background', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($date-current-bg-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($date-current-background: red);`
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
        );

    });

    it('should rename the $month-current-text-color property to the $month-current-foreground', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-calendar: calendar-theme($month-current-foreground: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-calendar: calendar-theme($month-current-foreground: red);`
        );

    });

    it('should replace calendar property `vertical` with `orientation`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-calendar [vertical]="true"></igx-calendar>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-calendar orientation="vertical"></igx-calendar>
        `
        );
    });
});
