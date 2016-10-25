# Ignite UI JS Blocks CSS Naming Convention

Ignite UI JS Blocks uses the Two Dashes style of the [BEM naming convention](https://en.bem.info/methodology/naming-convention/) for CSS classes.

Naming Convention:

ex.: `block-name__elem-name--mod-name`

 - Names are written in lower case.
 - Words within the names of BEM entities are separated by a hyphen (-).
 - An element name is separated from a block name by a double underscore (__).
 - Boolean modifiers are delimited by double hyphens (--).
 - Key-value type modifiers are not used.

**Important!** Double hyphen within the comment (--) is perceived as part of the comment and therefore its presence lead to error during document validation. [HTML5 Specification](http://www.w3.org/TR/html5/syntax.html#comments)