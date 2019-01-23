import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as process from 'process';
import * as path from 'path';

import { DefaultTheme } from 'typedoc';
import { PageEvent} from 'typedoc/dist/lib/output/events';
import { Renderer } from 'typedoc';

export default class EnvironmentLinkSetup extends DefaultTheme {

    constructor(renderer: Renderer, basePath) {
        super(renderer, basePath);
        Handlebars.registerHelper('getConfigData', this.getConfigData);
    }

    private getConfigData(prop) {
        const fileName = 'config.json';
        let settings;
        let config;
        let data;

        if (this instanceof PageEvent) {
            settings = this.settings;
        }

        if (settings && fs.existsSync(settings.theme)) {
            const normalizedPath = path.normalize(`${settings.theme}\\${fileName}`);
            config = JSON.parse(fs.readFileSync(normalizedPath, 'utf8'));
        }
        if (config && settings.localize && process.env.NODE_ENV) {
            data = config[settings.localize][process.env.NODE_ENV.trim()];
        }

        return data ? data[prop] : '';
    }
}
