/***
 * This bot is designed to be able to store info about users in channels in discord
 * and then allow things to be done with that data.  Can be used as a frame work for
 * future projects.
 *
 * Better formatting of responses.  Following link could be helpful @devin
 * https://discordjs.guide/popular-topics/embeds.html#embed-preview
 * Also, if you're new to NPM:
 * https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/
 * Also, putting @devin everywhere things are printed in discord.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Thanks Q... - I'm adding some stuff for the Keanu Reeves now because I'm procrastinating aye
* Also, I'm adding @quentin everywhere I have stuff that I don't know how works thanks <3
*/

// Import the discord.js module
const Discord = require("discord.js");
const parser = require("discord-command-parser");
const fs = require("fs");

// Create an instance of a Discord client
const prefix = "~";
const client = new Discord.Client();

class User {
  /**@class User Class/Struct - Is a representation of a user that houses all attributes held by the user.
   * Only does light operations to its own values, other than that all the heavy
   * lifting is done by the channel class.
   * @param {snowflake} disID - The discord ID of the user
   * @param {number} numDrinks - The amount of drinks the user has
   * @param {boolean} [keanuVal] - The value of Keanu
   */
  constructor(disID, numDrinks, keanuVal) {
    this.disID = disID;
    this.numDrinks = numDrinks;
    if (keanuVal === undefined) keanuVal = true;
    this.keanu = keanuVal;
  }

  /**@name addDrinks
   * @description Given a number it adds that amount of drinks to the user
   * NOTE - May want to remove this since its no longer used
   * @param {number} numAdd - Number of drinks to add to the user
   */
  addDrinks(numAdd) {
    this.numDrinks += numAdd;
  }

  callUponThineGoat() {
    this.keanu = false;
  }
}

class Channel {
  /**@class Channel is a class that manages the channels and by extension guilds that
   * the bot is on.  This class does all the heavy lifting for the bot, as it is the
   * one managing all the users.
   * @param {Object} channel - Channel gotten from the discordJS API
   * @param {snowflake} channel.id - ID of the channel
   * @param {Object} channel.guild - Guild the channel is on
   * @param {snowflake} channel.guild.id - ID of the guild its on
   */
  constructor(channel) {
    this.channelID = channel.id;
    this.guildID = channel.guild.id;
    this.usersList = [];
  }

  /**@name addNewUsers
   * @description For each member on the channel, create a user in the
   * usersList for the channel.  This method is only called when there is
   * no channel saved or in memory whose guildID or channelID matches.
   */
  addNewUsers() {
    client.channels.get(this.channelID).members.forEach(member => {
      if (member.user.bot === false) {
        let userIsInSystem = this.usersList.find(({ disID }) => disID === member.user.id);
        if (userIsInSystem === undefined) {
          this.usersList.push(new User(member.user.id, 0));
        }
      }
    });
    channels.saveFile();
  }

  /**@name reAddUsers
   * @description Add users that are saved from before, and then add any new users
   * @param {User[]} listOfUserIDs - List of saved old users
   */
  reAddUsers(listOfUserIDs) {
    listOfUserIDs.forEach(oldMember => {
      this.usersList.push(new User(oldMember.disID, oldMember.numDrinks, oldMember.keanu));
    });
    this.addNewUsers();
  }

  /**@name addDrinks
   * @description Add given number of drinks to a given user in the channel
   * @param {string} username - The username to add drinks to
   * @param {number} numToAdd - The number of drinks to add to the user
   */
  addDrinks(username, numToAdd) {
    let userToAddTo = this.usersList.find(({ disID }) => client.users.get(disID).username == username);
    userToAddTo.addDrinks(numToAdd);
    channels.saveFile();
  }

  //@quentin - just reusing the code from above b/c Keanu is much simpler but not sure if it'll work
  usersKeanu(username) {
    let userCalling = this.usersList.find(({ disID }) => client.users.get(disID).username == username);
    if (userCalling.keanu) {
      userCalling.callUponThineGoat();
    } else {
      //TODO fix fail case
      return;
    }
    channels.saveFile();
  }

  /**@name printDrinks
   * @description Prints the amount of drinks each user has in the channel
   * @param {Object} channel - A channel from Discord.
   * @param {members[]} channel.members - A list of the members in the channel
   */
  printDrinks(channel) {
    let stringToWrite = "```The current drink count is: \n";
    channel.members.forEach(gottenMember => {
      if (!gottenMember.user.bot) {
        let chosenUser = this.usersList.find(({ disID }) => gottenMember.user.id === disID);
        stringToWrite += gottenMember.user.username + " with " + chosenUser.numDrinks + " drinks\n";
      }
    });
    stringToWrite += "```";
    channel.send(stringToWrite);
  }

