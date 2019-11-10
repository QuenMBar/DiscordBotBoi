/***
 * Potential improvements for later:
 * Documentation
 * Fix places where we could have used find
 * Put reused code in functions/promises
 * Better formating of responses @devin
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
        // console.log('In channel: ' + channel.name + '\nAnd members are: ');
        channel.members.forEach(member => {
            if (member.user.bot == false) {
                let exists = false;
                this.usersList.forEach(element => {
                    if (element.disID == member.user.id) {
                        exists = true;
                    }
                })

                if (!exists) {
                    this.usersList.push(new User(member.user.id, 0));
                    // console.log(client.fetchUser(member.user.id));
                }
            }
        });

        // this.usersList.forEach(member => {
        //     console.log(client.users.get(member.disID).username);
        // });
    }

    reAdd(channel, listOfUserIDs) {
        // console.log('In channel: ' + channel.name + '\nAnd members are: ');

        channel.members.forEach(member => {
            if (member.user.bot == false) {
                let hasDrinks = listOfUserIDs.usersList.find(({ disID }) => disID === member.user.id);
                if (hasDrinks != undefined) {
                    this.usersList.push(new User(member.user.id, hasDrinks.numDrinks));
                } else {
                    this.usersList.push(new User(member.user.id, 0));
                }
            }
        });

        // this.usersList.forEach(member => {
        //     // console.log(client.users.get(member.disID).username);
        // });
    }

    addDrinks(username, numToAdd) {
        this.usersList.forEach(user => {
            if (username == client.users.get(user.disID).username) {
                user.addDrinks(numToAdd);
            }
        });
    }

    printDrinks(channel) {
        let stringToWrite = '```The current drink count is: \n';
        this.usersList.forEach(user => {
            stringToWrite += client.users.get(user.disID).username + ' with ' + user.numDrinks + ' drinks\n'
        });
        stringToWrite += '```'
        channel.send(stringToWrite);
    }

    addNewUsers(channel) {
        channel.members.forEach(member => {
            if (member.user.bot == false) {
                let oldUser = this.usersList.find(({ disID }) => disID === member.user.id);
                if (oldUser === undefined) {
                    this.usersList.push(new User(member.user.id, 0));
                }
            }
        });
    }
}

class Channel {
    constructor(channel) {
        this.channelID = channel.id;
        this.guildID = channel.guild.id;
        this.users = new Users();
    }

    addUsers() {
        // console.log('Adding Users For: ' + client.channels.get(this.channelID).name);
        this.users.init(client.channels.get(this.channelID));
    }

    reAddUsers(listOfUserIDs) {
        // console.log('REAdding Users For: ' + client.channels.get(this.channelID).name);
        // console.log(listOfUserIDs);
        this.users.reAdd(client.channels.get(this.channelID), listOfUserIDs);
    }

    addNewUsers() {
        this.users.addNewUsers(client.channels.get(this.channelID));
    }
}

class Channels {
    constructor() {
        this.channels = [];
        this.readFile();
    }

    saveFile() {
        //Add oldChannels and current channels togeter and then write them
        let bothChannels = this.channels.concat(this.oldChannels);
        let data = JSON.stringify(bothChannels, null, 2);
        fs.writeFileSync('channels.json', data);
        // console.log(data);
    }

    readFile() {
        let rawdata = fs.readFileSync('channels.json');
        this.oldChannels = JSON.parse(rawdata);
        // console.log('The old channes are:');
        // console.log(this.oldChannels);
    }

    init(channel) {
        //Handle reiniting the same channel to update members
        // console.log('Initing: ' + channel.name);
        let exists = false;
        var createdChan = new Channel(channel);
        this.oldChannels.forEach(oldChan => {
            if (oldChan.channelID == createdChan.channelID) {
                exists = true;
                createdChan.reAddUsers(oldChan.users);
                this.channels.push(createdChan);
                this.oldChannels.splice(this.oldChannels.indexOf(oldChan), 1);
                // console.log(this.oldChannels);
            }
        });
        if (!exists) {
            this.channels.forEach(chan => {
                if (createdChan.channelID == chan.channelID) {
                    exists = true;
                    chan.addNewUsers();
                }
            });
            if (!exists) {
                createdChan.addUsers();
                this.channels.push(createdChan);
            } else {
                channel.send('This channel already has been inited');
            }
        }
        // this.channels.forEach(i => {
        //     console.log(i.channel.name);
        // });
        this.saveFile();
    }
    addDrinks(username, channel, numToAdd) {
        this.channels.forEach(chan => {
            if (chan.channelID == channel.id) {
                chan.users.addDrinks(username, numToAdd);
                return;
            } else {
                channel.send('Couldnt find your channel :D');
                return;
            }
        });
        this.saveFile();
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
    switch (parsed.command) {
        case 'init':
            let channel = message.channel;
            // console.log('Called by channel: ' + channel.name);
            channels.init(channel);
            channels.printDrinks(message.channel);
            break;
        case 'idk':
            message.reply('Same');
            break;
            //Will clean this up later if i care.  Idk tho
        case 'addDrink':
            channels.addDrinks(parsed.arguments[0], message.channel, 1);
            channels.printDrinks(message.channel);
        case 'addDrinks':
            if (parsed.arguments[0] === undefined) {
                let channel = message.channel;
                let filter = m => m.author.id === message.author.id;
                let stringToSend = 'Please reply with the user that youd like to add drinks to: \n```';
                let i = 1;
                channel.members.forEach(member => {
                    if (member.user.bot == false) {
                        stringToSend += i + ': ' + member.user.username + '\n';
                        i++;
                    }
                });
                stringToSend += '```';
                channel.send(stringToSend);
                channel.awaitMessages(filter, { max: 1 }).then(recieved => {
                    // console.log(parseInt(recieved.first().content));
                    if (!isNaN(parseInt(recieved.first().content)) && 0 <= parseInt(recieved.first().content) <= i) {
                        let j = 1;
                        let userToAddTo = '';
                        channel.members.forEach(member => {
                            if (member.user.bot == false) {
                                if (j === parseInt(recieved.first().content)) {
                                    userToAddTo = member.user.username;
                                }
                                j++;
                            }
                        });
                        channel.send('How many would you like to add?');
                        channel.awaitMessages(filter, { max: 1 }).then(recieved2 => {
                            if (!isNaN(parseInt(recieved.first().content))) {
                                // console.log('Adding ' + parseInt(recieved2.first().content) + ' to ' + userToAddTo);
                                channels.addDrinks(userToAddTo, message.channel, parseInt(recieved2.first().content));
                                channels.printDrinks(message.channel);
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                }).catch(err => {
                    console.log(err);
                });
                // console.log('Exiting');
                break;
            } else if (!isNaN(parseInt(parsed.arguments[0]))) {
                let channel = message.channel;
                let filter = m => m.author.id === message.author.id;
                let stringToSend = 'Please reply with the user that youd like to add drinks to: \n```';
                let i = 1;
                channel.members.forEach(member => {
                    if (member.user.bot == false) {
                        stringToSend += i + ': ' + member.user.username + '\n';
                        i++;
                    }
                });
                stringToSend += '```';
                channel.send(stringToSend);
                channel.awaitMessages(filter, { max: 1 }).then(recieved => {
                    // console.log(parseInt(recieved.first().content));
                    if (!isNaN(parseInt(recieved.first().content)) && 0 <= parseInt(recieved.first().content) <= i) {
                        let j = 1;
                        let userToAddTo = '';
                        channel.members.forEach(member => {
                            if (member.user.bot == false) {
                                if (j === parseInt(recieved.first().content)) {
                                    userToAddTo = member.user.username;
                                }
                                j++;
                            }
                        });
                        channels.addDrinks(userToAddTo, message.channel, parseInt(parsed.arguments[0]));
                        channels.printDrinks(message.channel);
                    }
                }).catch(err => {
                    console.log(err);
                });
                // console.log('Exiting');
                break;
            } else if (parsed.arguments[0] != undefined && !isNaN(parseInt(parsed.arguments[1]))) {
                channels.addDrinks(parsed.arguments[0], message.channel, parseInt(parsed.arguments[1]));
                channels.printDrinks(message.channel);
                break;
            } else if (parsed.arguments[0] != undefined && parsed.arguments[1] === undefined) {
                let channel = message.channel;
                let filter = m => m.author.id === message.author.id;
                channel.send('How many would you like to add?');
                channel.awaitMessages(filter, { max: 1 }).then(recieved2 => {
                    if (!isNaN(parseInt(recieved2.first().content))) {
                        // console.log('Adding ' + parseInt(recieved2.first().content) + ' to ' + userToAddTo);
                        channels.addDrinks(parsed.arguments[0], message.channel, parseInt(recieved2.first().content));
                        channels.printDrinks(message.channel);
                    } else {
                        channel.send('Invalid Num');
                    }
                }).catch(err => {
                    console.log(err);
                });
                break;
            } else {
                message.reply('Your arguemnts couldnt be processed.  Please try using the ~addDrinks function or if you dont see someone, try ~init.')
                break;
            }
        case 'printDrinks':
            channels.printDrinks(message.channel);
            break;
        case 'Help':
            message.reply('Just ask Quentin.  Most likely hes stupid!');
            break;
    }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(process.env.disKey);