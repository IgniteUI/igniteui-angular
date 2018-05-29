import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
    template: `<igx-prefix-connector>suffix</igx-prefix-connector>`
})
class PrefixConnectorComponent {
}

describe('IgxPrefixConnector', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PrefixConnectorComponent
            ],
            imports: [
            ]
        })
        .compileComponents();
    }));
});
