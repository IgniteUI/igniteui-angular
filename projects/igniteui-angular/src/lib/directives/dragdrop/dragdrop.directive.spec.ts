import { Component, DebugElement } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxDragDropModule } from './dragdrop.directive';

describe('IgxDrag', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
            ],
            imports: [
                FormsModule,
                IgxDragDropModule
            ]
        })
        .compileComponents();
    }));
});
