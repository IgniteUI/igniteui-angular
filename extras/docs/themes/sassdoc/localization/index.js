
const process = require('process');
const fs = require('fs');
const constants = require('./utils/constants').Constants;

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
        if (!json[e.context.name]) {
            // if (!fs.existsSync(`${fullPath}/${e.group[0]}/${e.context.type}`)) {
            //     fs.mkdirSync(`${fullPath}/${e.group[0]}/${e.context.type}`);
            // }
            
            const data = getData(e);
            if (data) {
                json[e.context.name] = data;
                fs.writeFileSync(`${fullPath}/${e.group[0]}/${e.context.type}.json`, JSON.stringify(json, null, 4));
            }
            // json = {};
            // json[e.context.name] = {};
            // fileName = e.context.name;
        } else {
            // json[e.context.name] = getData(e);
        }
    });
}

function getData(fileData) {
    const res = {};
    
    if (fileData.description) {
        res[constants.DESCRIPTION] = splitString(fileData.description);
    }

    if (fileData.parameter && fileData.parameter.length) {
        res[constants.PARAMETERS] = {}
        fileData.parameter.forEach(e => {
            res[constants.PARAMETERS][e.name] = {'description': JSON.stringify(splitString(e.description), null, 4), 'type': e.type};
        })
        // JSON.stringify(fileData.parameter);
    }

    if (fileData.return) {
        if (typeof(fileData.return) === 'object') {
            res[constants.RETURN] = JSON.stringify(fileData.return);
        } else {
            res[constants.RETURN] = JSON.stringify(splitString(fileData.return), null, 4);
        }
    }

    // if (fileData.context && fileData.context.code) {
    //     res[constants.CONTEXT] = { 'code': JSON.stringify(splitString(fileData.context.code), null, 4)};
    // }

    return Object.keys(res).length ? res : null
    // return res;
}

function splitString(val) {
    return val ? val.split('\n') : val;
}