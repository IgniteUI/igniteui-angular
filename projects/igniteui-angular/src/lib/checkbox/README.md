# igx-checkbox

`igx-checkbox` is a selection component that allows users to make a binary choice for a certain condition. It behaves similar to the native browser checkbox.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/checkbox.html)

# Usage

Basic usage of `igx-checkbox`

```html
<ul>
    <li *ngFor="let task of tasks">
        <igx-checkbox [checked]="task.done" (change)="handler($event)">
            {{ task.description }}
        </igx-checkbox>
    </li>
</ul>
```

You can easily use it within forms with `[(ngModel)]`

```html
<form (submit)="saveForm()">
    <div *ngIf="order.items">
        <div *ngFor="let item of order.items">
            <igx-checkbox [disabled]="order.completed || order.canceled"
                         [checked]="order.completed"
                         [(ngModel)]="item.completed">
                {{ item.description }
            </igx-checkbox>
        </div>
    </div>
</form>
```

### Checkbox Label

The checkbox label is set to anything passed between the opening and closing tags of the `<igx-checkbox>` component.

The position of the label can be set to either `before` or `after`(default) the actual checkbox using the `labelPosition` input property. For instance, to set the label position ___before___ the checkbox:

```html
<igx-checkbox labelPosition="before">Label</igx-checkbox>
```

### Indeterminate State

The checkbox component supports an indeterminate state, which behaves the same as the native [indeterminate state](https://developer.mozilla.org/en-US/docs/Web/CSS/:indeterminate) of an input of type checkbox.
To set the indeterminate state for an `igx-checkbox`, do:

```html
<igx-checkbox [indeterminate]="'true'">Label</igx-checkbox>
```

### Ripple Touch Feedback

The `igx-checkbox` is styled according to the Google's Material spec, and provides a ripple effect around the checkbox when the checkbox is clicked/tapped.
To disable the ripple effect, do:

```html
<igx-checkbox [disableRipple]="'true'"></igx-checkbox>
```

## API

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `@Input()` id |    string   | The unique `id` attribute to be used for the checkbox. If you do not provide a value, it will be auto-generated. |
| `@Input()` labelId |    string   | The unique `id` attribute to be used for the checkbox label. If you do not provide a value, it will be auto-generated. |
| `@Input()` name |  string | The `name` attribute to be used for the checkbox. |
| `@Input()` value | any | The value to be set for the checkbox. |
| `@Input()` tabindex | number | Specifies the tabbing order of the checkbox. |
| `@Input()` checked | boolean | Specifies the checked state of the checkbox. |
| `@Input()` indeterminate | boolean | Specifies the indeterminate state of the checkbox. |
| `@Input()` required | boolean | Specifies the required state of the checkbox. |
| `@Input()` disabled | boolean | Specifies the disabled state of the checkbox. |
| `@Input()` disableRipple | boolean | Specifies whether the ripple effect should be disabled for the checkbox. |
| `@Input()` disableTransitions | boolean | Specifies whether CSS transitions should be disabled for the checkbox. |
| `@Input()` labelPosition | string `|` enum LabelPosition | Specifies the position of the text label relative to the checkbox element. |
| `@Input("aria-labelledby")` ariaLabelledBy | string | Specify an external element by id to be used as label for the checkbox. |
| `@Output()` change | EventEmitter<IChangeCheckboxEventArgs> | Emitted when the checkbox checked value changes. |

### Methods

| toggle |
|:----------|
| Toggles the checked state of the checkbox. |
