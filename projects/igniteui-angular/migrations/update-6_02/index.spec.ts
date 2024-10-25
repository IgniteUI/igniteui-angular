import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 6.0.2', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should update theme import', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `// Import the IgniteUI themes library first` +
            `@import "~igniteui-angular/core/styles/themes/index";` +
            `$company-color: #2ab759; // Some green shade I like` +
            `$secondary-color: #f96a88; // Watermelon pink` +
            `$my-color-palette: igx-palette(` +
            `  $primary: $company-color,` +
            `  $secondary: $secondary-color` +
            `);`
        );
        appTree.create(
            '/testSrc/testSrc/styles.scss',
            `@import "~igniteui-angular/core/styles/themes/_index.scss";`
        );
        const tree = await schematicRunner.runSchematic('migration-03', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `// Import the IgniteUI themes library first` +
            `@import "~igniteui-angular/lib/core/styles/themes/index";` +
            `$company-color: #2ab759; // Some green shade I like` +
            `$secondary-color: #f96a88; // Watermelon pink` +
            `$my-color-palette: igx-palette(` +
            `  $primary: $company-color,` +
            `  $secondary: $secondary-color` +
            `);`
        );
        expect(tree.readContent('/testSrc/testSrc/styles.scss')).toEqual(
            `@import "~igniteui-angular/lib/core/styles/themes/_index.scss";`
        );
    });
});
