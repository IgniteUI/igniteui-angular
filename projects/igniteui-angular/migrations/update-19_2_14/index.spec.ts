import * as path from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Migration 19.2.14 - Replace filteringOptions.filterable', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner(
        'ig-migrate',
        path.join(__dirname, '../migration-collection.json')
    );
    const migrationName = 'migration-46';
    const makeTemplate = (name: string) => `/testSrc/appPrefix/component/${name}.component.html`;

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should replace simple inline filteringOptions', async () => {
        const input = `<igx-simple-combo [filteringOptions]="{ filterable: true }"></igx-simple-combo>`;
        appTree.create(makeTemplate('inline1'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeTemplate('inline1'));

        expect(output).toContain(`[disableFiltering]="false"`);
        expect(output).not.toContain('filterable');
    });

    it('should handle mixed object literal correctly', async () => {
        const input = `<igx-simple-combo [filteringOptions]="{ filterable: false, caseSensitive: true }"></igx-simple-combo>`;
        appTree.create(makeTemplate('inline2'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeTemplate('inline2'));

        expect(output).toContain(`[disableFiltering]="true"`);
        expect(output).toContain(`[filteringOptions]="{ caseSensitive: true }"`);
    });

    it('should warn on variable reference', async () => {
        const input = `<igx-simple-combo [filteringOptions]="filterOpts"></igx-simple-combo>`;
        const warnMsg = "Manual migration needed: please use 'disableFiltering' instead of filteringOptions.filterable." +
            "If you were using filteringOptions please include them without 'filterable'";

        appTree.create(makeTemplate('referenceInTsFile'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeTemplate('referenceInTsFile'));

        expect(output).not.toContain('[filteringOptions]');
        expect(output).toContain(warnMsg);
    });
});
