import type { Tree } from '@angular-devkit/schematics';
import { workspaces } from '@angular-devkit/core';

// from '@schematics/angular/utility/workspace-models'
export enum ProjectType {
    Application = 'application',
    Library = 'library'
}

export const createHost = (tree: Tree): workspaces.WorkspaceHost => ({
    readFile: async (path: string): Promise<string> => {
        const data = tree.read(path);
        // can use fileBufferToString
        return data?.toString();
    },
    writeFile: async (path: string, data: string): Promise<void> => {
        tree.overwrite(path, data);
    },

    isDirectory: async (path: string): Promise<boolean> =>
        !tree.exists(path) && tree.getDir(path).subfiles.length > 0,

    isFile: async (path: string): Promise<boolean> => tree.exists(path)
});
