import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { Component } from '@angular/core';
import { IgxDirectionality, DIR_DOCUMENT } from './directionality';
import { DOCUMENT } from '@angular/common';

interface FakeDoc {
    body: { dir?: string };
    documentElement: { dir?: string };
}

describe('IgxDirectionality', () => {
    describe('DI', () => {
        beforeAll(waitForAsync(() =>
            TestBed.configureTestingModule({
    imports: [InjectsIgxDirectionalityComponent]
}).compileComponents()
        ));

        it('should inject the document through the injectionToken properly', () => {
            const injectionToken = TestBed.inject(DIR_DOCUMENT);
            const document = TestBed.inject(DOCUMENT);

            expect(injectionToken).toEqual(document);
            expect(injectionToken).toEqual(jasmine.any(Document));
            expect(document).toBeTruthy(jasmine.any(Document));
        });

        it('should read dir from html if not specified on the body', inject([DOCUMENT], () => {
            const fixture = TestBed.createComponent(InjectsIgxDirectionalityComponent);
            const component = fixture.debugElement.componentInstance;

            expect(component.dir.document).not.toBeNull();
            expect(component.dir.document).not.toBeUndefined();
            expect(component.dir.document).toEqual(jasmine.any(Document));
        }));

    });

    describe('RLT, LTR', () => {
        let fakeDoc: FakeDoc;
        beforeEach(() => {
            fakeDoc = {body: {}, documentElement: {}};
        });

        let expectedRes: string;
        let dirInstance: IgxDirectionality;
        it('should read dir from html if not specified on the body', () => {
            expectedRes = 'rtl';
            fakeDoc.documentElement.dir = expectedRes;

            dirInstance = new IgxDirectionality(fakeDoc);
            expect(dirInstance.value).toEqual(expectedRes);
        });
        it('should read dir from body even it is also specified on the html element', () => {
            fakeDoc.documentElement.dir = 'ltr';
            expectedRes = 'rtl';
            fakeDoc.body.dir = expectedRes;

            dirInstance = new IgxDirectionality(fakeDoc);
            expect(dirInstance.value).toEqual(expectedRes);
        });

        it('should default to ltr if nothing specified', () => {
            expectedRes = 'ltr';

            dirInstance = new IgxDirectionality(fakeDoc);
            expect(dirInstance.value).toEqual(expectedRes);
        });

        it('should default to ltr if invalid values are set both on body or html elements', () => {
            fakeDoc.documentElement.dir = 'none';
            fakeDoc.body.dir = 'irrelevant';

            dirInstance = new IgxDirectionality(fakeDoc);
            expect(dirInstance.value).toEqual('ltr');
        });
    });
});

@Component({
    selector: 'igx-div-element',
    template: `
        <div>element</div>
    `,
    standalone: true
})
class InjectsIgxDirectionalityComponent {
    constructor(public dir: IgxDirectionality) { }
}
