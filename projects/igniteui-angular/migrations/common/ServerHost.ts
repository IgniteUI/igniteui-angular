import type { Tree } from '@angular-devkit/schematics';
import * as pathFs from 'path';
import * as ts from 'typescript/lib/tsserverlibrary';
import { CUSTOM_TS_PLUGIN_NAME, CUSTOM_TS_PLUGIN_PATH } from './tsUtils';
import { createRequire } from 'module';

/**
 * Language server host is responsible for **most** of the FS operations / checks
 * Angular's Ivy LS sometimes bypasses these, calling path methods instead of tsLsHost operations
 */
export class ServerHost implements ts.server.ServerHost {
    public readonly args: string[];
    public readonly newLine: string;
    public readonly useCaseSensitiveFileNames: boolean;
    /** Cached because Angular schematics encapsulation's customRequire doesn't provide `resolve` */
    private nativeRequire = createRequire(__filename);

    constructor(public host: Tree) {
        this.args = ts.sys.args;
        this.newLine = ts.sys.newLine;
        this.useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
    }

    /**
     * Read a file's content from the Virtual Tree
     * If file does not exist in virtual tree, check in physical FS
     */
    public readFile(path: string, encoding?: BufferEncoding): string | undefined {
        let content;
        // ensure the path is relative, so it can be found in the Tree, reflecting latest state
        path = pathFs.relative(this.getCurrentDirectory(), path);
        try {
            content = this.host.read(path).toString(encoding);
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return content || ts.sys.readFile(path, encoding);
        }
    }

    public getFileSize(path: string): number {
        return ts.sys.getFileSize(path);
    }

    //#region Watchers
    // Atm we do not need to have file or dir watchers that access the actual FS
    // as we are only working with NG's virtual FS
    // Prior to https://github.com/microsoft/TypeScript/pull/49990 we were more or less required
    // to add a watcher since it threw an error otherwise

    public watchFile(_path: string, _callback: ts.FileWatcherCallback, _pollingInterval?: number):
        ts.FileWatcher {
        // return ts.sys.watchFile(path, callback, pollingInterval);
        return { close: () => {} };
    }

    public watchDirectory(_path: string, _callback: ts.DirectoryWatcherCallback, _recursive?: boolean):
        ts.FileWatcher {
        // return ts.sys.watchDirectory(path, callback, recursive);
        return { close: () => {} };
    }
    //#endregion

    public resolvePath(path: string): string {
        return ts.sys.resolvePath(path);
    }

    /**
     * Checks for file in Virtual Tree w/ relative path
     * If file does not exist in virtual tree, check in physical FS
     */
    public fileExists(path: string): boolean {
        // check for file in Tree, as schematics might need for check
        path = pathFs.relative(this.getCurrentDirectory(), path);
        let flag = false;
        try {
            // Tree.exists throws on invalid paths instead of returning false
            flag = this.host.exists(path);
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return flag || ts.sys.fileExists(path);
        }
    }

    public directoryExists(path: string): boolean {
        let exists: boolean;
        path = pathFs.relative(this.getCurrentDirectory(), path);
        try {
            exists = this.host.getDir(path) !== void 0;
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return exists || ts.sys.directoryExists(path);
        }
    }

    public getExecutingFilePath(): string {
        return ts.sys.getExecutingFilePath();
    }

    public getCurrentDirectory(): string {
        // both TS and NG lang serves work with absolute paths
        // we provide cwd instead of tree root so paths can be resolved to absolute ones
        return process.cwd();
    }

    /**
     * Get all subdirs of a directory from the Tree mapped to absolute paths
     */
    public getDirectories(path: string): string[] {
        // check directory contents in Tree (w/ relative paths)
        path = pathFs.relative(this.getCurrentDirectory(), path);
        // return directory contents w/ absolute paths for LS
        return this.host.getDir(path).subdirs.map(e => pathFs.resolve(path, e));
    }

    /**
     * Get all files of a directory from the Tree mapped to absolute paths
     */
    public readDirectory(path: string): string[] {
        // check directory contents in Tree (w/ relative paths)
        path = pathFs.relative(this.getCurrentDirectory(), path);
        // return directory contents w/ absolute paths for LS
        return this.host.getDir(path).subfiles.map(e => pathFs.resolve(path, e));
    }

    public require(initialPath: string, moduleName: string) {
        try {
            const paths = [initialPath];
            if (moduleName === CUSTOM_TS_PLUGIN_NAME) {
                moduleName = CUSTOM_TS_PLUGIN_PATH;
                paths.push(__dirname);
            }
            const modulePath = this.nativeRequire.resolve(moduleName, { paths });
            return {
                module: require(modulePath),
                error: undefined,
            };
        } catch (e) {
            return {
                module: undefined,
                error: e as Error,
            };
        }
    }

    public gc(): void {
        global.gc();
    }

    public trace(_s: string): void { /* noop */ }

    public getModifiedTime(path: string): Date | undefined {
        return ts.sys.getModifiedTime(path);
    }

    public realpath(path: string): string {
        return ts.sys.realpath(path);
    }

    public createSHA256Hash(data: string): string {
        return ts.sys.createSHA256Hash(data);
    }

    public write(data: string): void {
        ts.sys.write(data);
    }

    public writeOutputIsTTY(): boolean {
        return ts.sys.writeOutputIsTTY();
    }

    public writeFile(path: string, data: string, writeByteOrderMark?: boolean): void {
        return ts.sys.writeFile(path, data, writeByteOrderMark);
    }

    public createDirectory(path: string): void {
        return ts.sys.createDirectory(path);
    }

    public setModifiedTime(path: string, time: Date): void {
        return ts.sys.setModifiedTime(path, time);
    }

    public deleteFile(path: string): void {
        return ts.sys.deleteFile(path);
    }

    public createHash(data: string): string {
        return ts.sys.createHash(data);
    }

    public getMemoryUsage(): number {
        return ts.sys.getMemoryUsage();
    }

    public exit(exitCode?: number): void {
        return ts.sys.exit(exitCode);
    }

    public setTimeout(callback: (...argsv: any[]) => void, ms: number, ...args: any[]): any {
        return ts.sys.setTimeout(callback, ms, ...args);
    }

    public clearTimeout(timeoutId: any): void {
        return ts.sys.clearTimeout(timeoutId);
    }

    public clearScreen(): void {
        return ts.sys.clearScreen();
    }

    public base64decode(input: string): string {
        return ts.sys.base64decode(input);
    }

    public base64encode(input: string): string {
        return ts.sys.base64encode(input);
    }

    public setImmediate(callback: (...argsv: any[]) => void, ...args: any[]): any {
        return setImmediate(callback, ...args);
    }

    public clearImmediate(timeoutId: any): void {
        return clearImmediate(timeoutId);
    }
}
