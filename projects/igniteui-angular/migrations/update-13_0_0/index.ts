import {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { Element } from '@angular/compiler';
import { findElementNodes, getSourceOffset, parseFile } from '../common/util';
import { nativeImport } from '../common/import-helper.js';

const version = '13.0.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');

    const update = new UpdateChanges(__dirname, host, context);
    const GRIDS = ['IgxGridComponent', 'IgxTreeGridComponent', 'IgxHierarchicalGridComponent'];
    const TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid'];
    const tsFiles = update.tsFiles;
    const SERVICES = ['IgxCsvExporterService', 'IgxExcelExporterService'];

    const getIndicesOf = (searchStr, str) => {
        if (searchStr.length === 0) {
            return [];
        }
        let startIndex = 0;
        let index = 0;
        const indexes = [];
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indexes.push(index);
            startIndex = index + searchStr.length;
        }
        return indexes;
    };

    const moduleTsFiles = tsFiles.filter(x => x.endsWith('.module.ts'));
    for (const path of moduleTsFiles) {
        let content = host.read(path)?.toString();
        const servicesInFile = [];
        SERVICES.forEach(service => {
            if (content.indexOf(service) > -1) {
                servicesInFile.push(service);
            }
        });

        if (servicesInFile.length > 0) {
            let newLine = '\n';
            if (content.indexOf('\r\n') > -1) {
                newLine = '\r\n';
            }

            const comment =
                '// ' + servicesInFile.join(' and ') + ' no longer need to be manually provided and can be safely removed.' + newLine;
            content = comment + content;
            host.overwrite(path, content);
        }
    }

    update.applyChanges();
};
