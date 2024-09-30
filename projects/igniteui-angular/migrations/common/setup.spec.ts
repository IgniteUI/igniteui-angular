import { readFileSync } from 'fs';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { EmptyTree } from '@angular-devkit/schematics';

const configJson = {
    version: 1,
    projects: {
        testProj: {
            projectType: 'application',
            root: '',
            sourceRoot: 'testSrc',
            architect: {
                build: {
                    builder: '@angular-devkit/build-angular:application',
                    options: {
                        browser: 'testSrc/appPrefix/component/test.component.ts'
                    }
                }
            }
        }
    },
    schematics: {
        '@schematics/angular:component': {
            prefix: 'appPrefix'
        }
    }
};

const tsConfig = readFileSync('tsconfig.json');

/**
 * Create the test tree and init the `angular.json` file and `tsconfig.json`
 */
export function setupTestTree(ngConfigOverride: object | null = null) {
    const tree = new UnitTestTree(new EmptyTree());
    tree.create('angular.json', JSON.stringify(ngConfigOverride ?? configJson));
    // mirror tsconfig in test tree, otherwise LS server host handling may be off:
    tree.create('tsconfig.json', tsConfig);
    return tree;
}
