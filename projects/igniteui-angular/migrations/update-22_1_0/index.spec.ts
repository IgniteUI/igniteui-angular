import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '22.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-58';

    it('should replace IgxDividerDirective with IgxDividerComponent in imports', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component } from '@angular/core';
import { IgxDividerDirective } from 'igniteui-angular';

@Component({
    selector: 'test-component',
    template: '<igx-divider></igx-divider>',
    imports: [IgxDividerDirective]
})
export class TestComponent { }
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts')).toEqual(
            `import { Component } from '@angular/core';
import { IgxDividerComponent } from 'igniteui-angular';

@Component({
    selector: 'test-component',
    template: '<igx-divider></igx-divider>',
    imports: [IgxDividerComponent]
})
export class TestComponent { }
`
        );
    });

    it('should leave IgxDividerModule untouched', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.module.ts',
            `import { NgModule } from '@angular/core';
import { IgxDividerModule } from 'igniteui-angular';

@NgModule({
    imports: [IgxDividerModule]
})
export class TestModule { }
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.module.ts')).toEqual(
            `import { NgModule } from '@angular/core';
import { IgxDividerModule } from 'igniteui-angular';

@NgModule({
    imports: [IgxDividerModule]
})
export class TestModule { }
`
        );
    });

    it('should replace a removed component theme mixin with tokens', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `.my-avatar {
    @include avatar(avatar-theme($background: red));
}
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `.my-avatar {
    @include tokens(avatar-theme($background: red));
}
`
        );
    });

    it('should replace a multi-line removed component theme mixin call with tokens', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `@include dialog(
    dialog-theme($schema: $schema)
);
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `@include tokens(
    dialog-theme($schema: $schema)
);
`
        );
    });

    it('should not touch a mixin that was not removed', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `@include button(
    $flat: flat-button-theme($schema: $schema)
);
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `@include button(
    $flat: flat-button-theme($schema: $schema)
);
`
        );
    });

    it('should remove a call to a removed typography mixin', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `.my-dialog {
    @include dialog-typography();
}
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `.my-dialog {
}
`
        );
    });

    it('should remove a multi-line call to a removed typography mixin with arguments', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `@include checkbox-typography(
    $categories: (label: 'body-2')
);
.after {
    color: red;
}
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `.after {
    color: red;
}
`
        );
    });

    it('should remove an aliased call to a removed typography mixin', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `@use 'igniteui-angular/theming' as input;

@include input.input-group-typography();
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `@use 'igniteui-angular/theming' as input;

`
        );
    });

    it('should remove a deep import of a deleted component stylesheet and its component call', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `@use "igniteui-angular/lib/core/styles/components/input/input-group-component" as input;
.input-group-styling {
    @include input.component;
}
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `.input-group-styling {
}
`
        );
    });

    it('should remove multiple deep imports of deleted component stylesheets from a shared layout file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/layout.scss',
            `@use "igniteui-angular/lib/core/styles/components/checkbox/checkbox-component" as checkbox;
@use "igniteui-angular/lib/core/styles/components/radio/radio-component" as radio;
@use "igniteui-angular/lib/core/styles/components/switch/switch-component" as switch;

.styling-sample {
    @include checkbox.component();
    @include radio.component();
    @include switch.component();
}
`
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/layout.scss')).toEqual(
            `
.styling-sample {
}
`
        );
    });
});
