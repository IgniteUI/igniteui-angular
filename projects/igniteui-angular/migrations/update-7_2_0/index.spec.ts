import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { workspaces } from '@angular-devkit/core';

import * as addNormalize from '../../schematics/ng-add/add-normalize';
import { setupTestTree } from '../common/setup.spec';

describe('Update 7.2.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it(`should replace **ONLY** 'isSelected' and 'isFocused'`, async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html',
            `<igx-drop-down #myDropDown>
                <igx-drop-down-item
                    isSelected="something"
                    isFocused="isSelected"
                >1
                </igx-drop-down-item>
                <igx-drop-down-item
                    [isSelected]="something2"
                    [isFocused]="isFocused == 2"
                >2
                </igx-drop-down-item>
                <igx-drop-down-item
                    [ isSelected ]="something3"
                    [ isFocused ]=" isFocused === '7'"
                >3
                </igx-drop-down-item>
                <igx-drop-down-item
                    [isSelected]="something3"
                    [isFocused]="isFocused === '7'"
                    myCustomDirective [myCustomItem_isSelected]="true"
                >4
                </igx-drop-down-item>
            </igx-drop-down>`);

        const tree = await schematicRunner.runSchematic('migration-08', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(
                `<igx-drop-down #myDropDown>
                <igx-drop-down-item
                    selected="something"
                    focused="isSelected"
                >1
                </igx-drop-down-item>
                <igx-drop-down-item
                    [selected]="something2"
                    [focused]="isFocused == 2"
                >2
                </igx-drop-down-item>
                <igx-drop-down-item
                    [ selected ]="something3"
                    [ focused ]=" isFocused === '7'"
                >3
                </igx-drop-down-item>
                <igx-drop-down-item
                    [selected]="something3"
                    [focused]="isFocused === '7'"
                    myCustomDirective [myCustomItem_isSelected]="true"
                >4
                </igx-drop-down-item>
            </igx-drop-down>`);

    });

    it(`should add minireset css package and import`, async () => {
        appTree.create('/testSrc/styles.scss', '');
        appTree.create('package.json', '{}');
        spyOn(addNormalize, 'addResetCss').and.callThrough();
        const tree = await schematicRunner.runSchematic('migration-08', {}, appTree);

        expect(addNormalize.addResetCss).toHaveBeenCalledWith(
            jasmine.objectContaining<workspaces.WorkspaceDefinition>({
                extensions: jasmine.anything(),
                projects: jasmine.anything()
            }), appTree);
        expect(tree.readContent('/testSrc/styles.scss')).toContain(addNormalize.scssImport);
        expect(JSON.parse(tree.readContent('package.json'))).toEqual({
            dependencies: { 'minireset.css': '~0.0.4' }
        });
        expect(schematicRunner.tasks).toContain(new NodePackageInstallTask().toConfiguration());
    });
});
