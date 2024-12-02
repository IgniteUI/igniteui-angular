import base from './base.css';
import bootstrap from './shared/bootstrap.css';
import indigo from './shared/indigo.css';

import lightMaterial from './light/material.css';
import lightBootstrap from './light/bootstrap.css';
import lightFluent from './light/fluent.css';
import lightIndigo from './light/indigo.css';

import darkMaterial from './dark/material.css';
import darkBootstrap from './dark/bootstrap.css';
import darkFluent from './dark/fluent.css';
import darkIndigo from './dark/indigo.css';

export default {
    base: base.css,
    shared: {
        bootstrap: bootstrap.css,
        indigo: indigo.css
    },
    light: {
        material: lightMaterial.css,
        bootstrap: lightBootstrap.css,
        fluent: lightFluent.css,
        indigo: lightIndigo.css
    },
    dark: {
        material: darkMaterial.css,
        bootstrap: darkBootstrap.css,
        fluent: darkFluent.css,
        indigo: darkIndigo.css
    }
}