  printKeanu(channel) {
    //TODO
    //client.users.get(user.disID).username is fucking ridiculous
    let stringToWrite = "```KEANU REEVES HATH APPEARED```\n```AND GIVEN HIS BLESSING```";
    channel.send(stringToWrite);
  }
}

class Channels {
  /**@class Channels is a collection of channel.  It has all the channels that the bot
   * is currently a part of and is in charge of navigating to the correct one.  It also reads
   * and saves the channels from storage.
   */
  constructor() {
    this.channels = [];
    this.readFile();
  }

  /**@name saveFile
   * @description Used to save all the information stored in this.channels to a local file named channels.json
   */
  saveFile() {
    let bothChannels = this.channels.concat(this.oldChannels);
    let data = JSON.stringify(bothChannels, null, 2);
    fs.writeFileSync("channels.json", data);
  }

  /**@name readFile
   * @description Used to read stored data from channels.json on startup
   */
  readFile() {
    let rawdata = fs.readFileSync("channels.json");
    this.oldChannels = JSON.parse(rawdata);
  }

  /**@name Init
   * @description Is used to initialize the channel every time a command is run.  It has 5 states.  The
   * first 2 are when the current channel is in memory or was saved to channels.json.  The second 2 are
   * when the channel is on the same guild (Discord Server) as a channel in memory or was saved.  The
   * last state is when it is a brand new channel.
   * @param {Object} channel - A discord channel
   */
  init(channel) {
    //Create a new channel object from the received discord channel
    let createdChan = new Channel(channel);

    //Then check to see if it is a channel in the active memory of the app
    let currentChanFind = this.channels.find(({ channelID }) => channelID === createdChan.channelID);
    if (currentChanFind != undefined) {
      //If it is, add any new users to the channel and finish init
      this.channels[this.channels.indexOf(currentChanFind)].addNewUsers();
    } else {
      //Then check to see if it is a channel that was saved to file
      let oldChanFind = this.oldChannels.find(({ channelID }) => channelID === createdChan.channelID);
      if (oldChanFind != undefined) {
        //If it is, reAdd all the saved info to the channel object and push it to active channels.
        //Then delete the channel from the saved channels.
        createdChan.reAddUsers(oldChanFind.usersList);
        this.channels.push(createdChan);
        this.oldChannels.splice(this.oldChannels.indexOf(oldChanFind), 1);
      } else {
        //Then check to see if it shares a guild with any active channel
        let currentGuildFind = this.channels.find(({ guildID }) => guildID === createdChan.guildID);
        if (currentGuildFind != undefined) {
          //If it does, reAdd all the active info to the channel object and push it to active channels.
          //Then delete the old channel from the active channels.
          createdChan.reAddUsers(currentGuildFind.usersList);
          this.channels.push(createdChan);
          this.channels.splice(this.channels.indexOf(currentGuildFind), 1);
        } else {
          //Then check to see if it shares a guild with any saved channel
          let oldGuildFind = this.oldChannels.find(({ guildID }) => guildID === createdChan.guildID);
          if (oldGuildFind != undefined) {
            //If it does, reAdd all the saved info to the channel object and push it to active channels.
            //Then delete the channel from the saved channels.
            createdChan.reAddUsers(oldGuildFind.usersList);
            this.channels.push(createdChan);
            this.oldChannels.splice(this.oldChannels.indexOf(oldGuildFind), 1);
          } else {
            //If it isn't any of the other options, then add all the users as new and push it to the active channels
            createdChan.addNewUsers();
            this.channels.push(createdChan);
          }
        }
      }
    }
  }

  /**@name navigateToChannel
   * @description Find the channel that it passed in the param in the channels list and return it
   * @param {Object} channel - A discord channel
   * @returns {Channel} [navChannel] - Returns the channel in the list if it exists
   */
  navigateToChannel(channel) {
    let navChannel = this.channels.find(({ channelID }) => channelID === channel.id);
    if (navChannel != undefined) {
      return navChannel;
    } else {
      channel.send("Couldn't find your channel :D");
      return undefined;
    }
  }
}

/**@name getPersonSelection
 * @description Prints out all users on a server and lets the user select one of them and then returns the username
 * @param {Object} message - A discord message object
 * @returns {Promise<string>} - The selected users name
 * @throws Error when the username doesn't exist or the user takes too long
 */
