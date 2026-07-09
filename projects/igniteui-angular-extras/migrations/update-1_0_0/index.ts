import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

const version = '1.0.0';

/** Map of old enum member names to new names (prefixed with enum name for specificity) */
const CHART_TYPE_RENAMES: Record<string, string> = {
    'CHART_TYPE.PIE': 'CHART_TYPE.Pie',
    'CHART_TYPE.COLUMN_GROUPED': 'CHART_TYPE.ColumnGrouped',
    'CHART_TYPE.AREA_GROUPED': 'CHART_TYPE.AreaGrouped',
    'CHART_TYPE.LINE_GROUPED': 'CHART_TYPE.LineGrouped',
    'CHART_TYPE.BAR_GROUPED': 'CHART_TYPE.BarGrouped',
    'CHART_TYPE.COLUMN_STACKED': 'CHART_TYPE.ColumnStacked',
    'CHART_TYPE.AREA_STACKED': 'CHART_TYPE.AreaStacked',
    'CHART_TYPE.LINE_STACKED': 'CHART_TYPE.LineStacked',
    'CHART_TYPE.BAR_STACKED': 'CHART_TYPE.BarStacked',
    'CHART_TYPE.COLUMN_100_STACKED': 'CHART_TYPE.Column100Stacked',
    'CHART_TYPE.AREA_100_STACKED': 'CHART_TYPE.Area100Stacked',
    'CHART_TYPE.LINE_100_STACKED': 'CHART_TYPE.Line100Stacked',
    'CHART_TYPE.BAR_100_STACKED': 'CHART_TYPE.Bar100Stacked',
    'CHART_TYPE.SCATTER_POINT': 'CHART_TYPE.ScatterPoint',
    'CHART_TYPE.SCATTER_BUBBLE': 'CHART_TYPE.ScatterBubble',
    'CHART_TYPE.SCATTER_LINE': 'CHART_TYPE.ScatterLine',
};

const OPTIONS_TYPE_RENAMES: Record<string, string> = {
    'OPTIONS_TYPE.CHART': 'OPTIONS_TYPE.Chart',
    'OPTIONS_TYPE.SERIES': 'OPTIONS_TYPE.Series',
    'OPTIONS_TYPE.X_AXIS': 'OPTIONS_TYPE.XAxis',
    'OPTIONS_TYPE.Y_AXIS': 'OPTIONS_TYPE.YAxis',
    'OPTIONS_TYPE.STACKED_SERIES': 'OPTIONS_TYPE.StackedSeries',
};

const CONDITIONAL_FORMATTING_TYPE_RENAMES: Record<string, string> = {
    'ConditionalFormattingType.dataBars': 'ConditionalFormattingType.DataBars',
    'ConditionalFormattingType.colorScale': 'ConditionalFormattingType.ColorScale',
    'ConditionalFormattingType.top10': 'ConditionalFormattingType.Top10',
    'ConditionalFormattingType.textContains': 'ConditionalFormattingType.TextContains',
    'ConditionalFormattingType.single': 'ConditionalFormattingType.Single',
    'ConditionalFormattingType.unique': 'ConditionalFormattingType.Unique',
    'ConditionalFormattingType.empty': 'ConditionalFormattingType.Empty',
};

/** Output property renames: old name -> new name */
const OUTPUT_RENAMES: Record<string, string> = {
    'onClose': 'closed',
    'onButtonClose': 'buttonClose',
    'onChartTypesDetermined': 'chartTypesDetermined',
    'onChartCreationDone': 'chartCreationDone',
    'onFormattersReady': 'formattersReady',
};

function replaceAll(content: string, replacements: Record<string, string>): string {
    for (const [oldValue, newValue] of Object.entries(replacements)) {
        const escaped = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'g');
        content = content.replace(regex, newValue);
    }
    return content;
}

function hasExtrasImport(content: string): boolean {
    return /from\s+['"]igniteui-angular-extras['"]/.test(content);
}

function migrateTemplateFile(content: string): string {
    let updated = content;
    for (const [oldName, newName] of Object.entries(OUTPUT_RENAMES)) {
        // Replace event bindings: (onClose) -> (closed)
        const eventBindingRegex = new RegExp(`\\(${oldName}\\)`, 'g');
        updated = updated.replace(eventBindingRegex, `(${newName})`);
    }
    return updated;
}

function migrateTypeScriptFile(content: string): string {
    let updated = content;

    // Replace enum member references (only in files that import from extras)
    if (hasExtrasImport(updated)) {
        updated = replaceAll(updated, CHART_TYPE_RENAMES);
        updated = replaceAll(updated, OPTIONS_TYPE_RENAMES);
        updated = replaceAll(updated, CONDITIONAL_FORMATTING_TYPE_RENAMES);

        // Replace output property access in TypeScript (e.g., .onButtonClose.emit(), .onButtonClose.subscribe())
        for (const [oldName, newName] of Object.entries(OUTPUT_RENAMES)) {
            const propertyAccessRegex = new RegExp(`\\.${oldName}\\b`, 'g');
            updated = updated.replace(propertyAccessRegex, `.${newName}`);
        }
    }

    return updated;
}

export default (): Rule => (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular Extras to version ${version}`
    );

    host.visit((path) => {
        if (path.includes('node_modules')) {
            return;
        }

        const content = host.read(path)?.toString('utf-8');
        if (!content) {
            return;
        }

        if (path.endsWith('.html')) {
            // Only migrate templates whose companion .ts file imports from extras
            const companionTs = path.replace(/\.html$/, '.ts');
            const companionContent = host.read(companionTs)?.toString('utf-8');
            if (companionContent && hasExtrasImport(companionContent)) {
                const updated = migrateTemplateFile(content);
                if (updated !== content) {
                    host.overwrite(path, updated);
                    context.logger.info(`  Updated template: ${path}`);
                }
            }
        } else if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
            const updated = migrateTypeScriptFile(content);
            if (updated !== content) {
                host.overwrite(path, updated);
                context.logger.info(`  Updated source: ${path}`);
            }
        }
    });
};
