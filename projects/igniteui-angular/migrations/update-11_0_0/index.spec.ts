import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update to 11.0.0', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner(
        'ig-migrate',
        path.join(__dirname, '../migration-collection.json')
    );
    const migrationName = 'migration-18';
    const warnMsg = `\n<!-- Auto migrated template content. Please, check your bindings! -->\n`;
    const stripWhitespaceRe = /\s/g;

    const makeTemplate = (name: string) => `/testSrc/appPrefix/component/${name}.component.html`;
    const basicTemplate = `<igx-grid showToolbar="true">Look, some content</igx-grid>`;
    const bindingTemplate = `<igx-grid [showToolbar]="condition"></igx-grid>`;
    const directiveTemplate = `
<igx-grid [showToolbar]="true">
    <ng-template igxToolbarCustomContent let-sampleGrid="grid">
        <div></div>
        <button></button>
    </ng-template>
    <ng-template igxOtherGridDirective>
        Bla Bla Bla
    </ng-template>
</igx-grid>
`;
    const hierachicalBase = `
<igx-hierarchical-grid [showToolbar]="showParentToolbar">
    <igx-column></igx-column>
    <igx-row-island [showToolbar]="showChildToolbar">
        <igx-column></igx-column>
    </igx-row-island>
</igx-hierarchical-grid>
    `;

    const hierachicalBaseTemplate = `
<igx-hierarchical-grid [showToolbar]="showParentToolbar">
    <igx-column></igx-column>
    <igx-row-island [showToolbar]="showChildToolbar">
        <igx-column></igx-column>
        <ng-template igxToolbarCustomContent let-sampleGrid="grid">
            <div igxLabel></div>
            <button></button>
        </ng-template>
        <ng-template igxOtherGridDirective>
            Bla Bla Bla
        </ng-template>
    </igx-row-island>
</igx-hierarchical-grid>
    `;

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should correctly remove toolbar property and insert toolbar tags', async () => {
        appTree.create(makeTemplate('toolbar'), basicTemplate);

        const tree = await runner
            .runSchematic(migrationName, {}, appTree);
        expect(
            tree.readContent(makeTemplate('toolbar'))
        ).toEqual(`<igx-grid>\n<igx-grid-toolbar></igx-grid-toolbar>\nLook, some content</igx-grid>`);
    });

    it('should correctly migrate bound property with ngIf', async () => {
        appTree.create(makeTemplate('toolbar'), bindingTemplate);

        const tree = await runner
            .runSchematic(migrationName, {}, appTree);
        expect(
            tree.readContent(makeTemplate('toolbar'))
        ).toEqual(`<igx-grid>\n<igx-grid-toolbar *ngIf="condition"></igx-grid-toolbar>\n</igx-grid>`);
    });

    it('should correctly migrate template directive without messing other templates', async () => {
        appTree.create(makeTemplate('toolbar'), directiveTemplate);

        const tree = await runner
            .runSchematic(migrationName, {}, appTree);
        expect(
            tree.readContent(makeTemplate('toolbar')).replace(stripWhitespaceRe, '')
        ).toEqual(`
<igx-grid>
    <igx-grid-toolbar>
        ${warnMsg}
        <div></div>
        <button></button>
    </igx-grid-toolbar>
    <ng-template igxOtherGridDirective>
        Bla Bla Bla
    </ng-template>
</igx-grid>
`.replace(stripWhitespaceRe, '')
        );
    });

    it('should correctly migrate hierarchical grid toolbar(s)', async () => {
        appTree.create(makeTemplate('toolbar'), hierachicalBase);

        const tree = await runner
            .runSchematic(migrationName, {}, appTree);
        expect(
            tree.readContent(makeTemplate('toolbar')).replace(stripWhitespaceRe, '')
        ).toEqual(`
<igx-hierarchical-grid>
    <igx-grid-toolbar *ngIf="showParentToolbar"></igx-grid-toolbar>
    <igx-column></igx-column>
    <igx-row-island>
        <igx-grid-toolbar [grid]="childGrid" *igxGridToolbar="let childGrid" *ngIf="showChildToolbar"></igx-grid-toolbar>
        <igx-column></igx-column>
    </igx-row-island>
</igx-hierarchical-grid>
        `.replace(stripWhitespaceRe, ''));
    });

    it('should correctly migrate hierarchical grid toolbar(s) and template directives', async () => {
        appTree.create(makeTemplate('toolbar'), hierachicalBaseTemplate);

        const tree = await runner
            .runSchematic(migrationName, {}, appTree);
        expect(
            tree.readContent(makeTemplate('toolbar')).replace(stripWhitespaceRe, '')
        ).toEqual(`
<igx-hierarchical-grid>
    <igx-grid-toolbar *ngIf="showParentToolbar"></igx-grid-toolbar>
    <igx-column></igx-column>
    <igx-row-island>
        <igx-grid-toolbar [grid]="sampleGrid" *igxGridToolbar="let sampleGrid" *ngIf="showChildToolbar">
            ${warnMsg}
            <div igxLabel></div>
            <button></button>
        </igx-grid-toolbar>
        <igx-column></igx-column>
        <ng-template igxOtherGridDirective>
            Bla Bla Bla
        </ng-template>
    </igx-row-island>
</igx-hierarchical-grid>
        `.replace(stripWhitespaceRe, '')
        );
    });
});
