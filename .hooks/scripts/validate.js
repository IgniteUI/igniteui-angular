
var defaultTemp = require('./templates/default'),
    msgValidator = require('./message_validation'),
    limits = require('./utils/limits'),
    tickets = require('./utils/tickets'),
    semver = require('semver');
  
module.exports = function (message, options, errors) {
    var checkForMergeMessages = new RegExp("^Merge branch|^Merge [0-9a-f]+ into [0-9a-f]+"),
        checkForFixupAndSquashMessages = new RegExp("");

    if (message === undefined) {
        return ['Commit message is undefined, abort with error'];
    } else if (
      !(typeof message === 'string' || message instanceof String)
    ) {
        return ['Commit message is not a string, abort with error'];
    } else if (message.length === 0) {
        return ['Commit message is empty, abort with error'];
    }
  
    var lines = message.split('\n');
    if (semver.valid(lines[0])) {
        return [];
    }
  
    // if (/^WIP|^Wip|^wip/.test(lines[0])) {
    //     return [];
    // }
  
    if (checkForMergeMessages.test(lines[0])) {
        return [];
    }
  
    // if (/^fixup!|^squash!/.test(lines[0])) {
    //     return [];
    // }

    // Get the default template if the style property matches
    if (defaultTemp[options.style]) {
        options = defaultTemp[options.style];
    }

    // Get the limits options from the default 
    // if the template is custom and there is no limits declared.
    if (!options.limits) {
        options.limits = defaultTemp["default"].limits;
    }

    if (!options.limits.firstLine) {
        options.limits.firstLine = defaultTemp["default"].limits.firstLine;
    }

    if (!options.limits.otherLine) {
        options.limits.otherLine = defaultTemp["default"].limits.otherLine;
    }

    if(!options.type) {
        options.types = defaultTemp["default"].types;
    }

    // lines = lines.filter(line => line.trim() != "");
    limits(lines, options, errors);
    msgValidator(lines, options, errors);
    tickets(lines, options, errors);
  
    return errors;
}
  