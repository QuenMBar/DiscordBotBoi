/***
 * This bot is designed to be able to store info about users in channels in discord
 * and then allow things to be done with that data.  Can be used as a frame work for 
 * futer projects.
 * 
 * Better formating of responses.  Following link could be helpfull @devin
 * https://discordjs.guide/popular-topics/embeds.html#embed-preview
 * Also, if youre new to npm:
 * https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/
 * Also, putting @devin everywhere things are printed in discord.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Thanks Q... - I'm adding some stuff for the Keanu Reeves now because I'm procrastinating aye
 * Also, I'm adding @quentin everywhere I have stuff that I don't know how works thanks <3
 */

// Import the discord.js module
const Discord = require('discord.js');
const parser = require('discord-command-parser');
const fs = require('fs');

// Create an instance of a Discord client
const prefix = '~';
const client = new Discord.Client();

//user struct and simple adding call
class User {
    //Stores info for user
    constructor(disID, numDrinks) {
        this.disID = disID;
        this.numDrinks = numDrinks;
        this.keanu = true;
    }

    //adds drinks to user
    addDrinks(numAdd) {
        this.numDrinks += numAdd;
    }
    
    //use Keanu
    callUponThineGoat() {
        this.keanu = false;
    }
}

//Users class.  Just a collection of User
class Users {
    constructor() {
        this.usersList = [];
    }

    //For all the members in a channel, checks to see if theyre added into the list and if they arent adds them
    init(channel) {
        channel.members.forEach(member => {
            if (member.user.bot == false) {
                let userIsInSystem = this.usersList.find(({ disID }) => disID === member.user.id);
                if (userIsInSystem === undefined) {
                    this.usersList.push(new User(member.user.id, 0));
                }
            }
        });
    }

    //For restoring from file.  Checks users in channel against the onces stored and if they have drinks or not
    //Dude this is sick how did you figure this out
    reAdd(channel, listOfUserIDs) {
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
    }

    //Adds specified number of drinks to user
    addDrinks(username, numToAdd) {
        let userToAddTo = this.usersList.find(({ disID }) => client.users.get(disID).username == username);
        userToAddTo.addDrinks(numToAdd);
    }
    
    //@quentin - just reusing the code from above b/c keanu is much simpler but not sure if it'll work
    usersKeanu(username) {
        let userCalling = this.usersList.find(({ disID }) => client.users.get(disID).username == username);
        if userCalling.keanu {
            userCalling.callUponThineGoat();
        } else {
            //TODO fix fail case
            return;
        }
    }

    //Prints the drinks for all users
    // @devin
    printDrinks(channel) {
        let stringToWrite = '```The current drink count is: \n';
        this.usersList.forEach(user => {
            stringToWrite += client.users.get(user.disID).username + ' with ' + user.numDrinks + ' drinks\n'
        });
        stringToWrite += '```'
        channel.send(stringToWrite);
    }
    
    printKeanu(channel) {
        //TODO
        //client.users.get(user.disID).username is fucking ridiculous
        let stringToWrite = '```KEANU REEVES HATH APPEARED```\n```AND GIVEN HIS BLESSING```';
        channel.send(stringToWrite);
    }

    //Tries to add new users for a channel
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

//Channel struct that is mostly mannaged by Channels
class Channel {
    //Stores info about channel
    constructor(channel) {
        this.channelID = channel.id;
        this.guildID = channel.guild.id;
        this.users = new Users();
    }

    //Pass through for add users
    addUsers() {
        this.users.init(client.channels.get(this.channelID));
    }

    //Pass through for reAddUsers
    reAddUsers(listOfUserIDs) {
        this.users.reAdd(client.channels.get(this.channelID), listOfUserIDs);
    }

    //Pass through for addNewUsers
    addNewUsers() {
        this.users.addNewUsers(client.channels.get(this.channelID));
    }
}

//Class for channels that is a collection of channel.  Also implements storing data and reading data
class Channels {
    constructor() {
        this.channels = [];
        this.readFile();
    }

