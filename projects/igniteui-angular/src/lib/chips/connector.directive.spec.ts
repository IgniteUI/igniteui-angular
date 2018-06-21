import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
    template: `<igx-connector>connector</igx-connector>`
})
class ConnectorComponent {
}

describe('IgxConnector', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ConnectorComponent
            ],
            imports: [
            ]
        })
        .compileComponents();
    }));
});
