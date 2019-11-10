/**
 * Simple command parser for messages received 
 * with Discord.js.
 * 
 * https://github.com/campbellbrendene/discord-command-parser
 */
declare module 'discord-command-parser' {
	/**
	 * Parses a message from Discord.js into a command structure, including arguments.
	 */
	export function parse<MT = any> (
		/**
		 * A Discord.js `Message` object that was received by a bot.
		 */
		message: MT,

		/**
		 * A prefix string (or an array of strings) to check that a command message
		 * starts with.
		 */
		prefix: string | string[],

		/**
		 * Optional flags for the parser.
		 */
		options?: ParserOptions
	): ParsedMessage<MT>;

	/**
	 * The result of parsing a message. 
	 * 
	 * You should check `.success` to tell if the message is
	 * a valid command.
	 */
	export class ParsedMessage<MT = any> {
		/**
		 * Whether the message passed all checks and appears to
		 * be a well-formed command.
		 */
		success: boolean;

		/**
		 * The prefix that the message started with, this is 
		 * redundant to the prefix that was provided to `parse()`.
		 */
		prefix: string;

		/**
		 * The command (first word or "quoted block") immediately
		 * following the prefix in the message.
		 */
		command: string;

		/**
		 * The arguments (if any) that followed the command.
		 * 
		 * These are delimited by any whitespace, unless words are 
		 * in 'single quotes', "qouble quotes", 
		 * or \`\`\`code blocks\`\`\`. Full "\"backslash\" support" 
		 * is included.
		 */
		arguments: string[];

		/**
		 * If `success` is `false`, this is a detailed reason.
		 */
		error?: string;

		/**
		 * A number indicating the result of the parsing.
		 * 
		 * The enum is exported top-level as `ResultCode`.
		 * 
		 * ```
		 * OK: 0
		 * BOT_USER: 1
		 * SELF_MESSAGE: 2
		 * NO_PREFIX_MATCH: 3
		 * NO_BODY: 4
		 * NO_APLHANUMERIC_AFTER_PREFIX: 5
		 * UNKNOWN_ERROR: 6
		 * ```
		 */
		code: ResultCode;

		/**
		 * The unparsed body of the message 
		 * following the `command`.
		 */
		body: string;

		/**
		 * The message that was passed to the parser.
		 */
		message: MT;
	}
	
	export interface ParserOptions {
		/**
		 * If `true`, the parser will consider messages that were
		 * sent by the same client that received it.
		 * 
		 * This option is only really useful for selfbots.
		 * 
		 * Default: `false`
		 */
		allowSelf?: boolean;

		/**
		 * If `true`, the parser will consider messages that were
		 * sent by bot accounts.
		 * 
		 * Default: `false`
		 */
		allowBots?: boolean;
	}

	export enum ResultCode {
		/**
		 * No error occurred
		 */
		OK,
		
		/**
		 * The message received was sent by a bot account 
		 * and was ignored.
		 * 
		 * You can set the `allowBots` option to `true` to override 
		 * this behavior.
		 */
		BOT_USER,
		
		/**
		 * The message received was sent by the same account 
		 * that received it and was ignored.
		 * 
		 * You can set the `allowSelf` option to `true` to override
		 * this behavior.
		 */
		SELF_MESSAGE,

		/**
		 * The message does not start with the provided prefix.
		 */
		NO_PREFIX_MATCH,

		/**
		 * The message contained only the prefix string, 
		 * and nothing more.
		 */
		NO_BODY,

		/**
		 * The message started with the prefix string, but had
		 * a non-alphanumeric character (not in range `a-z`, `A-Z`, or `0-9`) after it, which is not allowed.
		 */
		NO_APLHANUMERIC_AFTER_PREFIX,

		/**
		 * An unknown error occurred while parsing the message,
		 * this is likely to be a bug with discord-command-parser,
		 * and should be reported to the Issues section on Github.
		 */
		UNKNOWN_ERROR,
	}
}
