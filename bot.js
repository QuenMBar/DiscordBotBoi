/**
 * A ping pong bot, whenever you send "ping", it replies "pong".
 */

// Import the discord.js module
const Discord = require('discord.js');
const parser = require('discord-command-parser');
const fs = require('fs');


// Create an instance of a Discord client
const prefix = '~';
const client = new Discord.Client();

//user struct
class User {
    constructor(disID, numDrinks) {
        this.disID = disID;
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
                let exists = false;
                this.usersList.forEach(element => {
                    if (element.disID == member.user.id) {
                        exists = true;
                    }
                })

                if(!exists) {
                    this.usersList.push(new User(member.user.id, 0));
                    // console.log(client.fetchUser(member.user.id));
                }
            }
        });

        this.usersList.forEach(member => {
            console.log(client.users.get(member.disID).username);
        });
    }

    init(channel, listOfUserIDs) {
        console.log('In channel: ' + channel.name + '\nAnd members are: ');
        listOfUserIDs.usersList.forEach(member => {
            let exists = false;
            this.usersList.forEach(element => {
                if (element.disID == member.disID) {
                    exists = true;
                }
            })

            if(!exists) {
                this.usersList.push(new User(member.disID, member.numDrinks));
                // console.log(client.fetchUser(member.user.id));
            }
            
        });

        this.usersList.forEach(member => {
            console.log(client.users.get(member.disID).username);
        });
    }

    addDrinks(username, numToAdd) {
        this.usersList.forEach(user => {
            if (username == client.users.get(user.disID).username) {
                user.addDrinks(numToAdd);
            }
        });
    }
    printDrinks(channel){
        let stringToWrite = '```The current drink count is: \n';
        this.usersList.forEach(user => {
            stringToWrite += client.users.get(user.disID).username + ' with ' + user.numDrinks + ' drinks\n'
        });
        stringToWrite += '```'
        channel.send(stringToWrite);
    }
}

class Channel {
    constructor(channel) {
        this.channelID = channel.id;
        this.guildID = channel.guild.id;
        this.users = new Users();
    }

    addUsers() {
        console.log('Adding Users For: ' + client.channels.get(this.channelID).name);
        this.users.init(client.channels.get(this.channelID));
    }

    addUsers(listOfUserIDs) {
        console.log('Adding Users For: ' + client.channels.get(this.channelID).name);
        this.users.init(client.channels.get(this.channelID), listOfUserIDs);
    }
}

class Channels {
    constructor() {
        this.channels = [];
    }

    saveFile() {
        let data = JSON.stringify(this.channels, null, 2);
        fs.writeFileSync('channels.json', data);
        console.log(data);
    }

    readFile() {
        let rawdata = fs.readFileSync('channels.json');
        let tempChannels = JSON.parse(rawdata);
        console.log(tempChannels);
        tempChannels.forEach(element => {
            console.log(element);
            let newChan = new Channel(client.channels.get(element.channelID));
            newChan.addUsers(element.users);
            this.channels.push(newChan);
        });
    }

    init(channel) {
        console.log('Initing: ' + channel.name);
        let exists = false;
        var createdChan = new Channel(channel);
        this.channels.forEach(chan => {
            if (createdChan.channelID == chan.channelID) {
                exists = true;
            }
        });
        if (!exists) {
            createdChan.addUsers();
            this.channels.push(createdChan);
        } else {
            channel.send('This channel already has been inited');
        }
        // this.channels.forEach(i => {
        //     console.log(i.channel.name);
        // });
        // this.saveFile();
    }
    addDrinks(username, channel, numToAdd){
        this.channels.forEach(chan => {
            if (chan.channelID == channel.id) {
                chan.users.addDrinks(username, numToAdd);
                return;
            } else {
                channel.send('Couldnt find your channel :D');
                return;
            }
        });
        // this.saveFile();
    }
    printDrinks(channel) {
        this.channels.forEach(chan => {
            if (chan.channelID == channel.id) {
                chan.users.printDrinks(channel);
                return;
            } else {
                channel.send('Couldnt find your channel :D');
                return;
            }
        });
    }
}

var channels = new Channels();
// channels.readFile();

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
    switch(parsed.command) {
        case 'init':
            let channel = message.channel;
            console.log('Called by channel: ' + channel.name);
            channels.init(channel);
            break;
        case 'idk':
            message.reply('Same');
            break;
        case 'addDrink':
            channels.addDrinks(parsed.arguments[0], message.channel, 1);
            break;
        case 'printDrinks':
            channels.printDrinks(message.channel);
            break;
        case 'save':
            channels.saveFile();
            break;
    }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(process.env.disKey);