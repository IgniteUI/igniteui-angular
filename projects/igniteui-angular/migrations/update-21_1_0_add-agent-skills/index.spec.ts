import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';
import { IG_LICENSED_PACKAGE_NAME, IG_PACKAGE_NAME } from '../common/tsUtils';

describe(`Add Agent skills`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-54';

    const packagePath = `/node_modules/${IG_PACKAGE_NAME}`;
    const licensedPackagePath = `/node_modules/${IG_LICENSED_PACKAGE_NAME}`;

    const addPackageSkills = (tree: UnitTestTree, basePath: string, packageName = IG_PACKAGE_NAME) => {
        tree.create(`${basePath}/package.json`, JSON.stringify({ name: packageName, version: '21.1.0' }));
        tree.create(`${basePath}/skills/igniteui-angular-components/SKILL.md`, '# Components Skill');
        tree.create(`${basePath}/skills/igniteui-angular-grids/SKILL.md`, '# Grids Skill');
    };

    it('should copy skill files to .claude/skills by default when no existing agent directories have content', async () => {
        addPackageSkills(appTree, packagePath);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.exists('/.claude/skills/igniteui-angular-components/SKILL.md')).toBeTrue();
        expect(tree.exists('/.claude/skills/igniteui-angular-grids/SKILL.md')).toBeTrue();
    });

    it('should copy skill files to .agents/skills when that directory already has content', async () => {
        addPackageSkills(appTree, packagePath);
        appTree.create('/.agents/skills/existing-skill/SKILL.md', '# Existing Skill');

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.exists('/.agents/skills/igniteui-angular-components/SKILL.md')).toBeTrue();
        expect(tree.exists('/.agents/skills/igniteui-angular-grids/SKILL.md')).toBeTrue();
        expect(tree.exists('/.claude/skills/igniteui-angular-components/SKILL.md')).toBeFalse();
    });

    it('should copy skill files to .cursor/skills when that directory already has content', async () => {
        addPackageSkills(appTree, packagePath);
        appTree.create('/.cursor/skills/existing-skill/SKILL.md', '# Existing Skill');

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.exists('/.cursor/skills/igniteui-angular-components/SKILL.md')).toBeTrue();
        expect(tree.exists('/.cursor/skills/igniteui-angular-grids/SKILL.md')).toBeTrue();
        expect(tree.exists('/.claude/skills/igniteui-angular-components/SKILL.md')).toBeFalse();
    });

    it('should copy skill files to .github/skills when that directory already has content', async () => {
        addPackageSkills(appTree, packagePath);
        appTree.create('/.github/skills/existing-skill/SKILL.md', '# Existing Skill');

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.exists('/.github/skills/igniteui-angular-components/SKILL.md')).toBeTrue();
        expect(tree.exists('/.github/skills/igniteui-angular-grids/SKILL.md')).toBeTrue();
        expect(tree.exists('/.claude/skills/igniteui-angular-components/SKILL.md')).toBeFalse();
    });

    it('should use the licensed package skills when only the licensed package is installed', async () => {
        addPackageSkills(appTree, licensedPackagePath, IG_LICENSED_PACKAGE_NAME);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.exists('/.claude/skills/igniteui-angular-components/SKILL.md')).toBeTrue();
    });

    it('should not create any skill files when neither package is installed', async () => {
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.exists('/.claude/skills/igniteui-angular-components/SKILL.md')).toBeFalse();
        expect(tree.exists('/.agents/skills/igniteui-angular-components/SKILL.md')).toBeFalse();
        expect(tree.exists('/.cursor/skills/igniteui-angular-components/SKILL.md')).toBeFalse();
    });

    it('should overwrite existing skill files when re-running the migration', async () => {
        addPackageSkills(appTree, packagePath);
        appTree.create('/.claude/skills/igniteui-angular-components/SKILL.md', '# Old Content');

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/.claude/skills/igniteui-angular-components/SKILL.md')).toBe('# Components Skill');
    });

    it('should preserve content of all skill files during copy', async () => {
        const componentsContent = '# Components Skill\nSome detailed content here.';
        const gridsContent = '# Grids Skill\nGrid-specific instructions.';
        appTree.create(`${packagePath}/package.json`, JSON.stringify({ name: IG_PACKAGE_NAME, version: '21.1.0' }));
        appTree.create(`${packagePath}/skills/igniteui-angular-components/SKILL.md`, componentsContent);
        appTree.create(`${packagePath}/skills/igniteui-angular-grids/SKILL.md`, gridsContent);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/.claude/skills/igniteui-angular-components/SKILL.md')).toBe(componentsContent);
        expect(tree.readContent('/.claude/skills/igniteui-angular-grids/SKILL.md')).toBe(gridsContent);
    });
});
