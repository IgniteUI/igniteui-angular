import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nProductPath = path.join(__dirname, '../');
const i18nLanguagesPath = path.join(__dirname, '../../../../../../igniteui-angular-i18n/src/i18n');
const errors = [];

class i18nTests {
    runTests() {
        this.i18nFilesMatchForAllLanguages();
    }

    getDirectories = (srcPath) => fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory());
    getFiles = (srcPath) => fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isFile());

    i18nFilesMatchForAllLanguages() {
        this.getDirectories(i18nLanguagesPath).forEach(dir => {
            const curDirPath = path.join(i18nLanguagesPath, dir);
            if (this.getFiles(curDirPath).length !== this.getFiles(i18nProductPath).length) {
                errors.push(`Not all i18n component files that are available for localization have matching files for ${dir} language.
                    Check and add the appropriate resource strings with EN translation and mark the PR as 'pending localization'`
                );
            }
        });

        if (errors.length > 0) {
            throw errors;
        }
    }
}

new i18nTests().runTests();
