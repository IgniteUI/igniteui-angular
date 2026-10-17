import * as path from 'path';

import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '21.2.2';
const columnActionsThemes = ['column-actions-theme'];
const gridToolbarThemes = ['grid-toolbar-theme'];
const paginatorThemes = ['paginator-theme'];
const testFilePath = '/testSrc/appPrefix/component/test.component.scss';

describe(`Update to ${version}`, () => {
  let appTree: UnitTestTree;
  const schematicRunner = new SchematicTestRunner(
    'ig-migrate',
    path.join(__dirname, '../migration-collection.json')
  );

  beforeEach(() => {
    appTree = setupTestTree();
  });

  const migrationName = 'migration-56';

  columnActionsThemes.forEach((theme) => {
    it(`should rename $background-color to $background in ${theme}`, async () => {
      appTree.create(
        testFilePath,
        `$custom-${theme}: ${theme}($background-color: red);`
      );

      const tree = await schematicRunner.runSchematic(
        migrationName,
        {},
        appTree
      );

      expect(tree.readContent(testFilePath)).toEqual(
        `$custom-${theme}: ${theme}($background: red);`
      );
    });
  });

  gridToolbarThemes.forEach((theme) => {
    it(`should rename $background-color to $background in ${theme}`, async () => {
      appTree.create(
        testFilePath,
        `$custom-${theme}: ${theme}($background-color: red);`
      );

      const tree = await schematicRunner.runSchematic(
        migrationName,
        {},
        appTree
      );

      expect(tree.readContent(testFilePath)).toEqual(
        `$custom-${theme}: ${theme}($background: red);`
      );
    });
  });

  it('should rename --ig-column-actions-background-color CSS variable', async () => {
    appTree.create(
      testFilePath,
      `igx-column-actions { --ig-column-actions-background-color: #fff; }`
    );

    const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

    expect(tree.readContent(testFilePath)).toEqual(
      `igx-column-actions { --ig-column-actions-background: #fff; }`
    );
  });

  it('should rename --ig-grid-toolbar-background-color CSS variable', async () => {
    appTree.create(
      testFilePath,
      `igx-grid-toolbar { --ig-grid-toolbar-background-color: #333; }`
    );

    const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

    expect(tree.readContent(testFilePath)).toEqual(
      `igx-grid-toolbar { --ig-grid-toolbar-background: #333; }`
    );
  });

  it('should rename --ig-grid-filtering-dialog-background to --ig-query-builder-background', async () => {
    appTree.create(
      testFilePath,
      `igx-grid { --ig-grid-filtering-dialog-background: #111; }`
    );

    const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

    expect(tree.readContent(testFilePath)).toEqual(
      `igx-grid { --ig-query-builder-background: #111; }`
    );
  });

  it('should leave unrelated CSS variables unchanged', async () => {
    const original = `igx-grid { --ig-grid-content-background: #fff; }`;
    appTree.create(testFilePath, original);

    const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

    expect(tree.readContent(testFilePath)).toEqual(original);
  });

  paginatorThemes.forEach((theme) => {
    it(`should rename $text-color to $foreground in ${theme}`, async () => {
      appTree.create(
        testFilePath,
        `$custom-${theme}: ${theme}($text-color: red);`
      );

      const tree = await schematicRunner.runSchematic(
        migrationName,
        {},
        appTree
      );

      expect(tree.readContent(testFilePath)).toEqual(
        `$custom-${theme}: ${theme}($foreground: red);`
      );
    });

    it(`should rename $background-color to $background in ${theme}`, async () => {
      appTree.create(
        testFilePath,
        `$custom-${theme}: ${theme}($background-color: blue);`
      );

      const tree = await schematicRunner.runSchematic(
        migrationName,
        {},
        appTree
      );

      expect(tree.readContent(testFilePath)).toEqual(
        `$custom-${theme}: ${theme}($background: blue);`
      );
    });
  });

  it('should rename --ig-paginator-text-color CSS variable', async () => {
    appTree.create(
      testFilePath,
      `igx-paginator { --ig-paginator-text-color: #000; }`
    );

    const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

    expect(tree.readContent(testFilePath)).toEqual(
      `igx-paginator { --ig-paginator-foreground: #000; }`
    );
  });

  it('should rename --ig-paginator-background-color CSS variable', async () => {
    appTree.create(
      testFilePath,
      `igx-paginator { --ig-paginator-background-color: #eee; }`
    );

    const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

    expect(tree.readContent(testFilePath)).toEqual(
      `igx-paginator { --ig-paginator-background: #eee; }`
    );
  });
});