function getPersonSelection(message) {
  return new Promise((resolve, reject) => {
    let filter = m => m.author.id === message.author.id;
    let stringToSend = "Please reply with the user that you'd like to add drinks to: \n```";
    let i = 1;
    message.channel.members.forEach(member => {
      if (member.user.bot == false) {
        stringToSend += i + ": " + member.user.username + "\n";
        i++;
      }
    });
    stringToSend += "```";
    message.channel.send(stringToSend);
    message.channel
      .awaitMessages(filter, { max: 1 })
      .then(recieved => {
        if (!isNaN(parseInt(recieved.first().content)) && 0 <= parseInt(recieved.first().content) <= i) {
          let j = 1;
          let userToAddTo = "";
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
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

/**@name getNumberSelection
 * @description Asks user for a number and then returns it
 * @param {Object} message - A discord message object
 * @returns {Promise<number>} - The selected users name
 * @throws Error when not a number or the user takes too long
 */
function getNumberSelection(message) {
  return new Promise((resolve, reject) => {
    let filter = m => m.author.id === message.author.id;
    message.channel.send("How many would you like to add?");
    message.channel
      .awaitMessages(filter, {
        max: 1
      })
      .then(recieved2 => {
        if (!isNaN(parseInt(recieved2.first().content))) {
          resolve(parseInt(recieved2.first().content));
        }
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

//Initializes Channels - Start of main code
var channels = new Channels();

/**
 * @event Ready - The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on("ready", () => {
  console.log("I am ready!");
});

/**Create an event listener for messages
 * @listens message - Listens for a message from one of its channels
 */
client.on("message", message => {
  //Parse the command
  const parsed = parser.parse(message, prefix);

  //dad-bot
  // @devin
  if (message.content.substring(0, 3) === "Im " || message.content.substring(0, 3) === "im ") {
    return message.reply("Hi " + message.content.substring(3) + ", I'm Your boi, the bot boi!");
  } else if (message.content.substring(0, 4) === "I'm " || message.content.substring(0, 4) === "i'm ") {
    return message.reply("Hi " + message.content.substring(4) + ", I'm Your boi, the bot boi!");
  }

  //If cant be parsed, get out
  if (!parsed.success) return;

  //Init the channel and then navigate to it
  channels.init(message.channel);
  let channelInMemory = channels.navigateToChannel(message.channel);
  if (channelInMemory == undefined) return;

  //Switch to handle different commands
  //@quentin this is completely illegible I have no idea how to add the keanu to this
  switch (parsed.command) {
    case "idk":
      message.reply("Same");
      break;
    case "addDrink":
      console.log("Add drink: " + message.channel.name);
      channelInMemory.addDrinks(parsed.arguments[0], 1);
      channelInMemory.printDrinks(message.channel);
      break;
    case "addDrinks":
      console.log("Add drinks: " + message.channel.name);
      if (parsed.arguments[0] === undefined) {
        //With no other inputs
        getPersonSelection(message)
          .then(userToAddTo => {
            getNumberSelection(message)
              .then(numberOfDrinks => {
                channelInMemory.addDrinks(userToAddTo, numberOfDrinks);
                channelInMemory.printDrinks(message.channel);
              })
              .catch(err => {
                console.log(err);
              });
          })
          .catch(err => {
            console.log(err);
          });
        break;
      } else if (!isNaN(parseInt(parsed.arguments[0]))) {
        //One other input that's a number of drinks
        getPersonSelection(message)
          .then(userToAddTo => {
            channelInMemory.addDrinks(userToAddTo, parseInt(parsed.arguments[0]));
            channelInMemory.printDrinks(message.channel);
          })
          .catch(err => {
            console.log(err);
          });
        break;
      } else if (parsed.arguments[0] != undefined && !isNaN(parseInt(parsed.arguments[1]))) {
        //Both other inputs are provided
        channelInMemory.addDrinks(parsed.arguments[0], parseInt(parsed.arguments[1]));
        channelInMemory.printDrinks(message.channel);
        break;
      } else if (parsed.arguments[0] != undefined && parsed.arguments[1] === undefined) {
        //Only the username is provided
        getNumberSelection(message)
          .then(numberOfDrinks => {
            channelInMemory.addDrinks(parsed.arguments[0], numberOfDrinks);
            channelInMemory.printDrinks(message.channel);
          })
          .catch(err => {
            console.log(err);
          });
        break;
      } else {
        //Someone fucked up, idk how
        message.reply(
          "Your arguments couldn't be processed.  Please try using the ~addDrinks function or if you don't see someone, try ~init."
        );
        break;
      }
    case "callUponThineGoat":
      console.log("Using Keanu");
      channelInMemory.usersKeanu(parsed.arguments[0]);
    case "printDrinks":
      console.log("Print drinks: " + message.channel);
      channelInMemory.printDrinks(message.channel);
      break;
    case "help":
      console.log("HELP: " + message.channel.name);
      // @devin
      message.reply(
        "```Commands that you can use: \n" +
          "~addDrink [person]:                Add one drink to that person\n" +
          "~addDrinks [person] [number]:      Add any number of drinks to a person.  Person and num are optional\n" +
          "~printDrinks:                      Print the drinks for the channel\n\n" +
          "~callUponThineGoat [person]:       Use your Keanu bb" +
          "If you find any bugs, please hit Quentin 😀```"
      );
      break;
  }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(process.env.disKey);
