// tslint:disable:no-implicit-dependencies
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import * as fs from 'fs';
import * as path from 'path';
import { ClassChanges, BindingChanges, SelectorChanges, ThemePropertyChanges } from './schema';
import { UpdateChanges } from './UpdateChanges';

describe('UpdateChanges', () => {
    let appTree: UnitTestTree;

    class UnitUpdateChanges extends UpdateChanges {
        public getSelectorChanges() { return this.selectorChanges; }
        public getClassChanges() { return this.classChanges; }
        public getOutputChanges() { return this.outputChanges; }
        public getInputChanges() { return this.inputChanges; }
        public getThemePropChanges() { return this.themePropsChanges; }
    }

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify({
            projects: {
                testProj: {
                    sourceRoot: '/'
                }
            }
          }));
    });

    // tslint:disable:arrow-parens
    it('should replace/remove components', done => {
        const selectorsJson: SelectorChanges = {
            changes: [
                { type: 'component' as any, selector: 'igx-component', replaceWith: 'igx-replaced' },
                { type: 'component' as any, selector: 'igx-remove', remove: true }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'selectors.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(selectorsJson));

        appTree.create(
            'test.component.html',
            '<igx-component> <content> <igx-remove></igx-remove> </igx-component> <igx-remove> <content> </igx-remove>'
        );
        appTree.create(
            'test2.component.html',
            '<igx-remove attr></igx-remove><igx-component>'
        );

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getSelectorChanges()).toEqual(selectorsJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual('<igx-replaced> <content>  </igx-replaced> ');
        expect(appTree.readContent('test2.component.html')).toEqual('<igx-replaced>');
        done();
    });

    it('should replace/remove directives', done => {
        const selectorsJson: SelectorChanges = {
            changes: [
                { type: 'directive' as any, selector: 'igxDirective', replaceWith: 'igxReplaced' },
                { type: 'directive' as any, selector: 'igxRemove', remove: true }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'selectors.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify(selectorsJson));

        appTree.create(
            'test.component.html',
            `<igx-component [igxDirective]="val" igxRemove> <content igxDirective [igxRemove]="val"> </igx-component>` +
            `<igx-component2 [igxRemove]='val'> <content> </igx-component2>`
        );

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(update.getSelectorChanges()).toEqual(selectorsJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<igx-component [igxReplaced]="val"> <content igxReplaced> </igx-component>` +
            `<igx-component2> <content> </igx-component2>`);
        done();
    });

    it('should replace/remove outputs', done => {
        const outputJson: BindingChanges = {
            changes: [
                {
                    name: 'onReplaceMe', replaceWith: 'replaced',
                    owner: { type: 'component' as any, selector: 'comp' }
                },
                {
                    name: 'onOld', remove: true,
                    owner: { type: 'component' as any, selector: 'another' }
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'outputs.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.callFake(() => JSON.stringify(outputJson));

        const fileContent = `<one (onReplaceMe)="a"> <comp\r\ntag (onReplaceMe)="dwdw" (onOld)=""> </other> <another (onOld)="b" />`;
        appTree.create('test.component.html', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getOutputChanges()).toEqual(outputJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one (onReplaceMe)="a"> <comp\r\ntag (replaced)="dwdw" (onOld)=""> </other> <another />`);

        outputJson.changes[0].owner = { type: 'directive' as any, selector: 'tag' };
        outputJson.changes[1].owner = { type: 'directive' as any, selector: 'tag' };
        appTree.overwrite('test.component.html', fileContent);
        const update2 = new UnitUpdateChanges(__dirname, appTree);
        update2.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one (onReplaceMe)="a"> <comp\r\ntag (replaced)="dwdw"> </other> <another (onOld)="b" />`);
        done();
    });

    it('should replace/remove inputs', done => {
        const inputJson: BindingChanges = {
            changes: [
                {
                    name: 'replaceMe', replaceWith: 'replaced',
                    owner: { type: 'component' as any, selector: 'comp' }
                },
                {
                    name: 'oldProp', remove: true,
                    owner: { type: 'component' as any, selector: 'another' }
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'inputs.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.callFake(() => JSON.stringify(inputJson));

        const fileContent = `<one [replaceMe]="a"> <comp\r\ntag [replaceMe]="dwdw" [oldProp]=''> </other> <another oldProp="b" />`;
        appTree.create('test.component.html', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getInputChanges()).toEqual(inputJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one [replaceMe]="a"> <comp\r\ntag [replaced]="dwdw" [oldProp]=''> </other> <another />`);

        inputJson.changes[1].remove = false;
        inputJson.changes[1].replaceWith = 'oldReplaced';
        appTree.overwrite('test.component.html', fileContent);
        const update2 = new UnitUpdateChanges(__dirname, appTree);
        update2.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one [replaceMe]="a"> <comp\r\ntag [replaced]="dwdw" [oldProp]=''> </other> <another oldReplaced="b" />`);
        inputJson.changes[1].remove = true;

        inputJson.changes[0].owner = { type: 'directive' as any, selector: 'tag' };
        inputJson.changes[1].owner = { type: 'directive' as any, selector: 'tag' };
        appTree.overwrite('test.component.html', fileContent);
        const update3 = new UnitUpdateChanges(__dirname, appTree);
        update3.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
            `<one [replaceMe]="a"> <comp\r\ntag [replaced]="dwdw"> </other> <another oldProp="b" />`);
        done();
    });

    it('should replace class identifiers', done => {
        const classJson: ClassChanges = {
            changes: [
                {
                    name: 'igxClass', replaceWith: 'igxReplace'
                },
                {
                    name: 'igxClass2', replaceWith: 'igxSecond'
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'classes.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.callFake(() => JSON.stringify(classJson));

        const fileContent = `import { igxClass } from ""; export class Test { prop: igxClass; prop2: igxClass2; }`;
        appTree.create('test.component.ts', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getClassChanges()).toEqual(classJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.ts')).toEqual(
            `import { igxReplace } from ""; export class Test { prop: igxReplace; prop2: igxSecond; }`);

        done();
    });

    it('should replace class identifiers (complex file)', done => {
        const classJson: ClassChanges = {
            changes: [
                { name: 'IgxGridComponent', replaceWith: 'IgxGridReplace' },
                { name: 'IgxColumnComponent', replaceWith: 'IgxColumnReplace' },
                { name: 'IgxProvided', replaceWith: 'IgxProvidedReplace' },
                { name: 'STRING_FILTERS', replaceWith: 'REPLACED_CONST' },
                { name: 'IgxCsvExporterService', replaceWith: 'Injected' },
                { name: 'IgxExcelExporterOptions', replaceWith: 'IgxNewable' },
                // partial match:
                { name: 'IgxExporterOptionsBase', replaceWith: 'ReturnType' },
                // no actual matches:
                { name: 'NotType', replaceWith: 'Nope' },
                { name: 'NotAgain', replaceWith: 'NopeAgain' }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'classes.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.callFake(() => JSON.stringify(classJson));

        const fileContent =
        `import { Component, Injectable, ViewChild } from "@angular/core";` +
        `import { IgxGridComponent } from "../../lib/grid/grid.component";` +
        `import { IgxColumnComponent, IgxProvided, STRING_FILTERS} from "../../lib/main";\r\n` +
        `import {` +
        `    IgxCsvExporterService,` +
        `    IgxExcelExporterOptions,` +
        `    IgxExporterOptionsBase` +
        `} from "../../lib/services/index";\r\n` +
        `@Component({` +
        `    providers: [IgxProvided, RemoteService]` +
        `})` +
        `export class GridSampleComponent {` +
        `    @ViewChild("grid1", { read: IgxGridComponent }) public grid1: IgxGridComponent;` +
        `    // prop definitions to ignore:\r\n` +
        `    NotType: { NotAgain: string; extraProp: IgxExcelExporterOptions, IgxExcelExporterOptions: string } = {` +
        `        NotAgain: "hai",` +
        `        extraProp: new IgxExcelExporterOptions(),` +
        `        IgxExcelExporterOptions: "fake"` +
        `    }` +
        `    constructor(private csvExporterService: IgxCsvExporterService) { }` +
        `    public initColumns(event: IgxColumnComponent) {` +
        `        const column: IgxColumnComponent = event;` +
        `        this.grid1.filter("ProductName", "Queso", STRING_FILTERS.contains, true);` +
        `    }` +
        `    private getOptions(fileName: string): IgxExporterOptionsBase {` +
        `        return new IgxExcelExporterOptions(fileName);` +
        `    }` +
        `}`
        ;
        appTree.create('test.component.ts', fileContent);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getClassChanges()).toEqual(classJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.ts')).toEqual(
            `import { Component, Injectable, ViewChild } from "@angular/core";` +
            `import { IgxGridReplace } from "../../lib/grid/grid.component";` +
            `import { IgxColumnReplace, IgxProvidedReplace, REPLACED_CONST} from "../../lib/main";\r\n` +
            `import {` +
            `    Injected,` +
            `    IgxNewable,` +
            `    ReturnType` +
            `} from "../../lib/services/index";\r\n` +
            `@Component({` +
            `    providers: [IgxProvidedReplace, RemoteService]` +
            `})` +
            `export class GridSampleComponent {` +
            `    @ViewChild("grid1", { read: IgxGridReplace }) public grid1: IgxGridReplace;` +
            `    // prop definitions to ignore:\r\n` +
            `    NotType: { NotAgain: string; extraProp: IgxNewable, IgxExcelExporterOptions: string } = {` +
            `        NotAgain: "hai",` +
            `        extraProp: new IgxNewable(),` +
            `        IgxExcelExporterOptions: "fake"` +
            `    }` +
            `    constructor(private csvExporterService: Injected) { }` +
            `    public initColumns(event: IgxColumnReplace) {` +
            `        const column: IgxColumnReplace = event;` +
            `        this.grid1.filter("ProductName", "Queso", REPLACED_CONST.contains, true);` +
            `    }` +
            `    private getOptions(fileName: string): ReturnType {` +
            `        return new IgxNewable(fileName);` +
            `    }` +
            `}`
        );

        done();
    });

    it('should move property value between element tags', done => {
        const inputJson: BindingChanges = {
            changes: [
                {
                    name: 'name',
                    moveBetweenElementTags: true,
                    conditions: ['igxIcon_is_material_name'],
                    owner: { type: 'component' as any, selector: 'igx-icon' }
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'inputs.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.callFake(() => JSON.stringify(inputJson));

        const fileContent = `<igx-icon fontSet='material' name='phone'></igx-icon>
<igx-icon fontSet="material-icons" name="build"></igx-icon>
<igx-icon name="accessory"></igx-icon>`;
        appTree.create('test.component.html', fileContent);

        const fileContent1 = `<igx-icon fontSet="material" [name]="'phone'"></igx-icon>
<igx-icon fontSet="material-icons" [name]="getName()"></igx-icon>`;
        appTree.create('test1.component.html', fileContent1);

        const update = new UnitUpdateChanges(__dirname, appTree);
        update.addCondition('igxIcon_is_material_name', () => true);

        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getInputChanges()).toEqual(inputJson);

        update.applyChanges();
        expect(appTree.readContent('test.component.html')).toEqual(
`<igx-icon fontSet='material'>phone</igx-icon>
<igx-icon fontSet="material-icons">build</igx-icon>
<igx-icon>accessory</igx-icon>`);

        expect(appTree.readContent('test1.component.html')).toEqual(
`<igx-icon fontSet="material">{{'phone'}}</igx-icon>
<igx-icon fontSet="material-icons">{{getName()}}</igx-icon>`);

        done();
    });

    it('should replace/remove inputs', done => {
        const themePropsJson: ThemePropertyChanges = {
            changes: [
                {
                    name: '$replace-me', replaceWith: '$replaced',
                    owner: 'igx-theme-func'
                },
                {
                    name: '$remove-me', remove: true,
                    owner: 'igx-theme-func'
                },
                {
                    name: '$old-prop', remove: true,
                    owner: 'igx-comp-theme'
                }
            ]
        };
        const jsonPath = path.join(__dirname, 'changes', 'theme-props.json');
        spyOn(fs, 'existsSync').and.callFake((filePath: string) => {
            if (filePath === jsonPath) {
                return true;
            }
            return false;
        });
        spyOn(fs, 'readFileSync').and.callFake(() => JSON.stringify(themePropsJson));

        const fileContent =
`$var: igx-theme-func(
    $prop1: red,
    $replace-me: 3,
    $remove-me: 0px,
    $prop2: 2
);
$var2: igx-comp-theme(
    $replace-me: not,
    $old-prop: func(val)
);

$var3: igx-comp-theme(
    $replace-me: not,
    $old-prop: func(val, 3, 4),
    $prop3: 1
);`;
        appTree.create('styles.scss', fileContent);
        appTree.create('src/app/app.component.sass', `igx-comp-theme($replace-me: not, $old-prop: 3, $prop3: 2);`);
        appTree.create('test.component.sass', `igx-theme-func($replace-me: 10px, $old-prop: 3, $prop3: 2);`);

        const update = new UnitUpdateChanges(__dirname, appTree);
        expect(fs.existsSync).toHaveBeenCalledWith(jsonPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(jsonPath, 'utf-8');
        expect(update.getThemePropChanges()).toEqual(themePropsJson);

        update.applyChanges();
        expect(appTree.readContent('styles.scss')).toEqual(
`$var: igx-theme-func(
    $prop1: red,
    $replaced: 3,
    $prop2: 2
);
$var2: igx-comp-theme(
    $replace-me: not
);

$var3: igx-comp-theme(
    $replace-me: not,
    $prop3: 1
);`);
        expect(appTree.readContent('src/app/app.component.sass')).toEqual(`igx-comp-theme($replace-me: not, $prop3: 2);`);
        expect(appTree.readContent('test.component.sass')).toEqual(`igx-theme-func($replaced: 10px, $old-prop: 3, $prop3: 2);`);
        done();
    });
});
