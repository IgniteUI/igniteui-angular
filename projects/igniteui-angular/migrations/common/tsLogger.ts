import * as ts from 'typescript/lib/tsserverlibrary.js';

export class Logger implements ts.server.Logger {
    private readonly traceToConsole: boolean;
    private readonly level: ts.server.LogLevel;
    constructor(traceToConsole: boolean, level: ts.server.LogLevel) {
        this.traceToConsole = traceToConsole;
        this.level = level;
    }

    public hasLevel(level: ts.server.LogLevel) {
        return this.loggingEnabled() && this.level >= level;
    }

    loggingEnabled() {
        return this.traceToConsole;
    }

    perftrc(s: string) {
        this.msg(s, ts.server.Msg.Perf);
    }

    info(s: string) {
        this.msg(s, ts.server.Msg.Info);
    }

    msg(s: string, type: ts.server.Msg = ts.server.Msg.Err) {
        if (!this.traceToConsole) {
            return;
        }
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
    close() { }

    startGroup() { }

    endGroup() { }

    getLogFileName() {
        return null;
    }
    //#endregion
}
