import { readFileSync } from 'fs';
import { join } from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import * as tss from 'typescript/lib/tsserverlibrary';
import { serviceContainer } from './project-service-container';

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
 * Internal extension to ensure newly created .ts files are added to the project service
 * or their source cache is updated/invalidated if the name is reused in multiple tests
 */
class IgxUnitTestTree extends UnitTestTree {
    public override create(path: string, content: string | Buffer): void {
        super.create(path, content);
        if (!path.endsWith('.ts') && !path.endsWith('.html')) return;

        const configured = serviceContainer.configured && serviceContainer.projectService.configuredProjects.size;
        if (configured) {
            // rush host update
            serviceContainer.serverHost.host = this;

            const entryPath = tss.server.toNormalizedPath(join(process.cwd(), path))
            const scriptInfo = serviceContainer.projectService?.getOrCreateScriptInfoForNormalizedPath(entryPath, false);
            if (!scriptInfo) {
                return;
            }
            // integrate incoming virtual file in project/program for LS to work:
            const project = serviceContainer.projectService.configuredProjects.values().next().value as tss.server.ConfiguredProject;
            if (!project.containsScriptInfo(scriptInfo)) {
                // add the file to the configured project to prevent tss from creating an inferred project for floating files
                scriptInfo.attachToProject(project);
                // add root in advance for ng LS discovery if two files test.component.ts/html and html is analyzed first
                project.addMissingFileRoot(scriptInfo.fileName);
            } else {
                // if using same file, force-reload from host for new content
                scriptInfo.reloadFromFile(tss.server.asNormalizedPath(entryPath));
            }
        } else {
            // strip leading slash as it messes with the resolve and assign as new main entry
            path = path.startsWith('/') ? path.substring(1) : path;
            const config = JSON.parse(this.readContent('angular.json'));
            config.projects.testProj.architect.build.options.browser = path;
            this.overwrite('angular.json', JSON.stringify(config));
        }
    }
}

/**
 * Create the test tree and init the `angular.json` file and `tsconfig.json`
 */
export function setupTestTree(ngConfigOverride: object | null = null) {
    const tree = new IgxUnitTestTree(new EmptyTree());
    tree.create('angular.json', JSON.stringify(ngConfigOverride ?? configJson));
    // mirror tsconfig in test tree, otherwise LS server host handling may be off:
    tree.create('tsconfig.json', tsConfig);
    return tree as UnitTestTree;
}