    //Combines memory and storage lists and saves them to the file
    saveFile() {
        let bothChannels = this.channels.concat(this.oldChannels);
        let data = JSON.stringify(bothChannels, null, 2);
        fs.writeFileSync('channels.json', data);
    }

    //Takes the data from file on startup and puts it into memory
    readFile() {
        let rawdata = fs.readFileSync('channels.json');
        this.oldChannels = JSON.parse(rawdata);
    }

    //Used to add all the users in a server to the memory, and add users from file if they existv
    init(channel) {
        var createdChan = new Channel(channel);
        let oldChanFind = this.oldChannels.find(({ channelID }) => channelID === createdChan.channelID);
        if (oldChanFind != undefined) {
            createdChan.reAddUsers(oldChanFind.users);
            this.channels.push(createdChan);
            this.oldChannels.splice(this.oldChannels.indexOf(oldChanFind), 1);
        } else {
            let currentChanFind = this.channels.find(({ channelID }) => channelID === createdChan.channelID);
            if (currentChanFind != undefined) {
                // currentChanFind.addNewUsers();
                this.channels[this.channels.indexOf(currentChanFind)].addNewUsers();
            } else {
                createdChan.addUsers();
                this.channels.push(createdChan);
            }
        }
    }

    //Finds the correct channel to add drinks to and passes it on
    // @devin
    addDrinks(username, channel, numToAdd) {
        let chanToAdd = this.channels.find(({ channelID }) => channelID === channel.id);
        if (chanToAdd != undefined) {
            chanToAdd.users.addDrinks(username, numToAdd);
        } else {
            channel.send('Couldnt find your channel :D');
        }
        this.saveFile();
    }
    
    //why do i have to go through 4 different calls to make this thing happen @quentin
    channelsKeanuUse(username, channel) {
        let chanToAdd = this.channels.find(({ channelID }) => channelID === channel.id);
        if (chanToAdd != undefined) {
            //usersKeanu has check if used
            chanToAdd.users.usersKeanu(username);
        } else {
            channel.send('Couldnt get channel');
        }
        this.saveFile();
    }

    //Finds the correct channel to print drinks to and passes it on
    printDrinks(channel) {
        let chanToPrint = this.channels.find(({ channelID }) => channelID === channel.id);
        chanToPrint.users.printDrinks(channel);
    }
    
