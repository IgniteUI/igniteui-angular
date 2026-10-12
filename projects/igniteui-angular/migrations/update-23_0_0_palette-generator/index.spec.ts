import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '23.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const testFilePath = `/testSrc/appPrefix/component/test.component.scss`;

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-63';

    const migrate = async (content: string, filePath = testFilePath): Promise<string> => {
        appTree.create(filePath, content);
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);
        return tree.readContent(filePath);
    };

    it('should pin a palette call on one line to the legacy generator', async () => {
        expect(await migrate(
            `$my-palette: palette($primary: red, $secondary: blue, $surface: white);`
        )).toEqual(
            `$my-palette: palette($primary: red, $secondary: blue, $surface: white, $generator: 'legacy');`
        );
    });

    it('should pin a palette call with positional arguments', async () => {
        expect(await migrate(
            `$my-palette: palette(#09f, #df1b74, #fff);`
        )).toEqual(
            `$my-palette: palette(#09f, #df1b74, #fff, $generator: 'legacy');`
        );
    });

    it('should add the generator on its own line to a palette call with one argument per line', async () => {
        expect(await migrate(
            `$my-palette: palette(
    $primary: red,
    $secondary: blue,
    $surface: white
);`
        )).toEqual(
            `$my-palette: palette(
    $primary: red,
    $secondary: blue,
    $surface: white,
    $generator: 'legacy'
);`
        );
    });

    it('should keep a trailing comma', async () => {
        expect(await migrate(
            `$my-palette: palette(
    $primary: red,
    $secondary: blue,
    $surface: white,
);`
        )).toEqual(
            `$my-palette: palette(
    $primary: red,
    $secondary: blue,
    $surface: white,
    $generator: 'legacy',
);`
        );
    });

    it('should keep a comment that closes the last argument line on that argument', async () => {
        expect(await migrate(
            `$my-palette: palette(
    $primary: red,
    $secondary: blue,
    $surface: white // the page (and cards)
);`
        )).toEqual(
            `$my-palette: palette(
    $primary: red,
    $secondary: blue,
    $surface: white, // the page (and cards)
    $generator: 'legacy'
);`
        );
    });

    it('should add the generator when the closing bracket follows the last argument', async () => {
        expect(await migrate(
            `$my-palette: palette(
    $primary: red,
    $secondary: blue,
    $surface: white);`
        )).toEqual(
            `$my-palette: palette(
    $primary: red,
    $secondary: blue,
    $surface: white,
    $generator: 'legacy');`
        );
    });

    it('should keep Windows line endings', async () => {
        expect(await migrate(
            `$my-palette: palette(\r\n    $primary: red,\r\n    $secondary: blue,\r\n    $surface: white\r\n);`
        )).toEqual(
            `$my-palette: palette(\r\n    $primary: red,\r\n    $secondary: blue,\r\n    $surface: white,\r\n    $generator: 'legacy'\r\n);`
        );
    });

    it('should pin namespaced palette calls', async () => {
        expect(await migrate(
            `@use "igniteui-angular/theming" as igx;
$my-palette: igx.palette($primary: red, $secondary: blue, $surface: white);`
        )).toEqual(
            `@use "igniteui-angular/theming" as igx;
$my-palette: igx.palette($primary: red, $secondary: blue, $surface: white, $generator: 'legacy');`
        );
    });

    it('should pin palette calls nested in other calls and leave the palette mixin alone', async () => {
        expect(await migrate(
            `@include palette($my-palette);
@include palette(palette(red, blue, white));
@include theme($palette: palette(red, blue, white), $schema: $light-material-schema);
.dark { @include igx.palette(igx.palette(red, blue, #222)); }`
        )).toEqual(
            `@include palette($my-palette);
@include palette(palette(red, blue, white, $generator: 'legacy'));
@include theme($palette: palette(red, blue, white, $generator: 'legacy'), $schema: $light-material-schema);
.dark { @include igx.palette(igx.palette(red, blue, #222, $generator: 'legacy')); }`
        );
    });

    it('should pin a palette call with a single argument', async () => {
        expect(await migrate(
            `\n\n$my-palette: palette($args);`
        )).toEqual(
            `\n\n$my-palette: palette($args, $generator: 'legacy');`
        );
    });

    it('should leave a palette call that passes the generator by position', async () => {
        const content = `$my-palette: palette(red, blue, white, null, red, red, red, red, null, 'fitted');`;
        expect(await migrate(content)).toEqual(content);
    });

    it('should leave palette calls that already pick a generator', async () => {
        const content = `$fitted: palette(red, blue, white, $generator: 'fitted');
$legacy: palette(
    $primary: red,
    $secondary: blue,
    $surface: white,
    $generator : 'legacy'
);`;
        expect(await migrate(content)).toEqual(content);
    });

    it('should leave other members, comments and strings alone', async () => {
        const content = `$a: color-palette(red);
$b: my_palette(red);
$c: map.get($palette, 'primary');
// $d: palette(red, blue, white);
/* $e: palette(red, blue, white); */
$f: 'palette(red, blue, white)';`;
        expect(await migrate(content)).toEqual(content);
    });

    it('should leave a stylesheet that declares its own palette function alone', async () => {
        const content = `@function palette($primary, $secondary, $surface) {
    @return ($primary, $secondary, $surface);
}
$my-palette: palette(red, blue, white);`;
        expect(await migrate(content)).toEqual(content);
    });

    it('should leave palette calls that spread their arguments', async () => {
        const content = `$args: (primary: red, secondary: blue, surface: white);
$my-palette: palette($args...);`;
        expect(await migrate(content)).toEqual(content);
    });

    it('should pin palette calls in the indented syntax and leave the mixin shorthand alone', async () => {
        const sassFilePath = `/testSrc/appPrefix/component/test.component.sass`;
        expect(await migrate(
            `$my-palette: palette($primary: red, $secondary: blue, $surface: white)
:root
  +palette($my-palette)`,
            sassFilePath
        )).toEqual(
            `$my-palette: palette($primary: red, $secondary: blue, $surface: white, $generator: 'legacy')
:root
  +palette($my-palette)`
        );
    });
});
