
const process = require('process');
const fs = require('fs');

const filepath = './extras/sassdoc';
const locale = 'en';
const fullPath = `${filepath}/${locale}`;

module.exports = (data) => {
    buildHierarchy(data);

    buildJson(data);
};

// function getArgvOption(option) {
//     const options = process.argv;
//     const optionVal = options.find(e => e === `--${option}`);
// }

function buildHierarchy(data) {
    if(!fs.existsSync(filepath) || !fs.existsSync(`${filepath}/${locale}`)) {
        fs.mkdirSync(filepath);
        fs.mkdirSync(`${filepath}/${locale}`);
    }

    if(fs.existsSync(`${filepath}/${locale}`)) {
        createDirectoryGroups(data);
    }
}

function createDirectoryGroups(data) {
    const groups = Object.keys(data.byGroupAndType);
    groups.forEach(e => {
        if (!fs.existsSync(`${fullPath}/${e}`)) {
            fs.mkdirSync(`${fullPath}/${e}`);
        }
    });
}

function buildJson(data) {
    let json = {};
    let fileName = '';
    data.forEach(e => {
        if (!json[e.file.name]) {
            fs.writeFileSync(`${fullPath}/${e.group[0]}/${fileName}.json`, JSON.stringify(json, null, 4));
            json = {};
            json[e.file.name] = {};
            fileName = e.file.name;
        } else {
            json[e.file.name][e.context.name] = getData(e);
        }
    });
}

function getData(fileData) {
    const res = {};
    
    if (fileData.description) {
        res['description'] = splitString(fileData.description);
    }

    if (fileData.parameter && fileData.parameter.length) {
        res['parameters'] = {}
        fileData.parameter.forEach(e => {
            res['parameters'][e.name] = {'description': JSON.stringify(splitString(e.description), null, 4), 'type': e.type};
        })
        // JSON.stringify(fileData.parameter);
    }

    if (fileData.return) {
        if (typeof(fileData.return) === 'object') {
            res['return'] = JSON.stringify(fileData.return);
        } else {
            res['return'] = JSON.stringify(splitString(fileData.return), null, 4);
        }
    }

    if (fileData.context) {
        res['context'] = { 'code': JSON.stringify(splitString(fileData.context.code), null, 4)};
    }

    return res;
}

function splitString(val) {
    return val ? val.split('\n') : val;
}