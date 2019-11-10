// https://npmjs.com/package/discord-command-parser
// https://github.com/campbellbrendene/discord-command-parser
// Licensed under the MIT license. See "LICENSE" in the root of this project.

class ParsedMessage {
	constructor () {
		this.success	=	false;
		this.prefix		=	'';
		this.command	=	'';
		this.arguments	=	[];
		this.error		=	'';
		this.code		=	'';
		this.body		=	'';
		this.message	=	null;
	}
}

const ResultCode = Object.freeze({
	OK:								0,
	BOT_USER:						1,
	SELF_MESSAGE:					2,
	NO_PREFIX_MATCH:				3,
	NO_BODY:						4,
	NO_APLHANUMERIC_AFTER_PREFIX:	5,
	UNKNOWN_ERROR:					6,
});

function _getCommandName(content) {
	return content.split(/\s+/g)[0] || null;
}

function _getArguments(str) {
	let args = [];
	str = str.trim();

	while (str.length) {
		let arg;
		if (str.startsWith('"') && str.indexOf('"', 1) > 0) {
			arg = str.slice(1, str.indexOf('"', 1));
			str = str.slice(str.indexOf('"', 1) + 1);
		}
		else if (str.startsWith("'") && str.indexOf("'", 1) > 0) {
			arg = str.slice(1, str.indexOf("'", 1));
			str = str.slice(str.indexOf("'", 1) + 1);
		}
		else if (str.startsWith('```') && str.indexOf('```', 3) > 0) {
			arg = str.slice(3, str.indexOf('```', 3));
			str = str.slice(str.indexOf('```', 3) + 3);
		} else {
			arg = str.split(/\s+/g)[0].trim();
			str = str.slice(arg.length);
		}
		args.push(arg.trim());
		str = str.trim();
	}
	
	return args;
}


function parse(message, prefix, options = {}) {
	function fail(error, code) {
		const result = new ParsedMessage();
		result.success	= false;
		result.message	= message;
		result.prefix	= prefix;
		result.error	= error;
		result.code		= code;
		return result;
	}

	if (typeof prefix === 'string')
		prefix = [prefix];
	else
		prefix = [...prefix];

	if (message.author.bot && !options.allowBots)
		return fail('Message sent by a bot account.', ResultCode.BOT_USER);
	if (message.author.id === message.client.user.id && !options.allowSelf)
		return fail('Message sent from client\'s account.', ResultCode.SELF_MESSAGE);
	if (message.content.length  === 0)
		return fail('Empty message body.', ResultCode.NO_BODY);

	let matchedPrefix = null;
	for (let p of prefix) {
		if (message.content.startsWith(p)) {
			matchedPrefix = p;
			break;
		}
	}
	
	if (!matchedPrefix)
		return fail('Message does not start with prefix.', ResultCode.NO_PREFIX_MATCH);

	let remaining = message.content.slice(matchedPrefix.length);

	if (remaining.length === 0)
		return fail('No body after prefix.', ResultCode.NO_BODY);
	if (!/[a-z0-9]/i.test(remaining[0]))
		return fail('Non alphanumeric character follows prefix.', ResultCode.NO_APLHANUMERIC_AFTER_PREFIX);

	const parsed = new ParsedMessage();

	parsed.command	= remaining.match(/^[a-z0-9\-_\.]+/i)[0];
	remaining		= remaining.slice(parsed.command.length).trim();

	parsed.success		= true;
	parsed.code			= ResultCode.OK;
	parsed.prefix		= matchedPrefix;
	parsed.arguments	= _getArguments(remaining);
	parsed.body			= remaining;
	parsed.message		= message;

	return parsed;
}

// For typings
class ParserOptions {
	constructor() {
		throw new TypeError('ParserOptions is an interface and cannot be constructed.');
	}
}

module.exports = {
	ParserOptions,
	parse,
	ResultCode,
	ParsedMessage,
};
