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
    update.applyChanges();
};
