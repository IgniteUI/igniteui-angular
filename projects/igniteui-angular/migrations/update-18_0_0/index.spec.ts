import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '18.0.0';

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

    const migrationName = 'migration-38';

    it('should remove displayDensity property from igx-grid and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid [data]="data" [displayDensity]="'cosy'" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>
        <igx-grid [data]="data" displayDensity="cosy" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-grid [data]="data" height="300px" width="300px" [style.--ig-size]="'var(--ig-size-medium)'">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>
        <igx-grid [data]="data" height="300px" width="300px" [style.--ig-size]="'var(--ig-size-medium)'">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
    });

    it('should only remove and not replace displayDensity property from igx-grid if it is bound to something different than a value', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid [data]="data" [displayDensity]="density" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-grid [data]="data" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
    });

    it('should remove displayDensity property from igx-tree-grid and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-tree-grid [data]="data" [displayDensity]="'comfortable'" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-tree-grid>
        <igx-tree-grid [data]="data" displayDensity="compact" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-tree-grid>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-tree-grid [data]="data" height="300px" width="300px" [style.--ig-size]="'var(--ig-size-large)'">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-tree-grid>
        <igx-tree-grid [data]="data" height="300px" width="300px" [style.--ig-size]="'var(--ig-size-small)'">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-tree-grid>`);
    });

    it('should remove displayDensity property from igx-pivot-grid and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-pivot-grid [data]="data" [displayDensity]="'comfortable'" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-pivot-grid>
        <igx-pivot-grid [data]="data" displayDensity="compact" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-pivot-grid>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-pivot-grid [data]="data" height="300px" width="300px" [style.--ig-size]="'var(--ig-size-large)'">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-pivot-grid>
        <igx-pivot-grid [data]="data" height="300px" width="300px" [style.--ig-size]="'var(--ig-size-small)'">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-pivot-grid>`);
    });

    it('should remove displayDensity property from igx-hierarchical-grid and igx-row-island and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-hierarchical-grid [data]="data" [displayDensity]="'comfortable'" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
            <igx-row-island [displayDensity]="'comfortable'">
                <igx-column field="Name" header="Athlete"></igx-column>
                <igx-row-island [displayDensity]="'compact'">
                    <igx-column field="Name" header="Athlete"></igx-column>
                <igx-row-island/>
            <igx-row-island/>
        </igx-hierarchical-grid>
        <igx-hierarchical-grid [data]="data" displayDensity="compact" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
            <igx-row-island displayDensity="comfortable">
                <igx-column field="Name" header="Athlete"></igx-column>
                <igx-row-island displayDensity="cosy">
                    <igx-column field="Name" header="Athlete"></igx-column>
                <igx-row-island/>
            <igx-row-island/>
        </igx-hierarchical-grid>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-hierarchical-grid [data]="data" height="300px" width="300px" [style.--ig-size]="'var(--ig-size-large)'">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
            <igx-row-island [style.--ig-size]="'var(--ig-size-large)'">
                <igx-column field="Name" header="Athlete"></igx-column>
                <igx-row-island [style.--ig-size]="'var(--ig-size-small)'">
                    <igx-column field="Name" header="Athlete"></igx-column>
                <igx-row-island/>
            <igx-row-island/>
        </igx-hierarchical-grid>
        <igx-hierarchical-grid [data]="data" height="300px" width="300px" [style.--ig-size]="'var(--ig-size-small)'">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
            <igx-row-island [style.--ig-size]="'var(--ig-size-large)'">
                <igx-column field="Name" header="Athlete"></igx-column>
                <igx-row-island [style.--ig-size]="'var(--ig-size-medium)'">
                    <igx-column field="Name" header="Athlete"></igx-column>
                <igx-row-island/>
            <igx-row-island/>
        </igx-hierarchical-grid>`);
    });
    
    it('should replace PivotGrid property `showPivotConfigurationUI` with `pivotUI`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-pivot-grid [showPivotConfigurationUI]="false"></igx-pivot-grid>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-pivot-grid [pivotUI]="{ showConfiguration: false }"></igx-pivot-grid>
        `
        );
    });

    it('should replace PivotGrid property `showPivotConfigurationUI` with `pivotUI`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-pivot-grid [showPivotConfigurationUI]="testProp"></igx-pivot-grid>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-pivot-grid [pivotUI]="{ showConfiguration: testProp }"></igx-pivot-grid>
        `
        );
    });
});
