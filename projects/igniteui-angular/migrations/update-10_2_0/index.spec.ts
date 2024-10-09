import * as path from 'path';

import {
    SchematicTestRunner,
    UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 10.2.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner(
        'ig-migrate',
        path.join(__dirname, '../migration-collection.json')
    );

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should remove the type property if the value is not a valid type', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            // eslint-disable-next-line max-len
            `<igx-input-group type="line"></igx-input-group><igx-input-group type="box"></igx-input-group><igx-input-group type="border"></igx-input-group><igx-input-group type="search"></igx-input-group><igx-input-group type="bootstrap"></igx-input-group><igx-input-group type="fluent"></igx-input-group><igx-input-group type="fluent_search"></igx-input-group><igx-input-group type="indigo"></igx-input-group><igx-input-group type='bootstrap'></igx-input-group><igx-input-group type='fluent'></igx-input-group><igx-input-group type='fluent_search'></igx-input-group><igx-input-group type='indigo'></igx-input-group>`
        );

        const tree = await schematicRunner
            .runSchematic('migration-17', {}, appTree);
        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        // eslint-disable-next-line max-len
        ).toEqual(`<igx-input-group type="line"></igx-input-group><igx-input-group type="box"></igx-input-group><igx-input-group type="border"></igx-input-group><igx-input-group type="search"></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group>`);
    });

    it('Should remove references to deprecated `pane` property of `IExpansionPanelEventArgs`', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/expansion-test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
import { IExpansionPanelEventArgs, IgxExpansionPanelComponent } from 'igniteui-angular';

@Component({
    selector: 'app-expansion-test',
    templateUrl: './expansion-test.component.html',
    styleUrls: ['./expansion-test.component.scss']
})
export class ExpansionTestComponent {

    @ViewChild(IgxExpansionPanelComponent, { static: true })
    public panel: IgxExpansionPanelComponent;

    public onPanelOpened(event: IExpansionPanelEventArgs) {
        console.log(event.panel);
    }
}`
        );
        const tree = await schematicRunner
            .runSchematic('migration-17', {}, appTree);
        const expectedContent =  `import { Component, ViewChild } from '@angular/core';
import { IExpansionPanelEventArgs, IgxExpansionPanelComponent } from 'igniteui-angular';

@Component({
    selector: 'app-expansion-test',
    templateUrl: './expansion-test.component.html',
    styleUrls: ['./expansion-test.component.scss']
})
export class ExpansionTestComponent {

    @ViewChild(IgxExpansionPanelComponent, { static: true })
    public panel: IgxExpansionPanelComponent;

    public onPanelOpened(event: IExpansionPanelEventArgs) {
        console.log(event.owner);
    }
}`;
        expect(
                tree.readContent('/testSrc/appPrefix/component/expansion-test.component.ts')
            ).toEqual(expectedContent);
    });
});
