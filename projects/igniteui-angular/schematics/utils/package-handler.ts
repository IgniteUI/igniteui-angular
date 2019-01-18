import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { RunSchematicTask, NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

const extSchematicModule = 'igniteui-cli';
const schematicName = 'cli-config';

export function installPackageJsonDependencies(options: any): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const installTaskId = context.addTask(new NodePackageInstallTask());
        const cliSchematicTask = new RunSchematicTask(
            extSchematicModule, // Module
            schematicName, // Schematic Name
            {
                collection: extSchematicModule,
                name: schematicName,
                options
            }
        );
        // Add Task for igniteu-cli schematic and wait for install task to finish
        context.addTask(cliSchematicTask, [installTaskId]);

        return tree;
    };
}
