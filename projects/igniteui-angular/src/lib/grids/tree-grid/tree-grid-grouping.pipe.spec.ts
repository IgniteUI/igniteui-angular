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
    let grid: any;

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
        grid = fix.componentInstance.treeGrid;
        groupPipe = new IgxTreeGridGroupingPipe();
        data = SampleTestData.employeeTreeDataPrimaryForeignKeyExt();
        data.forEach(element => {
            element['HireDate'] = null;
        });
    }));

    it('doesn\'t change the data when no groupingExpressions are passed.', () => {
        const result = groupPipe.transform(data, [], '', '', '', grid);
        expect(result).toEqual(data);
    });

    it('handles gracefully an empty input data', () => {
        const result = groupPipe.transform([], [], '', '', '', grid);
        expect(result).toEqual([]);
    });

    it('handles gracefully an empty input data when groupingExpressions are specified', () => {
        const groupingExpressions: IGroupingExpression[] = [
            groupingExpression('OnPTO')
        ];
        const result = groupPipe.transform([], groupingExpressions, '', '', '', grid);
        expect(result).toEqual([]);
    });

    it('groups the data properly by a single boolean field', () => {
        const groupingExpressions = [groupingExpression('OnPTO')];
        transformAndVerify(data, groupedByPTO, groupingExpressions, 'Employees', '', '', grid);
    });

    it('groups the data properly by a single number field', () => {
        const groupingExpressions =
            [groupingExpression('ParentID')];
        transformAndVerify(data, groupedByParentID, groupingExpressions, 'Employees', '', '', grid);
    });

    it('groups the data properly by a single string field', () => {
        const groupingExpressions =
            [groupingExpression('JobTitle')];
        transformAndVerify(data, groupedByJobTitle, groupingExpressions, 'Employees', '', '', grid);
    });

    it('groups the data properly by two fields.', () => {
        const groupingExpressions =
            [
                groupingExpression('OnPTO', 2),
                groupingExpression('JobTitle'),
            ];
        transformAndVerify(data, groupedByPTODescJobTitle, groupingExpressions, 'Employees', '', '', grid);
    });

    it('groups the data properly by three fields.', () => {
        const groupingExpressions =
            [
                groupingExpression('OnPTO'),
                groupingExpression('JobTitle', 2),
                groupingExpression('ParentID', 1)
            ];
        transformAndVerify(data, groupedByPTOJobDescPID, groupingExpressions, 'Employees', '', '', grid);
    });

    it('check result based on \'groupKey\' parameter.', () => {
        const groupingExpressions = [groupingExpression('OnPTO')];
        const groupKeys = [ null, undefined, 'OOF'];

        groupKeys.forEach((groupKey) => {
            const result = groupPipe.transform(data, groupingExpressions, groupKey, '', '', grid);

            expect(result[0][groupKey]).toBe('false (13)');
            expect(result[1][groupKey]).toBe('true (5)');
        });
    });

    it('check result based on \'primaryKey\' parameter.', () => {
        const groupingExpressions = [groupingExpression('OnPTO')];
        const primaryKeys = [ null, undefined, 'PK'];
        const groupKey = 'Group';

        primaryKeys.forEach((primaryKey) => {
            const result = groupPipe.transform(data, groupingExpressions, groupKey, primaryKey, '', grid);

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
            const result = groupPipe.transform(data, groupingExpressions, groupKey, primaryKey, childDataKey, grid);

            expect(result[0][childDataKey]).toBeInstanceOf(Array);
            expect(result[0][childDataKey].length).toBe(13);
            expect(result[1][childDataKey]).toBeInstanceOf(Array);
            expect(result[1][childDataKey].length).toBe(5);
        });
    });

    it('check result with aggregations.', () => {
        const groupingExpressions = [groupingExpression('OnPTO')];
        const aggregations = [{
            field: 'Age',
            aggregate: (parent: any, children: any[]) => children.map((c) => c.Age).reduce((min, c) => min < c ? min : c, new Date())
        }];

        const result = groupPipe.transform(data, groupingExpressions, 'Group', '', '', grid, aggregations);
        expect(result[0]['Age']).toEqual(25);
        expect(result[1]['Age']).toEqual(29);
    });

    describe('By Date', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            const fix = TestBed.createComponent(IgxTreeGridSimpleComponent);
            fix.detectChanges();
            tick(16);
            grid = fix.componentInstance.treeGrid;
            groupPipe = new IgxTreeGridGroupingPipe();
            data = SampleTestData.employeeTreeDataPrimaryForeignKeyExt();
            data.forEach(element => {
                element['HireDate'].toJSON = function(){
                    return this.toDateString();
                };
            });
        }));

        it('groups the data properly by a single date field', () => {
            const groupingExpressions =
                [groupingExpression('HireDate')];
            transformAndVerify(data, groupedByHireDate, groupingExpressions, 'Employees', '', '', grid);
        });
});

    const groupingExpression = (fieldName: string, dir = 1, ignoreCase = true, strategy = DefaultSortingStrategy.instance()) => (
        {fieldName, dir, ignoreCase, strategy });

    const transformAndVerify = (
        inputData: any[],
        expectedResult: string,
        groupingExpressions = [],
        groupKey: string,
        primaryKey: string,
        childDataKey: string,
        treeGrid: any,
        aggregations = []) => {

        const result = groupPipe.transform(inputData, groupingExpressions, groupKey, primaryKey, childDataKey, treeGrid, aggregations);

        expect(JSON.stringify(result)).toEqual(expectedResult);
    };

    // eslint-disable-next-line max-len
    const groupedByPTO = '[{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":null,"Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":null,"Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":null,"Age":31,"OnPTO":false,"JobTitle":"Software Developer"},{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":null,"Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"},{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":null,"Age":42,"OnPTO":false,"JobTitle":"Vice President"},{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":null,"Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"},{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":null,"OnPTO":false,"Age":39,"JobTitle":"Software Developer"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":null,"Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":null,"Age":61,"OnPTO":false,"JobTitle":"Director"},{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":null,"Age":50,"OnPTO":false,"JobTitle":"Director"},{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":null,"Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":null,"OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"},{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":null,"OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"false (13)"},{"":[{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":null,"Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"},{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":null,"Age":35,"OnPTO":true,"JobTitle":"Software Developer"},{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":null,"OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"},{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":null,"Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"},{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":null,"OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"}],"Employees":"true (5)"}]';
    // eslint-disable-next-line max-len
    const groupedByParentID = '[{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":null,"Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":null,"Age":42,"OnPTO":false,"JobTitle":"Vice President"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":null,"Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":null,"Age":61,"OnPTO":false,"JobTitle":"Director"}],"Employees":"-1 (4)"},{"":[{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":null,"Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":null,"OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":null,"OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"}],"Employees":"12 (3)"},{"":[{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":null,"Age":50,"OnPTO":false,"JobTitle":"Director"},{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":null,"OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"17 (2)"},{"":[{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":null,"Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"}],"Employees":"19 (1)"},{"":[{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":null,"Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":null,"Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":null,"Age":31,"OnPTO":false,"JobTitle":"Software Developer"}],"Employees":"147 (3)"},{"":[{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":null,"Age":35,"OnPTO":true,"JobTitle":"Software Developer"},{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":null,"Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"}],"Employees":"317 (2)"},{"":[{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":null,"OnPTO":false,"Age":39,"JobTitle":"Software Developer"}],"Employees":"663 (1)"},{"":[{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":null,"OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"},{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":null,"Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"}],"Employees":"847 (2)"}]';
    // eslint-disable-next-line max-len
    const groupedByJobTitle = '[{"":[{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":null,"Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"},{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":null,"Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"},{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":null,"Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":null,"OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"}],"Employees":"Associate Software Developer (4)"},{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":null,"Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":null,"Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":null,"Age":61,"OnPTO":false,"JobTitle":"Director"},{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":null,"Age":50,"OnPTO":false,"JobTitle":"Director"}],"Employees":"Director (4)"},{"":[{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":null,"Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"},{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":null,"OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"},{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":null,"OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"}],"Employees":"Senior Software Developer (3)"},{"":[{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":null,"Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"}],"Employees":"Senior Software Developer, TL (1)"},{"":[{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":null,"Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":null,"Age":31,"OnPTO":false,"JobTitle":"Software Developer"},{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":null,"Age":35,"OnPTO":true,"JobTitle":"Software Developer"},{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":null,"OnPTO":false,"Age":39,"JobTitle":"Software Developer"},{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":null,"OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"Software Developer (5)"},{"":[{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":null,"Age":42,"OnPTO":false,"JobTitle":"Vice President"}],"Employees":"Vice President (1)"}]';
    // eslint-disable-next-line max-len
    const groupedByPTODescJobTitle = '[{"":[{"":[{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":null,"Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"}],"Employees":"Associate Software Developer (1)"},{"":[{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":null,"OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"},{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":null,"OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"}],"Employees":"Senior Software Developer (2)"},{"":[{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":null,"Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"}],"Employees":"Senior Software Developer, TL (1)"},{"":[{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":null,"Age":35,"OnPTO":true,"JobTitle":"Software Developer"}],"Employees":"Software Developer (1)"}],"Employees":"true (5)"},{"":[{"":[{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":null,"Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"},{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":null,"Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":null,"OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"}],"Employees":"Associate Software Developer (3)"},{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":null,"Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":null,"Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":null,"Age":61,"OnPTO":false,"JobTitle":"Director"},{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":null,"Age":50,"OnPTO":false,"JobTitle":"Director"}],"Employees":"Director (4)"},{"":[{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":null,"Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"}],"Employees":"Senior Software Developer (1)"},{"":[{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":null,"Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":null,"Age":31,"OnPTO":false,"JobTitle":"Software Developer"},{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":null,"OnPTO":false,"Age":39,"JobTitle":"Software Developer"},{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":null,"OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"Software Developer (4)"},{"":[{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":null,"Age":42,"OnPTO":false,"JobTitle":"Vice President"}],"Employees":"Vice President (1)"}],"Employees":"false (13)"}]';
    // eslint-disable-next-line max-len
    const groupedByPTOJobDescPID = '[{"":[{"":[{"":[{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":null,"Age":42,"OnPTO":false,"JobTitle":"Vice President"}],"Employees":"-1 (1)"}],"Employees":"Vice President (1)"},{"":[{"":[{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":null,"OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"17 (1)"},{"":[{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":null,"Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"},{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":null,"Age":31,"OnPTO":false,"JobTitle":"Software Developer"}],"Employees":"147 (2)"},{"":[{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":null,"OnPTO":false,"Age":39,"JobTitle":"Software Developer"}],"Employees":"663 (1)"}],"Employees":"Software Developer (4)"},{"":[{"":[{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":null,"Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"}],"Employees":"317 (1)"}],"Employees":"Senior Software Developer (1)"},{"":[{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":null,"Age":55,"OnPTO":false,"JobTitle":"Director"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":null,"Age":49,"OnPTO":false,"JobTitle":"Director"},{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":null,"Age":61,"OnPTO":false,"JobTitle":"Director"}],"Employees":"-1 (3)"},{"":[{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":null,"Age":50,"OnPTO":false,"JobTitle":"Director"}],"Employees":"17 (1)"}],"Employees":"Director (4)"},{"":[{"":[{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":null,"Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"},{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":null,"OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"}],"Employees":"12 (2)"},{"":[{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":null,"Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"}],"Employees":"847 (1)"}],"Employees":"Associate Software Developer (3)"}],"Employees":"false (13)"},{"":[{"":[{"":[{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":null,"Age":35,"OnPTO":true,"JobTitle":"Software Developer"}],"Employees":"317 (1)"}],"Employees":"Software Developer (1)"},{"":[{"":[{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":null,"Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"}],"Employees":"19 (1)"}],"Employees":"Senior Software Developer, TL (1)"},{"":[{"":[{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":null,"OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"}],"Employees":"12 (1)"},{"":[{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":null,"OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"}],"Employees":"847 (1)"}],"Employees":"Senior Software Developer (2)"},{"":[{"":[{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":null,"Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"}],"Employees":"147 (1)"}],"Employees":"Associate Software Developer (1)"}],"Employees":"true (5)"}]';
    // eslint-disable-next-line max-len
    const groupedByHireDate = '[{"":[{"ID":12,"ParentID":17,"Name":"Pedro Afonso","HireDate":"Tue Dec 18 2007","Age":50,"OnPTO":false,"JobTitle":"Director"}],"Employees":"Dec 18, 2007 (1)"},{"":[{"ID":147,"ParentID":-1,"Name":"John Winchester","HireDate":"Sun Apr 20 2008","Age":55,"OnPTO":false,"JobTitle":"Director"}],"Employees":"Apr 20, 2008 (1)"},{"":[{"ID":957,"ParentID":147,"Name":"Thomas Hardy","HireDate":"Sun Jul 19 2009","Age":29,"OnPTO":true,"JobTitle":"Associate Software Developer"}],"Employees":"Jul 19, 2009 (1)"},{"":[{"ID":998,"ParentID":317,"Name":"Sven Ottlieb","HireDate":"Wed Nov 11 2009","Age":44,"OnPTO":false,"JobTitle":"Senior Software Developer"}],"Employees":"Nov 11, 2009 (1)"},{"":[{"ID":17,"ParentID":-1,"Name":"Yang Wang","HireDate":"Mon Feb 01 2010","Age":61,"OnPTO":false,"JobTitle":"Director"}],"Employees":"Feb 1, 2010 (1)"},{"":[{"ID":141,"ParentID":663,"Name":"Trevor Ashworth","HireDate":"Thu Apr 22 2010","OnPTO":false,"Age":39,"JobTitle":"Software Developer"},{"ID":99,"ParentID":12,"Name":"Francisco Chang","HireDate":"Thu Apr 22 2010","OnPTO":true,"Age":39,"JobTitle":"Senior Software Developer"},{"ID":101,"ParentID":17,"Name":"Casey Harper","HireDate":"Thu Apr 22 2010","OnPTO":false,"Age":27,"JobTitle":"Software Developer"}],"Employees":"Apr 22, 2010 (3)"},{"":[{"ID":475,"ParentID":147,"Name":"Michael Langdon","HireDate":"Sun Jul 03 2011","Age":43,"OnPTO":false,"Employees":null,"JobTitle":"Software Developer"}],"Employees":"Jul 3, 2011 (1)"},{"":[{"ID":847,"ParentID":-1,"Name":"Ana Sanders","HireDate":"Sat Feb 22 2014","Age":42,"OnPTO":false,"JobTitle":"Vice President"},{"ID":19,"ParentID":-1,"Name":"Victoria Lincoln","HireDate":"Sat Feb 22 2014","Age":49,"OnPTO":false,"JobTitle":"Director"}],"Employees":"Feb 22, 2014 (2)"},{"":[{"ID":225,"ParentID":847,"Name":"Laurence Johnson","HireDate":"Sun May 04 2014","OnPTO":true,"Age":44,"JobTitle":"Senior Software Developer"},{"ID":15,"ParentID":19,"Name":"Antonio Moreno","HireDate":"Sun May 04 2014","Age":44,"OnPTO":true,"Employees":[],"JobTitle":"Senior Software Developer, TL"}],"Employees":"May 4, 2014 (2)"},{"":[{"ID":317,"ParentID":147,"Name":"Monica Reyes","HireDate":"Thu Sep 18 2014","Age":31,"OnPTO":false,"JobTitle":"Software Developer"}],"Employees":"Sep 18, 2014 (1)"},{"":[{"ID":711,"ParentID":317,"Name":"Roland Mendel","HireDate":"Sat Oct 17 2015","Age":35,"OnPTO":true,"JobTitle":"Software Developer"}],"Employees":"Oct 17, 2015 (1)"},{"":[{"ID":663,"ParentID":847,"Name":"Elizabeth Richards","HireDate":"Sat Dec 09 2017","Age":25,"OnPTO":false,"JobTitle":"Associate Software Developer"},{"ID":109,"ParentID":12,"Name":"Patricio Simpson","HireDate":"Sat Dec 09 2017","Age":25,"OnPTO":false,"Employees":[],"JobTitle":"Associate Software Developer"}],"Employees":"Dec 9, 2017 (2)"},{"":[{"ID":299,"ParentID":12,"Name":"Peter Lewis","HireDate":"Wed Apr 18 2018","OnPTO":false,"Age":25,"JobTitle":"Associate Software Developer"}],"Employees":"Apr 18, 2018 (1)"}]';
});
