import * as ts from 'typescript/lib/tsserverlibrary';

export class Logger implements ts.server.Logger {
    constructor(
        private readonly traceToConsole: boolean,
        private readonly level: ts.server.LogLevel
    ) { }

    public hasLevel(level: ts.server.LogLevel) {
        return this.loggingEnabled() && this.level >= level;
    }

    public loggingEnabled() {
        return this.traceToConsole;
    }

    public perftrc(s: string) {
        this.msg(s, ts.server.Msg.Perf);
    }

    public info(s: string) {
        this.msg(s, ts.server.Msg.Info);
    }

    public msg(s: string, type: ts.server.Msg = ts.server.Msg.Err) {
        if (!this.traceToConsole) { return; }
        if (type === ts.server.Msg.Info) {
            console.log(s);
        }
        if (type === ts.server.Msg.Err) {
            console.error(s);
        }
        if (type === ts.server.Msg.Perf) {
            console.warn(s);
        }
    }

    //#region Not implemented
    /* These methods are used to log to a file,
       we will only use the logger to log on the console.
    */
    public close() { }

    public startGroup() { }

    public endGroup() { }

    public getLogFileName() {
        return null;
    }
    //#endregion
}
