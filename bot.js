/**
 * A ping pong bot, whenever you send "ping", it replies "pong".
 */

// Import the discord.js module
const Discord = require('discord.js');
const parser = require('discord-command-parser');


// Create an instance of a Discord client
const prefix = '~';
const client = new Discord.Client();

//user struct
class User {
    constructor(name, numDrinks) {
        this.name = name;
        this.numDrinks = numDrinks;
    }
    addDrinks(numAdd) {
        this.numDrinks += numAdd;
    }
}

//Users class

class Users {
    constructor() {
        this.usersList = [];
    }
    init(channel) {
        console.log('In channel: ' + channel.name + '\nAnd members are: ');
        channel.members.forEach(member => {
            if (member.user.bot == false) {
                this.allUsers.push(new User(member.user.username, 0));
                console.log(member.user.username);
            }
        });

        this.allUsers.forEach(username => {
            console.log(username);
        });
    }
}

class Channel {
    constructor(channel) {
        this.channel = channel;
        this.users = new Users();
    }

    addUsers() {
        this.users
    }
}

class Channels {
    constructor() {
        this.channels = [];
    }
    init(channel) {
        console.log('Initing: ' + channel.name);
        let exists = false;
        var createdChan = new Channel(channel);
        this.channels.forEach(chan => {
            if (createdChan.channel.guild.id == chan.channel.guild.id && createdChan.channel.calculatedPosition == chan.channel.calculatedPosition) {
                exists = true;
            }
        });
        if (!exists) {
            createdChan.addUsers();
            this.channels.push(createdChan);
        } else {
            createdChan.channel.send('This channel already has been inited');
        }
        // this.channels.forEach(i => {
        //     console.log(i.channel.name);
        // });
    }
}

var channels = new Channels();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
    console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
    const parsed = parser.parse(message, prefix);
    if (!parsed.success) return;
    // If the message is "ping"
    if (parsed.command === 'init') {
        let channel = message.channel;
        console.log('Called by channel: ' + channel.name);
        channels.init(channel);
        return;
        // return message.channel.send('pong');
    }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('NjQyOTE4NzEwNzI1ODM2ODQ2.Xcd74A.Bv11Ahq7za-uh-_aiY49YwytAqQ');