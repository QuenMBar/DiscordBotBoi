# discord-command-parser
Basic parsing for messages received with [Discord.js](https://github.com/discordjs/discord.js).

[![npm](https://img.shields.io/npm/dt/discord-command-parser.svg?style=for-the-badge)](https://npmjs.com/package/discord-command-parser)
[![npm](https://img.shields.io/npm/v/discord-command-parser.svg?style=for-the-badge)](https://npmjs.com/package/discord-command-parser)

# Installation
With npm:
```shell
$ npm install --save discord-command-parser
```
With Yarn:
```shell
$ yarn add discord-command-parser
```

# Quick Example
```js
const discord = require('discord.js');
const parser  = require('discord-command-parser');

const prefix  = '?';
const client  = new discord.Client();

client.on('message', message => {
    const parsed = parser.parse(message, prefix);
    if (!parsed.success) return;
    if (parsed.command === 'ping') {
        return message.reply('Pong!');
    }
});

client.login('Token').then(() => console.log('Ready!'));
```

# Documentation

## `parse(message, prefix, [options])`
> Returns a `ParsedMessage`.
-   `message`   ***Message***; the Discord.js Message to parse.
-   `prefix`    ***string | string[]***; the prefix(es) to check for in commands.
-   `options`   ***object, optional***; additional configuration.
    -   `options.allowBots` ***boolean***; whether to parse messages sent by bot accounts (`message.author.bot`).
    -   `options.allowSelf` ***boolean***; whether to parse messages sent by the client account.


## `ParsedMessage` (class)
Used internally and returned by `parse`.

### Properties:
- `success`: ***boolean***
    > Whether the message could be parsed and appears to be a valid command.
- `prefix`: ***string***
    > The prefix that matched. Useful when providing an array of prefixes to `parse`.
- `command`: ***string***
    > The command that was parsed from the message. For example, the message `!ping` would have a `command` value of `ping`.
- `arguments`: ***string[]***
    > An array of whitespace or quote delimited arguments that were passed to the command. For example, the command
    > ```
    > !ban Clyde 7d "repeated spam of \"no u\" after warning"
    > ```
    > would have an `arguments` value of:
    > ```json
    > [
    >     "Clyde",
    >     "7d",
    >     "repeated spam of \"no u\" after warning"
    > ]
    > ```
- `error`: ***string***
    > If `success` is `false`, a description of why the message was rejected. Otherwise empty.
- `code`: ***number***, ***`ResultCode`***
    > A number from the `ResultCode` enum that indicates the detailed result of the parsing.
- `body`: ***string***
    > The unparsed body of the message immediately following the `command`.
- `message`: ***`Message`***
    > Redundant to the message that was passed to `parse`.
## `ResultCode` (enum)

Indicates the result of parsing.

### Values
- `OK: 0`
    > The message was parsed without incident, and appears to be a valid command.
- `BOT_USER: 1`
    > The message was sent by a bot account. You can override this check in `ParserOptions`.
- `SELF_MESSAGE: 2`
    > The message was sent the same user that received it. You can override this check in `ParserOptions`.
- `NO_PREFIX_MATCH: 3`
    > The message did not start with the prefix provided.
- `NO_BODY: 4`
    > The message contained *only* the prefix, and nothing more.
- `NO_APLHANUMERIC_AFTER_PREFIX: 5`
    > The message started with the prefix, but had a non-alphanumeric character immediately following it.
- `UNKNOWN_ERROR: 6`
    > An unknown error occurred while parsing the message, this is likely to be a bug with discord-command-parser, and should be reported to the [Issues page](https://github.com/campbellbrendene/discord-command-parser/issues) on GitHub.

-----

> # Example Result
> 
> Suppose we got this message on Discord:
> ```
> !remindme "collect daily reward and tell Nyanco \"Happy Valentine's Day!\"" 24h urgent
> ```
> 
> (Assuming our `prefix` is `!`)
>
> This is our resulting <a href="#ParsedMessage">`ParsedMessage`</a>:
> ```json
> {
>   "success": true,
>   "prefix": "!",
>   "command": "remindme",
>   "arguments": [
>     "collect daily reward and tell Nyanco \"Happy Valentine's Day!\"",
>     "24h",
>     "urgent"
>   ],
>   "error": "",
>   "code": 0,
>   "body": "\"collect daily reward and tell Nyanco \\\"Happy Valentine's Day!\\\"\" 24h urgent"
> }
>
> ```

