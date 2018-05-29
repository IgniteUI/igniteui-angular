import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
    template: `<igx-suffix-connector>suffix</igx-suffix-connector>`
})
class SuffixConnectorComponent {
}

describe('IgxSuffixConnector', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SuffixConnectorComponent
            ],
            imports: [
            ]
        })
        .compileComponents();
    }));
});
