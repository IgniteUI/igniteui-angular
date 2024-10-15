import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '15.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-26';

    it('should replace CSS custom properties prefix from --igx-primary to --ig-primary', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`::ng-deep {
	.custom-body {
		color: var(--igx-primary-500-contrast);
		background: hsla(var(--igx-primary-500));
	}
}`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`::ng-deep {
	.custom-body {
		color: var(--ig-primary-500-contrast);
		background: hsla(var(--ig-primary-500));
	}
}`
        );
    });

    it('should replace CSS custom properties from  -igx-grays to -ig-gray', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`::ng-deep {
	.custom-body {
		color: var(--igx-grays-900);
	}
}`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`::ng-deep {
	.custom-body {
		color: var(--ig-gray-900);
	}
}`
        );
    });

    it('should replace CSS custom properties prefix from --igx-h[number]- to --ig-h[number]-', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`::ng-deep {
	.custom-body {
		font-family: var(--igx-h1-font-family);
		font-size: var(--igx-h3-font-size);
	}
}`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`::ng-deep {
	.custom-body {
		font-family: var(--ig-h1-font-family);
		font-size: var(--ig-h3-font-size);
	}
}`
        );
    });

    it('should NOT replace CSS custom properties prefix for internal variables', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`::ng-deep {
	.custom-body {
		width: var(--igx-icon-size);
	}
}`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`::ng-deep {
	.custom-body {
		width: var(--igx-icon-size);
	}
}`
        );
    });

    it('should remove the $palette prop from component themes', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`@include igniteui.avatar-theme($palette: null);`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`@include igniteui.avatar-theme();`
        );
    });

    it('should remove the $type-scale prop from the type-style mixin', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`@include igniteui.type-style($type-scale: $default-type-scale,$category: 'h1');`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`@include igniteui.type-style($category: 'h1');`
        );
    });

    it('should remove the $wc prop from the typogrpahy mixin', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`@include igniteui.typography($font-family: "Roboto, sans-serif",$wc: true);`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`@include igniteui.typography($font-family: "Roboto, sans-serif");`
        );
    });

    it('should remove the $wc prop from the theme mixin', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`@include igniteui.theme($palette: $my-palette,$wc: true);`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`@include igniteui.theme($palette: $my-palette);`
        );
    });

    it('should remove the $elevations prop from the elevations function and rename $elevation to $name', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`$elevation: igniteui.elevation($elevations: $elevations,$elevation: 2);`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`$elevation: igniteui.elevation($name: 2);`
        );
    });

    it('should remove the $prefix and the $contrast props from the palette-vars mixin and rename it to palette', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`@include igniteui.palette-vars($palette: $my-palette,$contrast: true,$prefix: 'igx');`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`@include igniteui.palette($palette: $my-palette);`
        );
    });

    it('should replace elevation-vars mixin with elevations', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`@include igniteui.elevation-vars($material-elevations);`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`@include igniteui.elevations($material-elevations);`
        );
    });

    it('should rename IgxGridToolbarTitleDirective and IgxGridToolbarActionsDirective', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
        import { IgxGridToolbarTitleDirective, IgxGridToolbarComponent, IgxGridToolbarActionsDirective } from 'igniteui-angular';

        @Component({
            selector: 'test-component',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class TestComponent {
            toolbar: IgxGridToolbarComponent;
            @ViewChild(IgxGridToolbarTitleDirective)
            public title: IgxGridToolbarTitleDirective;
            @ViewChild(IgxGridToolbarActionsDirective)
            public actions: IgxGridToolbarActionsDirective;
        }
        `);
        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
        import { IgxGridToolbarTitleComponent, IgxGridToolbarComponent, IgxGridToolbarActionsComponent } from 'igniteui-angular';

        @Component({
            selector: 'test-component',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class TestComponent {
            toolbar: IgxGridToolbarComponent;
            @ViewChild(IgxGridToolbarTitleComponent)
            public title: IgxGridToolbarTitleComponent;
            @ViewChild(IgxGridToolbarActionsComponent)
            public actions: IgxGridToolbarActionsComponent;
        }
        `;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should remove the disabled property from the igx-radio-group', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
            <igx-radio-group disabled="true"></igx-radio-group>`);
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
            <igx-radio-group></igx-radio-group>`);
    });

    it('should remove the labelPosition property from the igx-radio-group', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
            <igx-radio-group labelPosition="before"></igx-radio-group>`);
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
            <igx-radio-group></igx-radio-group>`);
    });
});
