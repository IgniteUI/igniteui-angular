
var defaultTemp = require('./templates/default'),
    commitValidator = require('./templateValidators/default-style-validator'),
    lineLimits = require('./utils/line-limits'),
    issuesValidator = require('./utils/issue-validator'),
    semver = require('semver'),
    errMessages = require('./common').errorMessages,
    errorFactory = require('./common').errorFactory;
  
module.exports = function (message, options, errors) {
    var checkForMergeMessages = new RegExp("^Merge branch|^Merge [0-9a-f]+ into [0-9a-f]+"),
        checkForFixupAndSquashMessages = new RegExp("");

    if (message === undefined) {
        return errorFactory(errMessages.UNDEFINED_OF_COMMIT_MSG);
    } else if (!(typeof message === 'string' || message instanceof String)) {
        return errorFactory(errMessages.MSG_IS_NOT_A_STRING);
    } else if (message.length === 0) {
        return errorFactory(errMessages.MSG_IS_EMPTY);
    }
  
    var lines = message.split('\n');
    if (semver.valid(lines[0])) {
        return [];
    }
  
    if (checkForMergeMessages.test(lines[0])) {
        return [];
    }

    // Get the default template if the style property matches
    if (defaultTemp[options.style]) {
        options = defaultTemp[options.style];
    }

    // Get the lineLimits options from the default 
    // if the template is custom and there is no lineLimits declared.
    if (!options.lineLimits) {
        options.lineLimits = defaultTemp["default"].lineLimits;
    }

    if (!options.lineLimits.firstLine) {
        options.lineLimits.firstLine = defaultTemp["default"].lineLimits.firstLine;
    }

    if (!options.lineLimits.otherLine) {
        options.lineLimits.otherLine = defaultTemp["default"].lineLimits.otherLine;
    }

    if(!options.type) {
        options.types = defaultTemp["default"].types;
    }

    lineLimits(lines, options, errors);
    commitValidator(lines, options, errors);
    issuesValidator(lines, options, errors);
  
    return errors;
}
  