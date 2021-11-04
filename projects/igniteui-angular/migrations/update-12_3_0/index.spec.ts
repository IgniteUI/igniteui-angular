import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '12.3.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const _schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
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

    const _migrationName = 'migration-22';
    const _lineBreaksAndSpaceRegex = /\s/g;

    it('should rename IgxComboComponent selectItems to select', () => {
        pending('LS must be setup for tests.');
    });

    it('should rename IgxComboComponent deselectItems to deselect', () => {
        pending('LS must be setup for tests.');
    });

    it('should rename IgxComboComponent selectedItems() to selected', () => {
        pending('LS must be setup for tests.');
    });
});
