import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import * as tss from 'typescript/lib/tsserverlibrary';
import { serviceContainer } from './service-container';

/**
 * Hook before _all_ tests to ensure newly created .ts files are added to the project service
 * or their source cache is updated/invalidated if the name is reused in multiple tests
 */
beforeAll(() => {
    const originalCreate = UnitTestTree.prototype.create;
    UnitTestTree.prototype.create = function (path: string, content: Buffer | string) {
        originalCreate.call(this, path, content);
        if (path.endsWith('.ts') && serviceContainer.configured && serviceContainer.projectService.configuredProjects.size) {
            // rush host update
            serviceContainer.serverHost.host = this;

            const entryPath = tss.server.toNormalizedPath(join(process.cwd(), path))
            const scriptInfo = serviceContainer.projectService?.getOrCreateScriptInfoForNormalizedPath(entryPath, false);
            if (!scriptInfo) {
                return;
            }
            // integrate incoming virtual file in project/program for LS to work:
            const project = serviceContainer.projectService.configuredProjects.values().next().value as tss.server.ConfiguredProject;
            if (!project.containsScriptInfo(scriptInfo) /* && this.host.exists() */) {
                // add first to prevent open from creating another project that'll be inferred
                project.addMissingFileRoot(scriptInfo.fileName);
            } else {
                // if using same file, force-reload from host for new content
                scriptInfo.reloadFromFile(tss.server.asNormalizedPath(entryPath));
            }
        }
    }
});
