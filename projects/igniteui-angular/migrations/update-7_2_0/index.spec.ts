import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 7.2.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it(`should replace bound 'isSelected' and 'isFocused'`, done => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html',
            `<igx-drop-down #myDropDown>
                <igx-drop-down-item *ngFor="let item of items"
                    [value]="item.value"
                    [isSelected]="item.isSelected"
                    [isFocused]="item.isFocused"
                    [isHeader]="item.thisPropertyIsNOTisSelectedORisFocused"
                >Selected: {{ item.isSelected }}, Focused {{ item.isFocused }}
                </igx-drop-down-item>
            </igx-drop-down>`);

        const tree = schematicRunner.runSchematic('migration-08', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(
                `<igx-drop-down #myDropDown>
                <igx-drop-down-item *ngFor="let item of items"
                    [value]="item.value"
                    [selected]="item.isSelected"
                    [focused]="item.isFocused"
                    [isHeader]="item.thisPropertyIsNOTisSelectedORisFocused"
                >Selected: {{ item.isSelected }}, Focused {{ item.isFocused }}
                </igx-drop-down-item>
            </igx-drop-down>`);

        done();
    });

    it(`should replace 'isSelected' and 'isFocused'`, done => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html',
            `<igx-drop-down #myDropDown>
                <igx-drop-down-item *ngFor="let item of items"
                    [value]="item.value"
                    isSelected="true"
                    isFocused="true"
                    [isHeader]="item.thisPropertyIsNOTisSelectedORisFocused"
                >Selected: {{ item.isSelected }}, Focused {{ item.isFocused }}
                </igx-drop-down-item>
            </igx-drop-down>`);

        const tree = schematicRunner.runSchematic('migration-08', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(
                `<igx-drop-down #myDropDown>
                <igx-drop-down-item *ngFor="let item of items"
                    [value]="item.value"
                    selected="true"
                    focused="true"
                    [isHeader]="item.thisPropertyIsNOTisSelectedORisFocused"
                >Selected: {{ item.isSelected }}, Focused {{ item.isFocused }}
                </igx-drop-down-item>
            </igx-drop-down>`);

        done();
    });

    it(`should replace **ONLY** 'isSelected' and 'isFocused'`, done => {
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

        const tree = schematicRunner.runSchematic('migration-08', {}, appTree);
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

        done();
    });
});
