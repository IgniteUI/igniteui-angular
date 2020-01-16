import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Directionality, DIR_DOCUMENT } from './directionality';

interface FakeDoc {
    body: {dir?: string},
    documentElement: {dir?: string}
}

describe('Directionality', () => {
    let fakeDoc: FakeDoc;
    beforeEach(() => {
        fakeDoc = {body: {}, documentElement: {}};

        TestBed.configureTestingModule({
            declarations: [
                InjectsDirectionality
            ],
            providers: [{provide: DIR_DOCUMENT, useFactory: () => fakeDoc}],
        }).compileComponents();
    });

    it('should read dir from html if not specified on the body', () => {
        const expectedRes = 'rtl';
        fakeDoc.documentElement.dir = expectedRes;

        const fixture = TestBed.createComponent(InjectsDirectionality);
        const component = fixture.debugElement.componentInstance;

        expect(component.dir.value).toEqual(expectedRes);
    });

    it('should read dir from body even it is also specified on the html element', () => {
        fakeDoc.documentElement.dir = 'ltr';
        const expectedRes = 'rtl';
        fakeDoc.body.dir = expectedRes;

        const fixture = TestBed.createComponent(InjectsDirectionality);
        const component = fixture.debugElement.componentInstance;

        expect(component.dir.value).toEqual(expectedRes);
    });

    it('should default to ltr if nothing specified', () => {
        const expectedRes = 'ltr';

        const fixture = TestBed.createComponent(InjectsDirectionality);
        const component = fixture.debugElement.componentInstance;

        expect(component.dir.value).toEqual(expectedRes);
    });

    it('should default to ltr if invalid values are set both on body or html elements', () => {
        fakeDoc.documentElement.dir = 'none';
        fakeDoc.body.dir = 'irrelevant';

        const fixture =TestBed.createComponent(InjectsDirectionality);
        const component = fixture.debugElement.componentInstance;

        expect(component.dir.value).toEqual('ltr');
    });
});

@Component({
    selector: 'igx-div-element',
    template: `
        <div>element</div>
    `
})
class InjectsDirectionality {
    constructor(public dir: Directionality) { }
}

