import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '18.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    const configJson = {
        projects: {
            testProj: {
                root: '/',
                sourceRoot: '/testSrc',
                architect: {
                    build: {
                        options: {
                            styles: [
                                "/testSrc/styles.scss"
                            ] as (string | object)[]
                        }
                    }
                }
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    beforeEach(() => {
        appTree = setupTestTree(configJson);
        appTree.create('/testSrc/styles.scss', `
@use "mockStyles.scss";
@forward something;
`);
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

    it('should remove displayDensity property from igx-action-strip and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-action-strip [displayDensity]="'compact'">
        </igx-action-strip>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-action-strip [style.--ig-size]="'var(--ig-size-small)'">
        </igx-action-strip>`);
    });

    it('should remove displayDensity property from igx-buttongroup and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-buttongroup [displayDensity]="'compact'">
        </igx-buttongroup>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-buttongroup [style.--ig-size]="'var(--ig-size-small)'">
        </igx-buttongroup>`);
    });

    it('should remove displayDensity property from igx-chip and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-chip [displayDensity]="'compact'">
        </igx-chip>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-chip [style.--ig-size]="'var(--ig-size-small)'">
        </igx-chip>`);
    });

    it('should remove displayDensity property from igx-combo and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-combo displayDensity="compact">
        </igx-combo>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-combo [style.--ig-size]="'var(--ig-size-small)'">
        </igx-combo>`);
    });

    it('should remove displayDensity property from igx-date-picker and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-date-picker displayDensity="compact">
        </igx-date-picker>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-date-picker [style.--ig-size]="'var(--ig-size-small)'">
        </igx-date-picker>`);
    });

    it('should remove displayDensity property from igx-button and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-button displayDensity="compact">
        </igx-button>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-button [style.--ig-size]="'var(--ig-size-small)'">
        </igx-button>`);
    });

    it('should remove displayDensity property from igx-drop-down and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-drop-down displayDensity="compact">
        </igx-drop-down>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-drop-down [style.--ig-size]="'var(--ig-size-small)'">
        </igx-drop-down>`);
    });

    it('should remove displayDensity property from igx-select and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-select displayDensity="compact">
        </igx-select>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-select [style.--ig-size]="'var(--ig-size-small)'">
        </igx-select>`);
    });

    it('should remove displayDensity property from igx-input-group and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-input-group displayDensity="compact">
        </igx-input-group>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-input-group [style.--ig-size]="'var(--ig-size-small)'">
        </igx-input-group>`);
    });

    it('should remove displayDensity property from igx-list and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-list displayDensity="compact">
        </igx-list>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-list [style.--ig-size]="'var(--ig-size-small)'">
        </igx-list>`);
    });

    it('should remove displayDensity property from igx-paginator and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-paginator #paginator displayDensity="compact">
        </igx-paginator>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-paginator #paginator [style.--ig-size]="'var(--ig-size-small)'">
        </igx-paginator>`);
    });

    it('should remove displayDensity property from igx-query-builder and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-query-builder displayDensity="compact" #builder>
        </igx-query-builder>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-query-builder #builder [style.--ig-size]="'var(--ig-size-small)'">
        </igx-query-builder>`);
    });

    it('should remove displayDensity property from igx-simple-combo and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-simple-combo displayDensity="compact">
        </igx-simple-combo>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-simple-combo [style.--ig-size]="'var(--ig-size-small)'">
        </igx-simple-combo>`);
    });

    it('should remove displayDensity property from igx-tree and replace it with inline style if its value is not set to a component member', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-tree displayDensity="compact">
        </igx-tree>`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
        .toEqual(`
        <igx-tree [style.--ig-size]="'var(--ig-size-small)'">
        </igx-tree>`);
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

    it('should add default CSS rule to set all components to their previous Large defaults', async () => {
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);
        expect(tree.readContent('/testSrc/styles.scss')).toEqual(
`
@use "mockStyles.scss";
@forward something;
// Specifies large size for all components to match the previous defaults
// This may not be needed for your project. Please consult https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/update-guide for more details.
:root {
    --ig-size: var(--ig-size-large);
}
`
        );
    });

    it('should add default CSS rule to set all components to their previous Large defaults with complex file ref configs', async () => {
        const _configJson = JSON.parse(appTree.readContent('/angular.json'));
        _configJson.projects.testProj.architect.build.options.styles = [{ input: '/testSrc/styles.scss' }];
        appTree.overwrite('/angular.json', JSON.stringify(_configJson));

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);
        expect(tree.readContent('/testSrc/styles.scss')).toEqual(
`
@use "mockStyles.scss";
@forward something;
// Specifies large size for all components to match the previous defaults
// This may not be needed for your project. Please consult https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/update-guide for more details.
:root {
    --ig-size: var(--ig-size-large);
}
`
        );
    });

    it('should not throw when applying default CSS rule with complex file ref configs', async () => {
        const _configJson = JSON.parse(appTree.readContent('/angular.json'));
        _configJson.projects.testProj.architect.build.options.styles = [{ notInput: '/testSrc/styles.scss' }];
        appTree.overwrite('/angular.json', JSON.stringify(_configJson));
        try {
            await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);
        } catch (e) {
            fail(e);
        }
    });

    it('should rename the $active-item-color property to the $icon-selected-color', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-bottom-nav: bottom-nav-theme($active-item-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-bottom-nav: bottom-nav-theme($icon-selected-color: red);`
        );
    });

    it('Should remove references to deprecated `banner` property of `BannerEventArgs`', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/expansion-test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
import { BannerEventArgs, BannerCancelEventArgs } from 'igniteui-angular';

@Component({
selector: 'app-banner-test',
templateUrl: './banner-test.component.html',
styleUrls: ['./banner-test.component.scss']
})
export class BannerTestComponent {

public onBannerOpened(event: BannerCancelEventArgs) {
    console.log(event.banner);
}

public onBannerOpened(event: BannerEventArgs) {
    console.log(event.banner);
}
}`
        );
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);
        const expectedContent =  `import { Component, ViewChild } from '@angular/core';
import { BannerEventArgs, BannerCancelEventArgs } from 'igniteui-angular';

@Component({
selector: 'app-banner-test',
templateUrl: './banner-test.component.html',
styleUrls: ['./banner-test.component.scss']
})
export class BannerTestComponent {

public onBannerOpened(event: BannerCancelEventArgs) {
    console.log(event.owner);
}

public onBannerOpened(event: BannerEventArgs) {
    console.log(event.owner);
}
}`;
        expect(
                tree.readContent('/testSrc/appPrefix/component/expansion-test.component.ts')
            ).toEqual(expectedContent);
    });
});
