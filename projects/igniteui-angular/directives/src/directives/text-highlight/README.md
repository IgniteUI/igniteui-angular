# IgxTextHighlightDirective

#### Category
_Directives_

## Description

Provides a way to highlight text elements.

## Usage

```html
<div igxTextHighlight id="content" [cssClass]="highlightClass" [activeCssClass]="activeHighlightClass" [groupName]="groupName" [value]="html" [column]="0" [row]="0" [page]="0">
            {{html}}
</div>
```

## API

### Inputs
| Name | Type | Description |
| :--- |:--- | :--- |
| cssClass| string | Determines the CSS class of the highlight elements, allowing the developer to provide custom CSS to customize the highlight. |
| activeCssClass | string | Determines the CSS class of the active highlight element, allowing the developer to provide custom CSS to customize the active highlight.
| groupName | string | Identifies the highlight within a unique group, allowing to have several different highlight groups each having their own active highlight.
| value | any | The underlying value of the element that will be highlighted |
| row | number | The index of the row on which the directive is currently on |
| column | number | The index of the column on which the directive is currently on |
| page | number | The index of the page on which the directive is currently on (used when the component containing the directive supports paging) |

### Methods
| Name | Type | Arguments | Description |
| :--- |:--- | :--- | :--- |
| highlight | number | The text that should be highlighted and, optionally, if the search should be case sensitive and/or an exact match (both default to false if they aren't specified). | Clears the existing highlight and highlight the searched text. Returns how many times the element contains the searched text. |
| clearHighlight | void | N/A | Clears any existing highlight |
| activateIfNecessary | void | N/A | Activates the highlight if it is on the currently active row, column and page |
| setActiveHighlight (static)| void| The highlight group, the column, row and page of the directive and the index of the highlight | Activates the highlight at a given index (if such highlight exists) |
