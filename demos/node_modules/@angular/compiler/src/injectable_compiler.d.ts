import { CompileInjectableMetadata } from './compile_metadata';
import { CompileReflector } from './compile_reflector';
import * as o from './output/output_ast';
import { OutputContext } from './util';
export declare class InjectableCompiler {
    private reflector;
    private alwaysGenerateDef;
    private tokenInjector;
    constructor(reflector: CompileReflector, alwaysGenerateDef: boolean);
    private depsArray(deps, ctx);
    factoryFor(injectable: CompileInjectableMetadata, ctx: OutputContext): o.Expression;
    injectableDef(injectable: CompileInjectableMetadata, ctx: OutputContext): o.Expression;
    compile(injectable: CompileInjectableMetadata, ctx: OutputContext): void;
}
