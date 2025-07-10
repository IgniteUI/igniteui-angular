import * as path from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Migration 20.0.6 - Replace filteringOptions.filterable', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner(
        'ig-migrate',
        path.join(__dirname, '../migration-collection.json')
    );
    const migrationName = 'migration-48';
    const makeTemplate = (name: string) => `/testSrc/appPrefix/component/${name}.component.html`;
    const makeScript = (name: string) => `/testSrc/appPrefix/component/${name}.component.ts`;
    const components = ['igx-simple-combo', 'igx-combo'];



    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should replace simple inline filteringOptions.filterable true with default behavior of the simple combo', async () => {
        components.forEach(async component =>{
            const input = `<${component} [filteringOptions]="{ filterable: true }"></${component}>`;
            appTree.create(makeTemplate(`${component}-inline-true`), input);

            const tree = await runner.runSchematic(migrationName, {}, appTree);
            const output = tree.readContent(makeTemplate(`${component}-inline-true`));

            expect(output).not.toContain('[disableFiltering]');
            expect(output).not.toContain('filterable');
        });
    });

    it('should handle mixed object literal correctly', async () => {
        components.forEach(async component =>{
            const input = `<${component} [filteringOptions]="{ filterable: false, caseSensitive: true }"></${component}>`;
            appTree.create(makeTemplate(`${component}-inline2`), input);

            const tree = await runner.runSchematic(migrationName, {}, appTree);
            const output = tree.readContent(makeTemplate(`${component}-inline2`));

            expect(output).toContain(`[disableFiltering]="true"`);
            expect(output).toContain(`[filteringOptions]="{ caseSensitive: true }"`);
        });
    });

    it('should warn on variable reference', async () => {
        components.forEach(async component =>{
            const input = `<${component} [filteringOptions]="filterOpts""></${component}>`;
            const warnMsg = "Manual migration needed: please use 'disableFiltering' instead of filteringOptions.filterable." +
            "Since it has been deprecated.'";

            appTree.create(makeTemplate(`${component}-referenceInTsFile`), input);

            const tree = await runner.runSchematic(migrationName, {}, appTree);
            const output = tree.readContent(makeTemplate(`${component}-referenceInTsFile`));

            expect(output).toContain('[filteringOptions]');
            expect(output).toContain(warnMsg);
        });
    });

    it('should skip adding new [disableFiltering] if already present on igx-combo', async () => {
        const input = `<igx-combo [disableFiltering]="true" [filteringOptions]="{ filterable: false }"></igx-combo>`;
        appTree.create(makeTemplate('combo-has-disableFiltering'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeTemplate('combo-has-disableFiltering'));

        const occurrences = (output.match(/\[disableFiltering\]/g) || []).length;

        expect(occurrences).toBe(1);
        expect(output).not.toContain('filterable');
    });

    // TS file tests

    it('should insert warning comment before `.filteringOptions.filterable = ...` assignment', async () => {
        const input = `this.igxCombo.filteringOptions.filterable = false;`;
        const expectedComment = "// Manual migration needed: please use 'disableFiltering' instead of filteringOptions.filterable." +
            "Since it has been deprecated.'";

        appTree.create(makeScript('tsWarnOnDirectAssignment'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsWarnOnDirectAssignment'));

        expect(output).toContain(expectedComment);
        expect(output).toContain('this.igxCombo.filteringOptions.filterable = false;');
    });

    it('should insert warning comment before `.filteringOptions = { ... }` assignment', async () => {
        const input = `this.igxCombo.filteringOptions = { filterable: false, caseSensitive: true };`;
        const expectedComment = "// Manual migration needed: please use 'disableFiltering' instead of filteringOptions.filterable." +
            "Since it has been deprecated.'";

        appTree.create(makeScript('tsWarnOnObjectAssignment'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsWarnOnObjectAssignment'));

        expect(output).toContain(expectedComment);
        expect(output).toContain('this.igxCombo.filteringOptions = { filterable: false, caseSensitive: true };');
    });
});
