import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import type { Element } from '@angular/compiler';
import * as ts from 'typescript';
import { UpdateChanges } from '../common/UpdateChanges';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';
import { namedImportFilter } from '../common/tsUtils';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';

const version = '17.0.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');
    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const prop = ['type'];
    const elevated = ['elevated'];

    const applyChanges = () => {
        for (const [path, change] of changes.entries()) {
          let buffer = host.read(path).toString();

          change.sort((c, c1) => c.position - c1.position)
            .reverse()
            .forEach(c => buffer = c.apply(buffer));

          host.overwrite(path, buffer);
        }
      };

      const addChange = (path: string, change: FileChange) => {
        if (changes.has(path)) {
          changes.get(path).push(change);
        } else {
          changes.set(path, [change]);
        }
      };

      for (const path of update.templateFiles) {
        const cardComponents = findElementNodes(parseFile(new HtmlParser(), host, path), 'igx-card');
        cardComponents
            .filter(node => hasAttribute(node as Element, prop) && !hasAttribute(node as Element, elevated))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const { name, value } = getAttribute(node, prop)[0];
                const repTxt = file.content.substring(startTag.start, startTag.end - 1);
                const property = `${name}="${value}"`;
                if (value === 'outlined') {
                    const removePropTxt = repTxt.replace(property, '').trimEnd();
                    addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
                } else {
                    const removePropTxt = repTxt.replace(property, `elevated`);
                    addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
                }
        });

        cardComponents
            .filter(node => !hasAttribute(node as Element, prop) && !hasAttribute(node as Element, elevated))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file } = offset;
                const repTxt = file.content.substring(startTag.start, startTag.end - 1);
                const removePropTxt = repTxt.concat(' ', `elevated`);
                addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
            });
    }

    // Not able to import * as animations from ../../animations due to ESM error - migrations are commonjs, while they should be ESM.
    var animationsExports = ["IAnimationParams", "AnimationUtil", "EaseIn", "EaseInOut", "EaseOut", "fadeIn", "fadeOut",
                        "flipTop", "flipRight", "flipBottom", "flipLeft", "flipHorFwd", "flipHorBck", "flipVerFwd", "flipVerBck",
                        "rotateInCenter", "rotateInTop", "rotateInRight", "rotateInLeft", "rotateInBottom", "rotateInTr", "rotateInBr",
                        "rotateInBl", "rotateInTl", "rotateInDiagonal1", "rotateInDiagonal2", "rotateInHor", "rotateInVer", "rotateOutCenter",
                        "rotateOutTop", "rotateOutRight", "rotateOutLeft", "rotateOutBottom", "rotateOutTr", "rotateOutBr", "rotateOutBl",
                        "rotateOutTl", "rotateOutDiagonal1", "rotateOutDiagonal2", "rotateOutHor", "rotateOutVer",
                        "scaleInTop", "scaleInRight", "scaleInBottom", "scaleInLeft",
                        "scaleInCenter", "scaleInTr", "scaleInBr", "scaleInBl", "scaleInTl", "scaleInVerTop", "scaleInVerBottom",
                        "scaleInVerCenter", "scaleInHorCenter", "scaleInHorLeft", "scaleInHorRight", "scaleOutTop", "scaleOutRight",
                        "scaleOutBottom", "scaleOutLeft", "scaleOutCenter", "scaleOutTr", "scaleOutBr", "scaleOutBl", "scaleOutTl",
                        "scaleOutVerTop", "scaleOutVerBottom", "scaleOutVerCenter", "scaleOutHorCenter", "scaleOutHorLeft", "scaleOutHorRight",
                        "slideInTop", "slideInRight", "slideInBottom", "slideInLeft", "slideInTr", "slideInBr", "slideInBl", "slideInTl",
                        "slideOutTop", "slideOutBottom", "slideOutRight", "slideOutLeft", "slideOutTr", "slideOutBr", "slideOutBl", "slideOutTl",
                        "swingInTopFwd", "swingInRightFwd", "swingInLeftFwd", "swingInBottomFwd", "swingInTopBck", "swingInRightBck", "swingInBottomBck",
                        "swingInLeftBck", "swingOutTopFwd", "swingOutRightFwd", "swingOutBottomFwd", "swingOutLefttFwd", "swingOutTopBck", "swingOutRightBck",
                        "swingOutBottomBck", "swingOutLeftBck", "growVerIn", "growVerOut", "shakeHor", "shakeVer", "shakeTop", "shakeBottom", "shakeRight",
                        "shakeLeft", "shakeCenter", "shakeTr", "shakeBr", "shakeBl", "shakeTl", "pulsateFwd", "pulsateBck", "heartbeat", "blink"];

    update.tsFiles.forEach((filePath: string) => {
        var animationsInFile = [];
        var fileContent = host.read(filePath).toString();

        const source = ts.createSourceFile('', fileContent, ts.ScriptTarget.Latest, true)
        const igImports = source.statements.filter(<(a: ts.Statement) => a is ts.ImportDeclaration>namedImportFilter);

        // Find all animations imported from 'igniteui-angular' and delete them.
        for (const igImport of igImports) {
            const start = igImport.getStart();
            const end = igImport.getEnd();
            const igImportContent = fileContent.substring(start, end);
            animationsExports.forEach(anime => {
                let match: RegExpExecArray;
                const animeSearchTerm =  new RegExp(`(?<=\\{)\\s*${anime}[\\s,]|[\\s,]\\s*${anime}`, 'g');

                while ((match = animeSearchTerm.exec(igImportContent)) !== null) {
                    addChange(filePath, new FileChange(start + match.index, '', match[0], 'replace'));
                    animationsInFile.push(anime);
                }
            });
        }

        // Build new import for all the animations from 'igniteui-angular/animations'.
        // Add the new import at the end of all imports.
        if (animationsInFile.length > 0) {

            const lastImport = igImports.reduce((a, b) => a.getEnd() > b.getEnd() ? a : b);
            const newAnimeImport = `\nimport { ${animationsInFile.sort().join(', ')} } from '${(lastImport?.moduleSpecifier as ts.StringLiteral).text}/animations';`;
            addChange(filePath, new FileChange(lastImport?.getEnd(), newAnimeImport, '', 'insert'));
        }
    });

    applyChanges();
    update.applyChanges();
};
