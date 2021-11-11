import {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { Element } from '@angular/compiler';
import { findElementNodes, getSourceOffset, parseFile } from '../common/util';

const version = '13.0.0';

export default (): Rule => (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    const GRIDS = ['IgxGridComponent', 'IgxTreeGridComponent', 'IgxHierarchicalGridComponent'];
    const TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid'];
    const tsFiles = update.tsFiles;
    const SERVICES = ['IgxCsvExporterService', 'IgxExcelExporterService'];
    const moduleTsFiles = update.moduleTsFiles;

    for (const path of update.templateFiles) {
        findElementNodes(parseFile(host, path), TAGS)
        .map(node => getSourceOffset(node as Element))
        .forEach(offset => {
            const { file, node } = offset;
            if (file.content.includes('columns')) {
                const gridRef = node.attrs.find(e => e.name.includes('#')).name.substring(1);
                const content = file.content.split(gridRef + '.columns').join(gridRef + '.columnsCollection');
                host.overwrite(path, content);
            }
        });
    }

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

    for (const path of tsFiles) {
        let content = host.read(path)?.toString();
        GRIDS.forEach(grid => {
            if (content.indexOf(grid) > -1) {
                const indexes = getIndicesOf('@ViewChild', content);
                indexes.forEach(index => {
                    const viewChildRef = content.substring(index, content.indexOf(';', index)).replace(/\s\s+/g, ' ');
                    if (viewChildRef.includes(grid)) {
                        const gridDeclaration = viewChildRef.substring(viewChildRef.indexOf(')') + 1).replace(/\:/g, '').trim();
                        const gridName = gridDeclaration.split(' ')[1];
                        content = content.split(gridName + '.columns').join(gridName + '.columnsCollection');
                        host.overwrite(path, content);
                    }
                });
            }
        });
    }

    for (const path of moduleTsFiles) {
        let content = host.read(path)?.toString();
        SERVICES.forEach(service => {
            if (content.indexOf(service) > -1) {
                const commentedService = '/*' + service + '*/';
                const commentedServiceWithComa = '/*' + service + ',*/';
                content = content.replace(new RegExp(service, 'gi'), commentedService);
                content = content.replace(new RegExp('[/][*]' + service + '[*][/]\\s*[,]', 'gi'), commentedServiceWithComa);
                const indexes = getIndicesOf('/*' + service, content);
                indexes.reverse().forEach(index => {
                    const preceedingContent = content.substring(0, index);
                    const newLineIndex = preceedingContent.lastIndexOf('\n');
                    const comment = '// ' + service + ' has been removed. Exporter services can now be used without providing.';
                    if (newLineIndex > -1) {
                        const newPreceedingContent =
                            [preceedingContent.slice(0, newLineIndex), '\n' + comment, preceedingContent.slice(newLineIndex)].join('');
                        content = content.replace(preceedingContent, newPreceedingContent);
                    } else {
                        // service is mentioned on the first row
                        content = comment + '\n' + content;
                    }
                });

                host.overwrite(path, content);
            }
        });
    }

    update.applyChanges();
};
