import * as path from 'path';
import * as fs from 'fs';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import type { Options } from '../interfaces/options';

const AGENT_PATHS: Record<string, string> = {
    copilot: '.github/copilot-instructions.md',
    claude: 'CLAUDE.md',
    cursor: '.cursor/skills/igniteui-angular.md'
};

export const getSkillsSourcePath = (): string =>
    path.join(__dirname, '../../skills/igniteui-angular.md');

export const addAISkills = (options: Options): Rule =>
    (tree: Tree, context: SchematicContext) => {
        if (!options.addAISkills) {
            return;
        }

        const agent = options.aiSkillsAgent || 'copilot';
        let targetPath: string;

        if (agent === 'custom') {
            if (!options.customSkillsPath) {
                context.logger.warn('Custom skills path not provided. Skipping AI skills setup.');
                return;
            }
            targetPath = options.customSkillsPath;
        } else {
            targetPath = AGENT_PATHS[agent];
        }

        if (!targetPath) {
            context.logger.warn(`Unknown AI agent: ${agent}. Skipping AI skills setup.`);
            return;
        }

        if (tree.exists(targetPath)) {
            context.logger.info(`AI skills file already exists at ${targetPath}. Skipping to avoid overwriting.`);
            return;
        }

        const skillsSourcePath = getSkillsSourcePath();
        const skillsContent = fs.readFileSync(skillsSourcePath, 'utf-8');

        tree.create(targetPath, skillsContent);
        context.logger.info(`AI skills file created at ${targetPath}`);
    };
