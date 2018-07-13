import { Component, DebugElement } from '@angular/core';
import { async, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxAvatarComponent, IgxAvatarModule } from '../../avatar/avatar.component';
import { IgxDragDropModule, RestrictDrag } from './dragdrop.directive';

describe('IgxDrag', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
            ],
            imports: [
                FormsModule,
                IgxAvatarModule,
                IgxDragDropModule
            ]
        })
        .compileComponents();
    }));
});
