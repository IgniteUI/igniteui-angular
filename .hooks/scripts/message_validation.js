module.exports = function (lines, options, errors) {
    var scheme = '<type>(<scope>): <subject> <#ticketNumber>';
    var prefix = 'First line must be ' + scheme + '\n';

    var line = lines[0];

    if (line.startsWith('revert: ')) {
        line = line.replace(/^revert: /, '');
        prefix = 'First line must be revert: ' + scheme + '\n';
    } else if (line.startsWith('revert')) {
        errors.push(
            'If this is a revert of a previous commit, please write:\n' +
            'revert: ' + scheme);

        return;
    }

    if (line.indexOf('(') === -1) {
        errors.push(prefix + 'Need an opening parenthesis: (');

        return;
    }

    var type = line.replace(/\(.*/, '');
    if (!type) {
        errors.push(
            prefix + '<type> was empty, it must be one of these: \n' +
            options.types.join(', ')
        );

        return;
    }

    if (options.types.indexOf(type) === -1) {
        errors.push(
            prefix + '<type> was invalid "' + type + '", It has to be one of these:\n' + 
            options.types.join(', ')
        );

        return;
    }

    if (line.indexOf(')') === -1) {
        errors.push(prefix + 'Need a closing parenthesis after scope declaration: <scope>")"');

        return;
    }

    var scope = line.slice(line.indexOf('(') + 1, line.indexOf(')'));

    if (scope.length === 0) {
        errors.push(prefix + "<scope> cannot be empty!");
    }
    
    if (line.indexOf(type + '(' + scope + '):') === - 1) {
        errors.push(prefix + "Need a colon after the closing parenthesis: ):");
        
        return;
    }

    var subject = line.split(':')[1];
    if (subject === "" || !subject.startsWith(' ')) {
        errors.push(prefix + 'Need a space and <subject> after colon: ": <subject>"');
        
        return;
    }

    subject = subject.trim();

    if (subject.length === 0) {
        errors.push('<subject> must not be empty');
        
        return;
    }
}