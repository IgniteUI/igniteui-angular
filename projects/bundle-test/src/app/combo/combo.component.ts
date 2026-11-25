import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IgxSimpleComboComponent } from 'igniteui-angular/simple-combo';

@Component({
    selector: 'app-combo',
    imports: [IgxComboComponent, IgxSimpleComboComponent],
    templateUrl: './combo.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./combo.component.scss']
})
export class ComboComponent {
    protected cities = [
        { id: 1, name: 'Sofia' },
        { id: 2, name: 'Plovdiv' },
        { id: 3, name: 'Varna' }
    ];
}
