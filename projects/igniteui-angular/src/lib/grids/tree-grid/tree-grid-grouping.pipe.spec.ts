import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DefaultSortingStrategy } from 'igniteui-angular';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxTreeGridSimpleComponent } from '../../test-utils/tree-grid-components.spec';
import { IgxTreeGridGroupingPipe } from './tree-grid.grouping.pipe';
import { IgxTreeGridModule } from './public_api';


describe('TreeGrid Grouping Pipe', () => {
    configureTestSuite();
    let groupPipe: any;
    let data: any[];

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSimpleComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));


    beforeEach(fakeAsync(/** height/width setter rAF */() => {
        const fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
        fix.detectChanges();
        tick(16);
        const grid = fix.componentInstance.treeGrid;
        groupPipe = new IgxTreeGridGroupingPipe(grid.gridAPI);
        data = SampleTestData.employeeTreeDataPrimaryForeignKeyExt();
    }));

    it('doesn\'t change the data when no groupingExpressions are passed.', () => {
        const result = groupPipe.transform(data, [], '', '', '');
        expect(result).toEqual(data);
    });

    it('handles gracefully an empty input data', () => {
        const result = groupPipe.transform([], [], '', '', '');
        expect(result).toEqual([]);
    });

    it('handles gracefully an empty input data when groupingExpressions are specified', () => {
        const groupingExpressions: IGroupingExpression[] = [
            groupingExpression('OnPTO')
        ];
        const result = groupPipe.transform([], groupingExpressions, '', '', '');
        expect(result).toEqual([]);
    });

    it('groups the data properly by a single boolean field', () => {
        const groupingExpressions = [groupingExpression('OnPTO')];
        transformAndVerify(data, groupedByPTO, groupingExpressions, 'Employees');
    });

    it('groups the data properly by a single number field', () => {
        const groupingExpressions =
            [groupingExpression('ParentID')];
        transformAndVerify(data, groupedByParentID, groupingExpressions, 'Employees');
    });

    it('groups the data properly by a single date field', () => {
        pending('The pipe doesn\'t handle date values well!');
        const groupingExpressions =
            [groupingExpression('HireDate')];
        transformAndVerify(data, groupedByParentID, groupingExpressions, 'Employees');
    });

    it('groups the data properly by a single string field', () => {
        const groupingExpressions =
            [groupingExpression('JobTitle')];
        transformAndVerify(data, groupedByJobTitle, groupingExpressions, 'Employees');
    });

    it('groups the data properly by two fields.', () => {
        const groupingExpressions =
            [
                groupingExpression('OnPTO', 2),
                groupingExpression('JobTitle'),
            ];
        transformAndVerify(data, groupedByPTODescJobTitle, groupingExpressions, 'Employees');
    });

    it('groups the data properly by three fields.', () => {
        const groupingExpressions =
            [
                groupingExpression('OnPTO'),
                groupingExpression('JobTitle', 2),
                groupingExpression('ParentID', 1)
            ];
        transformAndVerify(data, groupedByPTOJobDescPID, groupingExpressions, 'Employees');
    });

    it('check result based on \'groupKey\' parameter.', () => {
        const groupingExpressions = [groupingExpression('OnPTO')];
        const groupKeys = [ null, undefined, 'OOF'];

        groupKeys.forEach((groupKey) => {
            const result = groupPipe.transform(data, groupingExpressions, groupKey, '', '');

            expect(result[0][groupKey]).toBe('false (13)');
            expect(result[1][groupKey]).toBe('true (5)');
        });
    });

    it('check result based on \'primaryKey\' parameter.', () => {
        const groupingExpressions = [groupingExpression('OnPTO')];
        const primaryKeys = [ null, undefined, 'PK'];
        const groupKey = 'Group';

        primaryKeys.forEach((primaryKey) => {
            const result = groupPipe.transform(data, groupingExpressions, groupKey, primaryKey, '');

            expect(result[0][primaryKey]).toBe('false');
            expect(result[1][primaryKey]).toBe('true');
        });
    });

    it('check result based on \'childDataKey\' parameter.', () => {
        const groupingExpressions = [groupingExpression('OnPTO')];
        const childDataKeys = [ null, undefined, 'CK'];
        const groupKey = 'Group';
        const primaryKey = 'PK';

        childDataKeys.forEach((childDataKey) => {
            const result = groupPipe.transform(data, groupingExpressions, groupKey, primaryKey, childDataKey);

            expect(result[0][childDataKey]).toBeInstanceOf(Array);
            expect(result[0][childDataKey].length).toBe(13);
            expect(result[1][childDataKey]).toBeInstanceOf(Array);
            expect(result[1][childDataKey].length).toBe(5);
        });
    });

    it('check result with aggregations.', () => {
        const groupingExpressions = [groupingExpression('OnPTO')];
        const aggregations = [{
            field: 'HireDate',
            aggregate: (parent: any, children: any[]) => children.map((c) => c.HireDate).reduce((min, c) => min < c ? min : c, new Date())
        }];

        const result = groupPipe.transform(data, groupingExpressions, 'Group', '', '', aggregations);

        expect(result[0]['HireDate']).toEqual(new Date('2007-12-17T22:00:00.000Z'));
        expect(result[1]['HireDate']).toEqual(new Date('2009-07-18T21:00:00.000Z'));
    });

    const groupingExpression = (fieldName: string, dir = 1, ignoreCase = true, strategy = DefaultSortingStrategy.instance()) => (
        {fieldName, dir, ignoreCase, strategy });

    const transformAndVerify = (
        inputData: any[],
        expectedResult: string,
        groupingExpressions = [],
        groupKey = '',
        primaryKey = '',
        childDataKey = '',
        aggregations = []) => {

        const result = groupPipe.transform(inputData, groupingExpressions, groupKey, primaryKey, childDataKey, aggregations);

        expect(JSON.stringify(result)).toEqual(expectedResult);
    };

    // eslint-disable-next-line max-len
    const groupedByPTO = '[{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":"2008-04-19T21:00:00.000Z","Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":"2011-07-02T21:00:00.000Z","Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":"2014-09-17T21:00:00.000Z","Age":31,"OnPTO":false,"JobTitle":"Software Developer"},{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":"2009-11-10T22:00:00.000Z","Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"},{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":"2014-02-21T22:00:00.000Z","Age":42,"OnPTO":false,"JobTitle":"Vice President"},{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"},{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":39,"JobTitle":"Software Developer"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":"2014-02-21T22:00:00.000Z","Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":"2010-01-31T22:00:00.000Z","Age":61,"OnPTO":false,"JobTitle":"Director"},{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":"2007-12-17T22:00:00.000Z","Age":50,"OnPTO":false,"JobTitle":"Director"},{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":"2018-04-17T21:00:00.000Z","OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"},{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"false (13)"},{"":[{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":"2009-07-18T21:00:00.000Z","Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"},{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":"2015-10-16T21:00:00.000Z","Age":35,"OnPTO":true,"JobTitle":"Software Developer"},{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":"2014-05-03T21:00:00.000Z","OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"},{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":"2014-05-03T21:00:00.000Z","Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"},{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"}],"Employees":"true (5)"}]';
    // eslint-disable-next-line max-len
    const groupedByParentID = '[{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":"2008-04-19T21:00:00.000Z","Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":"2014-02-21T22:00:00.000Z","Age":42,"OnPTO":false,"JobTitle":"Vice President"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":"2014-02-21T22:00:00.000Z","Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":"2010-01-31T22:00:00.000Z","Age":61,"OnPTO":false,"JobTitle":"Director"}],"Employees":"-1 (4)"},{"":[{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":"2018-04-17T21:00:00.000Z","OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"}],"Employees":"12 (3)"},{"":[{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":"2007-12-17T22:00:00.000Z","Age":50,"OnPTO":false,"JobTitle":"Director"},{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"17 (2)"},{"":[{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":"2014-05-03T21:00:00.000Z","Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"}],"Employees":"19 (1)"},{"":[{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":"2011-07-02T21:00:00.000Z","Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":"2009-07-18T21:00:00.000Z","Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":"2014-09-17T21:00:00.000Z","Age":31,"OnPTO":false,"JobTitle":"Software Developer"}],"Employees":"147 (3)"},{"":[{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":"2015-10-16T21:00:00.000Z","Age":35,"OnPTO":true,"JobTitle":"Software Developer"},{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":"2009-11-10T22:00:00.000Z","Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"}],"Employees":"317 (2)"},{"":[{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":39,"JobTitle":"Software Developer"}],"Employees":"663 (1)"},{"":[{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":"2014-05-03T21:00:00.000Z","OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"},{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"}],"Employees":"847 (2)"}]';
    // eslint-disable-next-line max-len
    const groupedByJobTitle = '[{"":[{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":"2009-07-18T21:00:00.000Z","Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"},{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"},{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":"2018-04-17T21:00:00.000Z","OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"}],"Employees":"Associate Software Developer (4)"},{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":"2008-04-19T21:00:00.000Z","Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":"2014-02-21T22:00:00.000Z","Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":"2010-01-31T22:00:00.000Z","Age":61,"OnPTO":false,"JobTitle":"Director"},{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":"2007-12-17T22:00:00.000Z","Age":50,"OnPTO":false,"JobTitle":"Director"}],"Employees":"Director (4)"},{"":[{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":"2009-11-10T22:00:00.000Z","Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"},{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":"2014-05-03T21:00:00.000Z","OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"},{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"}],"Employees":"Senior Software Developer (3)"},{"":[{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":"2014-05-03T21:00:00.000Z","Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"}],"Employees":"Senior Software Developer, TL (1)"},{"":[{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":"2011-07-02T21:00:00.000Z","Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":"2014-09-17T21:00:00.000Z","Age":31,"OnPTO":false,"JobTitle":"Software Developer"},{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":"2015-10-16T21:00:00.000Z","Age":35,"OnPTO":true,"JobTitle":"Software Developer"},{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":39,"JobTitle":"Software Developer"},{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"Software Developer (5)"},{"":[{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":"2014-02-21T22:00:00.000Z","Age":42,"OnPTO":false,"JobTitle":"Vice President"}],"Employees":"Vice President (1)"}]';
    // eslint-disable-next-line max-len
    const groupedByPTODescJobTitle = '[{"":[{"":[{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":"2009-07-18T21:00:00.000Z","Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"}],"Employees":"Associate Software Developer (1)"},{"":[{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":"2014-05-03T21:00:00.000Z","OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"},{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"}],"Employees":"Senior Software Developer (2)"},{"":[{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":"2014-05-03T21:00:00.000Z","Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"}],"Employees":"Senior Software Developer, TL (1)"},{"":[{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":"2015-10-16T21:00:00.000Z","Age":35,"OnPTO":true,"JobTitle":"Software Developer"}],"Employees":"Software Developer (1)"}],"Employees":"true (5)"},{"":[{"":[{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"},{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":"2018-04-17T21:00:00.000Z","OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"}],"Employees":"Associate Software Developer (3)"},{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":"2008-04-19T21:00:00.000Z","Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":"2014-02-21T22:00:00.000Z","Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":"2010-01-31T22:00:00.000Z","Age":61,"OnPTO":false,"JobTitle":"Director"},{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":"2007-12-17T22:00:00.000Z","Age":50,"OnPTO":false,"JobTitle":"Director"}],"Employees":"Director (4)"},{"":[{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":"2009-11-10T22:00:00.000Z","Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"}],"Employees":"Senior Software Developer (1)"},{"":[{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":"2011-07-02T21:00:00.000Z","Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":"2014-09-17T21:00:00.000Z","Age":31,"OnPTO":false,"JobTitle":"Software Developer"},{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":39,"JobTitle":"Software Developer"},{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"Software Developer (4)"},{"":[{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":"2014-02-21T22:00:00.000Z","Age":42,"OnPTO":false,"JobTitle":"Vice President"}],"Employees":"Vice President (1)"}],"Employees":"false (13)"}]';
    // eslint-disable-next-line max-len
    const groupedByPTOJobDescPID = '[{"":[{"":[{"":[{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":"2014-02-21T22:00:00.000Z","Age":42,"OnPTO":false,"JobTitle":"Vice President"}],"Employees":"-1 (1)"}],"Employees":"Vice President (1)"},{"":[{"":[{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"17 (1)"},{"":[{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":"2011-07-02T21:00:00.000Z","Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":"2014-09-17T21:00:00.000Z","Age":31,"OnPTO":false,"JobTitle":"Software Developer"}],"Employees":"147 (2)"},{"":[{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":false,"Age":39,"JobTitle":"Software Developer"}],"Employees":"663 (1)"}],"Employees":"Software Developer (4)"},{"":[{"":[{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":"2009-11-10T22:00:00.000Z","Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"}],"Employees":"317 (1)"}],"Employees":"Senior Software Developer (1)"},{"":[{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":"2008-04-19T21:00:00.000Z","Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":"2014-02-21T22:00:00.000Z","Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":"2010-01-31T22:00:00.000Z","Age":61,"OnPTO":false,"JobTitle":"Director"}],"Employees":"-1 (3)"},{"":[{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":"2007-12-17T22:00:00.000Z","Age":50,"OnPTO":false,"JobTitle":"Director"}],"Employees":"17 (1)"}],"Employees":"Director (4)"},{"":[{"":[{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":"2018-04-17T21:00:00.000Z","OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"}],"Employees":"12 (2)"},{"":[{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":"2017-12-08T22:00:00.000Z","Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"}],"Employees":"847 (1)"}],"Employees":"Associate Software Developer (3)"}],"Employees":"false (13)"},{"":[{"":[{"":[{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":"2015-10-16T21:00:00.000Z","Age":35,"OnPTO":true,"JobTitle":"Software Developer"}],"Employees":"317 (1)"}],"Employees":"Software Developer (1)"},{"":[{"":[{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":"2014-05-03T21:00:00.000Z","Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"}],"Employees":"19 (1)"}],"Employees":"Senior Software Developer, TL (1)"},{"":[{"":[{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":"2010-04-21T21:00:00.000Z","OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"}],"Employees":"12 (1)"},{"":[{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":"2014-05-03T21:00:00.000Z","OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"}],"Employees":"847 (1)"}],"Employees":"Senior Software Developer (2)"},{"":[{"":[{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":"2009-07-18T21:00:00.000Z","Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"}],"Employees":"147 (1)"}],"Employees":"Associate Software Developer (1)"}],"Employees":"true (5)"}]';
});
