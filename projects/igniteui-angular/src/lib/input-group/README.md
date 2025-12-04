# igx-input-group

#### Category
_Components_

## Description
_igx-input-group represents a input field._
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input-group)

## Usage
```html
<igx-input-group>
    <igx-prefix>+359</igx-prefix>
    <label igxLabel for="phone">Phone</label>
    <input igxInput name="phone" type="text" [(ngModel)]="user.phone" />
    <igx-suffix>
        <igx-icon>phone</igx-icon>
    </igx-suffix>
</igx-input-group>
```

### Elements
The following directives could be wrapped in an <igx-input-group> container - igxInput, igxLabel, igxPrefix, igxSuffix or igxHint.

#### Prefix & Suffix
Both directives can contain html elements, strings, icons or even other components. Let's add a new input field with string prefix (+359) and igxIcon suffix (<igx-icon>phone</igx-icon>)

#### Hints
Ignite UI for Angular Hint provides a helper text placed below the input. The hint can be placed at the start or at the end of the input. The position of the igxHint can be set using the position property. Let's add a hint to our phone input:

```html
<igx-input-group>
    <igx-prefix>+359</igx-prefix>
    <label igxLabel for="phone">Phone</label>
    <input igxInput name="phone" type="text" [(ngModel)]="user.phone" />
    <igx-suffix>
        <igx-icon>phone</igx-icon>
    </igx-suffix>
    <igx-hint position="start">Ex.: +359 888 123 456</igx-hint>
</igx-input-group>
```


## API

### Inputs

| Name | Description |
| :--- | :--- |
| type | How the input will be styled. The allowed values are line, box, border and search. The default is line.|
| theme | Allows the user to change the theme of the input group. |
| position | **`Hint` API**. Where the hint will be placed. The allowed values are start and end. The default value is start. |


### Methods

| Name | Description |
| :--- | :--- |
| isTypeLine()      | Whether the `igxInputGroup` type is line  |
| isTypeBox()       | Whether the igxInputGroup type is box     |
| isTypeBorder()    | Whether the igxInputGroup type is border  |
| isTypeSearch()	| Whether the igxInputGroup type is search. |
