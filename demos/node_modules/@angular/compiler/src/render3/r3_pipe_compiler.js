/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/r3_pipe_compiler", ["require", "exports", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/util", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/r3_types", "@angular/compiler/src/render3/r3_view_compiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var o = require("@angular/compiler/src/output/output_ast");
    var util_1 = require("@angular/compiler/src/util");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var r3_types_1 = require("@angular/compiler/src/render3/r3_types");
    var r3_view_compiler_1 = require("@angular/compiler/src/render3/r3_view_compiler");
    /**
     * Write a pipe definition to the output context.
     */
    function compilePipe(outputCtx, pipe, reflector, mode) {
        var definitionMapValues = [];
        // e.g. `name: 'myPipe'`
        definitionMapValues.push({ key: 'name', value: o.literal(pipe.name), quoted: false });
        // e.g. `type: MyPipe`
        definitionMapValues.push({ key: 'type', value: outputCtx.importExpr(pipe.type.reference), quoted: false });
        // e.g. factory: function MyPipe_Factory() { return new MyPipe(); },
        var templateFactory = r3_view_compiler_1.createFactory(pipe.type, outputCtx, reflector, []);
        definitionMapValues.push({ key: 'factory', value: templateFactory, quoted: false });
        // e.g. pure: true
        if (pipe.pure) {
            definitionMapValues.push({ key: 'pure', value: o.literal(true), quoted: false });
        }
        var className = compile_metadata_1.identifierName(pipe.type);
        className || util_1.error("Cannot resolve the name of " + pipe.type);
        var definitionField = outputCtx.constantPool.propertyNameOf(3 /* Pipe */);
        var definitionFunction = o.importExpr(r3_identifiers_1.Identifiers.definePipe).callFn([o.literalMap(definitionMapValues)]);
        if (mode === 0 /* PartialClass */) {
            outputCtx.statements.push(new o.ClassStmt(
            /* name */ className, 
            /* parent */ null, 
            /* fields */ [new o.ClassField(
                /* name */ definitionField, 
                /* type */ o.INFERRED_TYPE, 
                /* modifiers */ [o.StmtModifier.Static], 
                /* initializer */ definitionFunction)], 
            /* getters */ [], 
            /* constructorMethod */ new o.ClassMethod(null, [], []), 
            /* methods */ []));
        }
        else {
            // Create back-patch definition.
            var classReference = outputCtx.importExpr(pipe.type.reference);
            // Create the back-patch statement
            outputCtx.statements.push(new o.CommentStmt(r3_types_1.BUILD_OPTIMIZER_COLOCATE), classReference.prop(definitionField).set(definitionFunction).toStmt());
        }
    }
    exports.compilePipe = compilePipe;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfcGlwZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3IzX3BpcGVfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCwyRUFBa0c7SUFHbEcsMkRBQTBDO0lBQzFDLG1EQUE2QztJQUU3QywrRUFBbUQ7SUFDbkQsbUVBQWdFO0lBQ2hFLG1GQUFpRDtJQUVqRDs7T0FFRztJQUNILHFCQUNJLFNBQXdCLEVBQUUsSUFBeUIsRUFBRSxTQUEyQixFQUNoRixJQUFnQjtRQUNsQixJQUFNLG1CQUFtQixHQUEwRCxFQUFFLENBQUM7UUFFdEYsd0JBQXdCO1FBQ3hCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBRXBGLHNCQUFzQjtRQUN0QixtQkFBbUIsQ0FBQyxJQUFJLENBQ3BCLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBRXBGLG9FQUFvRTtRQUNwRSxJQUFNLGVBQWUsR0FBRyxnQ0FBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7UUFFbEYsa0JBQWtCO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2QsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRUQsSUFBTSxTQUFTLEdBQUcsaUNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFHLENBQUM7UUFDOUMsU0FBUyxJQUFJLFlBQUssQ0FBQyxnQ0FBOEIsSUFBSSxDQUFDLElBQU0sQ0FBQyxDQUFDO1FBRTlELElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsY0FBYyxjQUFxQixDQUFDO1FBQ25GLElBQU0sa0JBQWtCLEdBQ3BCLENBQUMsQ0FBQyxVQUFVLENBQUMsNEJBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVFLEVBQUUsQ0FBQyxDQUFDLElBQUkseUJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVM7WUFDckMsVUFBVSxDQUFDLFNBQVM7WUFDcEIsWUFBWSxDQUFDLElBQUk7WUFDakIsWUFBWSxDQUFBLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVTtnQkFDekIsVUFBVSxDQUFDLGVBQWU7Z0JBQzFCLFVBQVUsQ0FBQyxDQUFDLENBQUMsYUFBYTtnQkFDMUIsZUFBZSxDQUFBLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQ3RDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDMUMsYUFBYSxDQUFBLEVBQUU7WUFDZix1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDdkQsYUFBYSxDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sZ0NBQWdDO1lBQ2hDLElBQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVqRSxrQ0FBa0M7WUFDbEMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQ3JCLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxtQ0FBd0IsQ0FBQyxFQUMzQyxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDN0UsQ0FBQztJQUNILENBQUM7SUFqREQsa0NBaURDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcGlsZVBpcGVNZXRhZGF0YSwgaWRlbnRpZmllck5hbWV9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yfSBmcm9tICcuLi9jb21waWxlX3JlZmxlY3Rvcic7XG5pbXBvcnQge0RlZmluaXRpb25LaW5kfSBmcm9tICcuLi9jb25zdGFudF9wb29sJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtPdXRwdXRDb250ZXh0LCBlcnJvcn0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7SWRlbnRpZmllcnMgYXMgUjN9IGZyb20gJy4vcjNfaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtCVUlMRF9PUFRJTUlaRVJfQ09MT0NBVEUsIE91dHB1dE1vZGV9IGZyb20gJy4vcjNfdHlwZXMnO1xuaW1wb3J0IHtjcmVhdGVGYWN0b3J5fSBmcm9tICcuL3IzX3ZpZXdfY29tcGlsZXInO1xuXG4vKipcbiAqIFdyaXRlIGEgcGlwZSBkZWZpbml0aW9uIHRvIHRoZSBvdXRwdXQgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVQaXBlKFxuICAgIG91dHB1dEN0eDogT3V0cHV0Q29udGV4dCwgcGlwZTogQ29tcGlsZVBpcGVNZXRhZGF0YSwgcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLFxuICAgIG1vZGU6IE91dHB1dE1vZGUpIHtcbiAgY29uc3QgZGVmaW5pdGlvbk1hcFZhbHVlczoge2tleTogc3RyaW5nLCBxdW90ZWQ6IGJvb2xlYW4sIHZhbHVlOiBvLkV4cHJlc3Npb259W10gPSBbXTtcblxuICAvLyBlLmcuIGBuYW1lOiAnbXlQaXBlJ2BcbiAgZGVmaW5pdGlvbk1hcFZhbHVlcy5wdXNoKHtrZXk6ICduYW1lJywgdmFsdWU6IG8ubGl0ZXJhbChwaXBlLm5hbWUpLCBxdW90ZWQ6IGZhbHNlfSk7XG5cbiAgLy8gZS5nLiBgdHlwZTogTXlQaXBlYFxuICBkZWZpbml0aW9uTWFwVmFsdWVzLnB1c2goXG4gICAgICB7a2V5OiAndHlwZScsIHZhbHVlOiBvdXRwdXRDdHguaW1wb3J0RXhwcihwaXBlLnR5cGUucmVmZXJlbmNlKSwgcXVvdGVkOiBmYWxzZX0pO1xuXG4gIC8vIGUuZy4gZmFjdG9yeTogZnVuY3Rpb24gTXlQaXBlX0ZhY3RvcnkoKSB7IHJldHVybiBuZXcgTXlQaXBlKCk7IH0sXG4gIGNvbnN0IHRlbXBsYXRlRmFjdG9yeSA9IGNyZWF0ZUZhY3RvcnkocGlwZS50eXBlLCBvdXRwdXRDdHgsIHJlZmxlY3RvciwgW10pO1xuICBkZWZpbml0aW9uTWFwVmFsdWVzLnB1c2goe2tleTogJ2ZhY3RvcnknLCB2YWx1ZTogdGVtcGxhdGVGYWN0b3J5LCBxdW90ZWQ6IGZhbHNlfSk7XG5cbiAgLy8gZS5nLiBwdXJlOiB0cnVlXG4gIGlmIChwaXBlLnB1cmUpIHtcbiAgICBkZWZpbml0aW9uTWFwVmFsdWVzLnB1c2goe2tleTogJ3B1cmUnLCB2YWx1ZTogby5saXRlcmFsKHRydWUpLCBxdW90ZWQ6IGZhbHNlfSk7XG4gIH1cblxuICBjb25zdCBjbGFzc05hbWUgPSBpZGVudGlmaWVyTmFtZShwaXBlLnR5cGUpICE7XG4gIGNsYXNzTmFtZSB8fCBlcnJvcihgQ2Fubm90IHJlc29sdmUgdGhlIG5hbWUgb2YgJHtwaXBlLnR5cGV9YCk7XG5cbiAgY29uc3QgZGVmaW5pdGlvbkZpZWxkID0gb3V0cHV0Q3R4LmNvbnN0YW50UG9vbC5wcm9wZXJ0eU5hbWVPZihEZWZpbml0aW9uS2luZC5QaXBlKTtcbiAgY29uc3QgZGVmaW5pdGlvbkZ1bmN0aW9uID1cbiAgICAgIG8uaW1wb3J0RXhwcihSMy5kZWZpbmVQaXBlKS5jYWxsRm4oW28ubGl0ZXJhbE1hcChkZWZpbml0aW9uTWFwVmFsdWVzKV0pO1xuXG4gIGlmIChtb2RlID09PSBPdXRwdXRNb2RlLlBhcnRpYWxDbGFzcykge1xuICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2gobmV3IG8uQ2xhc3NTdG10KFxuICAgICAgICAvKiBuYW1lICovIGNsYXNzTmFtZSxcbiAgICAgICAgLyogcGFyZW50ICovIG51bGwsXG4gICAgICAgIC8qIGZpZWxkcyAqL1tuZXcgby5DbGFzc0ZpZWxkKFxuICAgICAgICAgICAgLyogbmFtZSAqLyBkZWZpbml0aW9uRmllbGQsXG4gICAgICAgICAgICAvKiB0eXBlICovIG8uSU5GRVJSRURfVFlQRSxcbiAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqL1tvLlN0bXRNb2RpZmllci5TdGF0aWNdLFxuICAgICAgICAgICAgLyogaW5pdGlhbGl6ZXIgKi8gZGVmaW5pdGlvbkZ1bmN0aW9uKV0sXG4gICAgICAgIC8qIGdldHRlcnMgKi9bXSxcbiAgICAgICAgLyogY29uc3RydWN0b3JNZXRob2QgKi8gbmV3IG8uQ2xhc3NNZXRob2QobnVsbCwgW10sIFtdKSxcbiAgICAgICAgLyogbWV0aG9kcyAqL1tdKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQ3JlYXRlIGJhY2stcGF0Y2ggZGVmaW5pdGlvbi5cbiAgICBjb25zdCBjbGFzc1JlZmVyZW5jZSA9IG91dHB1dEN0eC5pbXBvcnRFeHByKHBpcGUudHlwZS5yZWZlcmVuY2UpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBiYWNrLXBhdGNoIHN0YXRlbWVudFxuICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgIG5ldyBvLkNvbW1lbnRTdG10KEJVSUxEX09QVElNSVpFUl9DT0xPQ0FURSksXG4gICAgICAgIGNsYXNzUmVmZXJlbmNlLnByb3AoZGVmaW5pdGlvbkZpZWxkKS5zZXQoZGVmaW5pdGlvbkZ1bmN0aW9uKS50b1N0bXQoKSk7XG4gIH1cbn0iXX0=