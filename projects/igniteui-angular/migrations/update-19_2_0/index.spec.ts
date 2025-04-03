import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '19.2.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-45';

    it('should remove igx-caroursel property `keyboardSupport` in template', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-carousel [keyboardSupport]="true"></igx-carousel>
        <igx-carousel [keyboardSupport]="false"></igx-carousel>
        <igx-carousel [keyboardSupport]="myProp"></igx-carousel>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-carousel></igx-carousel>
        <igx-carousel></igx-carousel>
        <igx-carousel></igx-carousel>
        `
        );
    });

    it('should remove the properties related to invalid state from the switch theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$invalid-switch-theme: switch-theme(
                $label-color: orange,
                $label-invalid-color: red,
                $track-error-color: red,
                $thumb-on-error-color: darkred,
                $error-color: red,
                $error-color-hover: darkred,
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$invalid-switch-theme: switch-theme(
                $label-color: orange,
            );`
        );
    });

    it('should remove unused properties from the calendar theme', async () => {
        const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

        appTree.create(
            testFilePath,
            `$calendar-theme: calendar-theme(
                $date-special-current-border-color: orange,
                $date-selected-current-outline: orange,
                $date-selected-current-hover-outline: orange,
                $date-selected-current-focus-outline: orange,
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(testFilePath)).toEqual(
            `$calendar-theme: calendar-theme();`
        );
    });
});
