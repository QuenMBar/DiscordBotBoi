// This file tests discord-command-parser against a few pseudo-real-life messages

class Message {
	constructor(content, is_bot = false, is_self = false) {
		this.content = content;
		this.author = {
			bot: is_bot,
			id: is_self ? '0001' : '0002',
		};
		this.client = {
			user: {
				id: '0001',
			}
		};
	}
}

const { parse } = require('../src/index');
const { default: chalk } = require('chalk');

const tests = {
	'Ignore bots':			parse(new Message('!ping', true), '!').success == false,
	'Ignore self':			parse(new Message('!ping', false, true), '!').success == false,
	'Explicit allow bots':	parse(new Message('!ping', true), '!', { allowBots: true }).success == true,
	'Explicit allow self':	parse(new Message('!ping', false, true), '!', { allowSelf: true }).success == true,
	'No-arg commands':		parse(new Message('!ping'), '!').command == 'ping',
	'Arg commands':			parse(new Message('!ping aa bb'), '!').arguments.join(',') == 'aa,bb',
	'Success on no-arg':	parse(new Message('!ping'), '!').success == true,
	'Fail on just prefix':	parse(new Message('!'), '!').success == false,
	'Fail on wrong prefix':	parse(new Message('%ping me'), '!').success == false,
	'Fail on empty body':	parse(new Message(''), '!').success == false,
	'Fail on ws after px':	parse(new Message('! ping'), '!').success == false,
	'Get correct command':	parse(new Message('!PiNg'), '!').command == 'PiNg',
	'Doublequote args':		parse(new Message('!say "hello world"'), '!').arguments.join(',') == 'hello world',
	'Singlequote args':		parse(new Message("!say 'hello world'"), '!').arguments.join(',') == 'hello world',
	'Codeblock args':		parse(new Message('!say ```\nhello world```'), '!').arguments.join(',') == 'hello world',
	'Success prefix[0]':	parse(new Message('!ping'), ['!', '?']).success == true,
	'Match prefix[0]':		parse(new Message('!ping'), ['!', '?']).prefix == '!',
	'Success prefix[1]':	parse(new Message('?ping'), ['!', '?']).success == true,
	'Match prefix[1]':		parse(new Message('?ping'), ['!', '?']).prefix == '?',
	'No match on []':		parse(new Message('!ping'), []).success == false,
	'No match on [...]':	parse(new Message('!ping'), ['!!', '!!!']).success == false,
	// 'Backquote args':		parse(new Message('!say `hello world`'), '!').arguments.join(',') == 'hello world',
	// wontfix
};

let passed_sum = 0;
let failed_sum = 0;

for (let test in tests) {
	if (tests[test]) {
		passed_sum++;
		console.log(chalk.greenBright(`[PASSED] \t${test}`));
	}
	else {
		failed_sum++;
		console.log(chalk.redBright(`[FAILED] \t${test}`));
	}
}
const pct_passed = Math.floor(passed_sum / (passed_sum + failed_sum) * 100);

console.log(`${pct_passed === 100 ? chalk.greenBright(pct_passed + '% PASSED') : chalk.yellowBright(pct_passed + '% PASSED')}`);
if (pct_passed !== 100) process.exit(1);