import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '17.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
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
