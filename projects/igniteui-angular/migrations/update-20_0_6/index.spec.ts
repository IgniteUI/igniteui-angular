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

    it('should remove line when filteringOptions.filterable is set to true', async () => {
        const input = `this.igxSimpleCombo.filteringOptions.filterable = true;`;
        appTree.create(makeScript('tsRemoveTrue'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsRemoveTrue'));

        expect(output).not.toContain('filteringOptions.filterable');
    });

    it('should replace filteringOptions.filterable = false with disableFiltering = true', async () => {
        const input = `this.igxSimpleCombo.filteringOptions.filterable = false;`;
        appTree.create(makeScript('tsReplaceFalse'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsReplaceFalse'));

        expect(output).toContain('this.igxSimpleCombo.disableFiltering = true;');
    });

    it('should handle the use of negative flag correctly', async () => {
        const input = `this.igxSimpleCombo.filteringOptions.filterable = !this.disableFilteringFlag;`;
        appTree.create(makeScript('tsNegativeFlag'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsNegativeFlag'));

        expect(output).toContain('this.igxSimpleCombo.disableFiltering = this.disableFilteringFlag;');
    });

    it('should handle the use of possitive flag correctly', async () => {
        const input = `this.igxSimpleCombo.filteringOptions.filterable = this.disableFilteringFlag;`;
        appTree.create(makeScript('tsNegativeFlag'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsNegativeFlag'));

        expect(output).toContain('this.igxSimpleCombo.disableFiltering = !this.disableFilteringFlag;');
    });

    it('should split filteringOptions object and move filterable out', async () => {
        const input = `this.igxSimpleCombo.filteringOptions = { filterable: false, caseSensitive: true };`;
        appTree.create(makeScript('tsSplitObj'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsSplitObj'));

        expect(output).toContain('this.igxSimpleCombo.disableFiltering = true;');
        expect(output).toContain('this.igxSimpleCombo.filteringOptions = { caseSensitive: true };');
        expect(output).not.toContain('filterable');
    });

    it('should not add disableFiltering again if already present when filterable is set to false', async () => {
        const input = `
            this.igxCombo.filteringOptions.filterable = false;
            this.igxCombo.disableFiltering = true;
        `;
        appTree.create(makeScript('tsDirectFalseExistingDisable'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsDirectFalseExistingDisable'));

        const occurrences = (output.match(/\.disableFiltering/g) || []).length;

        expect(occurrences).toBe(1);
        expect(output).not.toContain('filterable');
    });

    it('should not add disableFiltering again if already present when using negative flag assignment', async () => {
        const input = `
            this.igxSimpleCombo.filteringOptions.filterable = !this.flag;
            this.igxSimpleCombo.disableFiltering = this.flag;
        `;
        appTree.create(makeScript('tsNegativeFlagExistingDisable'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsNegativeFlagExistingDisable'));

        const occurrences = (output.match(/\.disableFiltering/g) || []).length;

        expect(occurrences).toBe(1);
        expect(output).not.toContain('filterable');
    });

    it('should not add disableFiltering again if already present when using positive flag assignment', async () => {
        const input = `
            this.igxSimpleCombo.filteringOptions.filterable = this.flag;
            this.igxSimpleCombo.disableFiltering = !this.flag;
        `;
        appTree.create(makeScript('tsPositiveFlagExistingDisable'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsPositiveFlagExistingDisable'));

        const occurrences = (output.match(/\.disableFiltering/g) || []).length;

        expect(occurrences).toBe(1);
        expect(output).not.toContain('filterable');
    });

    it('should split filteringOptions object and remove filterable if disableFiltering is already present', async () => {
        const input = `
            this.igxCombo.filteringOptions = { filterable: false, caseSensitive: true };
            this.igxCombo.disableFiltering = true;
        `;
        appTree.create(makeScript('tsSplitObjAndDisabledFiltering'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsSplitObjAndDisabledFiltering'));

        const occurrences = (output.match(/\.disableFiltering/g) || []).length;

        expect(occurrences).toBe(1);
        expect(output).toContain('this.igxCombo.filteringOptions = { caseSensitive: true };');
        expect(output).not.toContain('filterable');
    });

    it('should insert warning comment when filteringOptions is assigned from a variable', async () => {
        const input = `this.igxSimpleCombo.filteringOptions = filterOpts;`;
        const expectedComment = "// Manual migration needed: please use 'disableFiltering' instead of filteringOptions.filterable." +
            "Since it has been deprecated.'";

        appTree.create(makeScript('tsVariableAssign'), input);

        const tree = await runner.runSchematic(migrationName, {}, appTree);
        const output = tree.readContent(makeScript('tsVariableAssign'));

        expect(output).toContain(input);
        expect(output).toContain(expectedComment);
    });
});
