# IgxTextSelection

#### Category

_Directives_

## Description

Provides a way to trigger selection of text inside input elements.

## Usage
```html
<input type="text" [IgxTextSelection]="true" />
```

## API

### Inputs
| Name | Type | Description |
| :--- |:--- | :--- |
| IgxTextSelection| boolean | Determines whether the input element should be selectable through the directive.

### Accessors
| Name | Type | Description |
| :--- |:--- | :--- |
| selected | boolean | Returns whether the element is selected or not.
| nativeElement | ElementRef | Returns the nativeElement of the element where the directive was applied.

### Methods
| Name | Type | Description |
| :--- |:--- | :--- |
| trigger | void | Triggers the selection of the element.