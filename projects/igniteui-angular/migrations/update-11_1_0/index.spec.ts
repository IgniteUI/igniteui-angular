import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update to 11.1.0', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
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
    const migrationName = 'migration-19';

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should replace onToggle with collapsedChange ', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/splitter.component.html`,
            `<igx-splitter style='height: 30vh;' [type]='0'>
                <igx-splitter-pane (onToggle)="toggled()">
                </igx-splitter-pane>
            </igx-splitter>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/splitter.component.html'))
            .toEqual(`<igx-splitter style='height: 30vh;' [type]='0'>
                <igx-splitter-pane (collapsedChange)="toggled()">
                </igx-splitter-pane>
            </igx-splitter>`);
    });

    it('should replace onSelect and onUnselect with selected and deselected in igx-buttongroup', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/buttongroup.component.html`,
            `<igx-buttongroup
                (onSelect)="someHandler($event)"
                (onUnselect)="someHandler($event)"
            >
            </igx-buttongroup>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/buttongroup.component.html')).toEqual(
            `<igx-buttongroup
                (selected)="someHandler($event)"
                (deselected)="someHandler($event)"
            >
            </igx-buttongroup>`
        );
    });

    it('should replace onAction with clicked in igx-snackbar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/snackbar.component.html`,
            `<igx-snackbar (onAction)="someHandler($event)"></igx-snackbar>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/snackbar.component.html')).toEqual(
            `<igx-snackbar (clicked)="someHandler($event)"></igx-snackbar>`
        );
    });

    it('should replace onShowing, onShown, onHiding, onHidden with showing, shown, hiding, hidden in igx-toast', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/toast.component.html`,
            `<igx-toast
                (onShowing)="someHandler($event)"
                (onShown)="someHandler($event)"
                (onHiding)="someHandler($event)"
                (onHidden)="someHandler($event)"
            >
            </igx-toast>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/toast.component.html')).toEqual(
            `<igx-toast
                (showing)="someHandler($event)"
                (shown)="someHandler($event)"
                (hiding)="someHandler($event)"
                (hidden)="someHandler($event)"
            >
            </igx-toast>`
        );
    });
});