    //We could find a better way to code this process @quentin
    channelsKeanuPrint(channel) {
        let chanToPrint = this.channels.find(({ channelID }) => channelID === channel.id);
        chanToPrint.users.printKeanu(channel);
    }
}

//Prints out all users on a server and lets the user select one of them and then returns the username
// @devin
function getPersonSelection(message) {
    return new Promise((resolve, reject) => {
        let filter = m => m.author.id === message.author.id;
        let stringToSend = 'Please reply with the user that youd like to add drinks to: \n```';
        let i = 1;
        message.channel.members.forEach(member => {
            if (member.user.bot == false) {
                stringToSend += i + ': ' + member.user.username + '\n';
                i++;
            }
        });
        stringToSend += '```';
        message.channel.send(stringToSend);
        message.channel.awaitMessages(filter, { max: 1 }).then(recieved => {
            if (!isNaN(parseInt(recieved.first().content)) && 0 <= parseInt(recieved.first().content) <= i) {
                let j = 1;
                let userToAddTo = '';
                message.channel.members.forEach(member => {
                    if (member.user.bot == false) {
                        if (j === parseInt(recieved.first().content)) {
                            userToAddTo = member.user.username;
                        }
                        j++;
                    }
                });
                resolve(userToAddTo);
            }
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

//Asks for user to give a number and returns it
// @devin
function getNumberSelection(message) {
    return new Promise((resolve, reject) => {
        let filter = m => m.author.id === message.author.id;
        message.channel.send('How many would you like to add?');
        message.channel.awaitMessages(filter, { max: 1 }).then(recieved2 => {
            if (!isNaN(parseInt(recieved2.first().content))) {
                resolve(parseInt(recieved2.first().content));
            }
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

//Initilizes Channels - Start of main code
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
    //Parse the command
    const parsed = parser.parse(message, prefix);

    //dad-bot
    // @devin
    if (message.content.substring(0, 3) === 'Im ' ||
        message.content.substring(0, 3) === 'im ') {
        return message.reply('Hi ' + message.content.substring(3) + ', I\'m Your boi, the bot boi!');
    } else if (message.content.substring(0, 4) === 'I\'m ' ||
        message.content.substring(0, 4) === 'i\'m ') {
        return message.reply('Hi ' + message.content.substring(4) + ', I\'m Your boi, the bot boi!');
    }

    //If cant be parsed, get out
    if (!parsed.success) return;
    let channel = message.channel;

    //Switch to handle different commands
    //@quentin this is completely illegible i have no idea how to add the keanu to this
    switch (parsed.command) {
        case 'init':
            console.log('Init on channel: ' + channel.name);
            channels.init(channel);
            channels.printDrinks(message.channel);
            break;
        case 'quietInit':
            console.log('Quiet Init on channel: ' + channel.name);
            channels.init(channel);
            break;
        case 'idk':
            message.reply('Same');
            break;
        case 'addDrink':
            console.log('Add drink: ' + channel.name);
            channels.init(message.channel);
            channels.addDrinks(parsed.arguments[0], message.channel, 1);
            channels.printDrinks(message.channel);
            break;
        case 'addDrinks':
            console.log('Add drinks: ' + channel.name);
            channels.init(message.channel);
            if (parsed.arguments[0] === undefined) { //With no other inputs
                getPersonSelection(message).then(userToAddTo => {
                    getNumberSelection(message).then(numberOfDrinks => {
                        channels.addDrinks(userToAddTo, message.channel, numberOfDrinks);
                        channels.printDrinks(message.channel);
                    }).catch(err => {
                        console.log(err);
                    });
                }).catch(err => {
                    console.log(err);
                });
                break;
            } else if (!isNaN(parseInt(parsed.arguments[0]))) { //One other input thats a number of drinks
                getPersonSelection(message).then(userToAddTo => {
                    channels.addDrinks(userToAddTo, message.channel, parseInt(parsed.arguments[0]));
                    channels.printDrinks(message.channel);
                }).catch(err => {
                    console.log(err);
                });
                break;
            } else if (parsed.arguments[0] != undefined && !isNaN(parseInt(parsed.arguments[1]))) { //Both other inputs are provided
                channels.addDrinks(parsed.arguments[0], message.channel, parseInt(parsed.arguments[1]));
                channels.printDrinks(message.channel);
                break;
            } else if (parsed.arguments[0] != undefined && parsed.arguments[1] === undefined) { //Ony the username is provided
                getNumberSelection(message).then(numberOfDrinks => {
                    channels.addDrinks(parsed.arguments[0], message.channel, numberOfDrinks);
                    channels.printDrinks(message.channel);
                }).catch(err => {
                    console.log(err);
                });
                break;
            } else { //Someone fucked up, idk how
                message.reply('Your arguemnts couldnt be processed.  Please try using the ~addDrinks function or if you dont see someone, try ~init.')
                break;
            }
        case 'printDrinks':
            console.log('Print drinks: ' + channel.name);
            channels.init(message.channel);
            channels.printDrinks(message.channel);
            break;
        case 'help':
            console.log('HELP: ' + channel.name);
            // @devin
            message.reply('```Commands that you can use: \n' +
                '~addDrink [person]:                Add one drink to that person\n' +
                '~addDrinks [person] [number]:      Add any numbe of drinks to a person.  Person and num are optional\n' +
                '~printDrinks:                      Print the drinks for the channel\n\n' +
                'Shouldnt be needed commands: \n' +
                '~init:                             To init the channel\n' +
                '~quietInit:                        To init without printing the drinks\n\n' +
                '~callUponThineGoat [person]:       Use your Keanu bb'
                'If you find any bugs, please hit Quentin 😀```');
            break;
        case 'callUponThineGoat':
            console.log('Using Keanu');
            channels.init(message.channel);
            channels.channelsKeanuUse(parsed.arguments[0], message.channel);
    }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(process.env.disKey);