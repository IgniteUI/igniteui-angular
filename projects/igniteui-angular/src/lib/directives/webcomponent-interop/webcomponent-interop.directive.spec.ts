import { Component, forwardRef, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { configureTestSuite } from '../../test-utils/configure-suite';
import { IgxWebComponentInteropDirective, IgxWebComponentInteropModule } from './webcomponent-interop.directive';

describe('IgxWebComponentInteropDirective - ', () => {

    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxWebComponentInteropDirective
            ],
            imports: [IgxWebComponentInteropModule]
        }).compileComponents();

    }));

    describe('ValueAccessor Unit', () => {


        it('Should correctly implement interface methods', () => {


        });
    });
});

