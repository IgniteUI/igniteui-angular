import * as tss from 'typescript/lib/tsserverlibrary';
import { createProjectService } from './tsUtils';
import { ServerHost } from './ServerHost';

export class ProjectServiceContainer {
    private _serverHost: ServerHost;
    private _projectService: tss.server.ProjectService;

    /** Indicates additional config adjustments after init have been made */
    public configured = false;

    public get serverHost(): ServerHost {
        if (!this._serverHost) {
            this._serverHost = new ServerHost(null);
        }
        return this._serverHost;
    }

    public get projectService(): tss.server.ProjectService {
        if (!this._projectService) {
            this._projectService = createProjectService(this.serverHost);
        }

        return this._projectService;
    }
}

export const serviceContainer = new ProjectServiceContainer();
