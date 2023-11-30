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
});
