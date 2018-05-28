import { OutputEmitter } from './abstract_emitter';
import * as o from './output_ast';
export declare class JavaScriptEmitter implements OutputEmitter {
    emitStatements(genFilePath: string, stmts: o.Statement[], preamble?: string): string;
}
