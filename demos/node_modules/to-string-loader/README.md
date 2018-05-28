# to-string loader for webpack

## Usage

```js
let output = require('to-string!css!sass!./my.scss');
// => returns sass rendered to CSS a string
```

Don't forget to polyfill `require` if you want to use it in node.

See `webpack` documentation.

## Use Case

If you setup a SASS loader:

```js
{
    test: /\.scss$/,
    loaders: [
        'css',
        'sass'
    ]
},
```

then `require('./my.scss')` will return an `Array` object:

```
0: Array[3]
    0: 223
    1: "html,↵body,↵ol,↵ul,↵li,↵p { margin: 0; padding: 0; }↵"
    2: ""
    length: 3
i: (modules, mediaQuery) { .. }
length: 1
toString: toString()
```

In some cases (e.g. Angular2 [@View styles definition](https://github.com/angular/angular/blob/2e4a2a0e5a2fb5b5c531f16db88d00423ea582fc/modules/angular2/src/core/annotations_impl/view.ts#L58)) you need to have style as a string.

You can cast the require output to a string, e.g.

```js
@View({
    directives: [RouterOutlet, RouterLink],
    template: require('./app.html'),
    styles: [
        require('./app.scss').toString()
    ]
})
```

or you can use `to-string` loader that will do that for you:

```js
{
    test: /\.scss$/,
    loaders: [
        'to-string',
        'css',
        'sass'
    ]
},
```
