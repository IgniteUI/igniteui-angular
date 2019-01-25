# igxAutocomplete

The `igxAutocomplete` directive provides a way to enhance a text input by showing a panel of suggested options provided by the developer.

# Usage
The simplest use-case for an end-user should be attaching the directive to an input element and providing to a template for the drop down.
```html
<input igxInput type="text" [igxAutocomplete]="townsPanel" />
<igx-drop-down #townsPanel>
    <igx-drop-down-item *ngFor="let town of towns" [value]="town">
        {{town}}
    </igx-drop-down-item>
</igx-drop-down>
```

#Features

Keyboard navigation

Selection and model binding

Enable/Disable autocomplete drop down

Compatibility support

# API Summary

Methods
| Name   |  Description |
|:----------|:------|
| `open` | list of options to choose from |
| `close` |  list of options to choose from |

Events
| Name   |  Description |
|:----------|:------|
| `onItemSelected` | list of options to choose from |


# Examples

The following sample defines autocomplete with defined filtering

```html
<igx-input-group class="group">
    <igx-prefix igxRipple><igx-icon fontSet="material">place</igx-icon> </igx-prefix>
    <input igxInput name="towns" type="text" [(ngModel)]="townSelected" required
        [igxAutocomplete]='townsPanel'/>
    <label igxLabel for="towns">Towns</label>
</igx-input-group>
<igx-drop-down #townsPanel>
    <igx-drop-down-item *ngFor="let town of towns | startsWith:townSelected" [value]="town">
        {{town}}
    </igx-drop-down-item>
</igx-drop-down>
```

```typescript
@Component({
    selector: 'app-autocomplete-sample',
    styleUrls: ['autocomplete.sample.css'],
    templateUrl: `autocomplete.sample.html`
})
export class AutocompleteSampleComponent {
    constructor() {
        this.towns = [ 'Sofia', 'Plovdiv', 'Varna', 'Burgas'];
    }
}

@Pipe({ name: 'startsWith' })
export class IgxAutocompletePipeStartsWith implements PipeTransform {
    public transform(collection: any[], term = '') {
        return collection.filter(item => item.toString().toLowerCase().startsWith(term.toString().toLowerCase());
    }
}
```