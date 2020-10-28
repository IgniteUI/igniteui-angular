import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update to 11.0.0', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner(
        'ig-migrate',
        path.join(__dirname, '../migration-collection.json')
    );
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc',
            },
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix',
            },
        },
    };
    const migrationName = 'migration-18';

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

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should correctly remove toolbar property and insert toolbar tags', async () => {
        appTree.create(makeTemplate('toolbar'), basicTemplate);

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent(makeTemplate('toolbar'))
        ).toEqual(`<igx-grid>\n<igx-grid-toolbar></igx-grid-toolbar>\nLook, some content</igx-grid>`);
    });

    it('should correctly migrate bound property with ngIf', async () => {
        appTree.create(makeTemplate('toolbar'), bindingTemplate);

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent(makeTemplate('toolbar'))
        ).toEqual(`<igx-grid>\n<igx-grid-toolbar *ngIf="condition"></igx-grid-toolbar>\n</igx-grid>`);
    });

    it('should correctly migrate template directive without messing other templates', async () => {
        appTree.create(makeTemplate('toolbar'), directiveTemplate);

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent(makeTemplate('toolbar')).replace(/\s/g, '')
        ).toEqual(`
<igx-grid>
    <igx-grid-toolbar>
        <div></div>
        <button></button>
    </igx-grid-toolbar>
    <ng-template igxOtherGridDirective>
        Bla Bla Bla
    </ng-template>
</igx-grid>
`.replace(/\s/g, '')
        );
    });
});
