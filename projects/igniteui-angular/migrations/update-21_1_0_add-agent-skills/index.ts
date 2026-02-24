import { normalize, type Path, relative } from '@angular-devkit/core';
import {
    apply,
    MergeStrategy,
    mergeWith,
    move,
    type Rule,
    type SchematicContext,
    type Source,
    Tree
} from '@angular-devkit/schematics';
import { IG_LICENSED_PACKAGE_NAME, IG_PACKAGE_NAME } from '../common/tsUtils';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    let skillsPath = normalize(`.claude/skills`);
    const agentsPath = normalize(`.agents/skills`);
    const cursortSkills = normalize(`.cursor/skills`);
    const githubSkills = normalize(`.agents/skills`);

    if (host.getDir(agentsPath).subdirs.length)
        skillsPath = agentsPath;
    if (host.getDir(cursortSkills).subdirs.length)
        skillsPath = cursortSkills;
    if (host.getDir(githubSkills).subdirs.length)
        skillsPath = githubSkills;

    let from: Path | undefined;
    const packagePath = `/node_modules/${IG_PACKAGE_NAME}`;
    const licensedPackagePath = `/node_modules/${IG_LICENSED_PACKAGE_NAME}`;

    // exists works on files only, so check package.json
    if (host.exists(`${packagePath}/package.json`))
        from = normalize(`${packagePath}/skills`);

    if (host.exists(`${licensedPackagePath}/package.json`))
        from = normalize(`${licensedPackagePath}/skills`);

    if (from) {
        const skillsSource: Source = () => {
            const tree = Tree.empty();
            host.getDir(from).visit((filePath) => {
                tree.create(relative(from, filePath), host.read(filePath));
            });
            return tree;
        };

        context.logger.info(`Added Ignite UI for Angular agent skill files to ${skillsPath}.`);
        context.logger.info(`If your agent doesn't load from that path by default, please refer to its documentation and move the skill files as needed.`);

        return mergeWith(apply(skillsSource, [move(skillsPath)]), MergeStrategy.Overwrite);
    }
};
