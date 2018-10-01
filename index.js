const rp = require('request-promise')
const Discord = require('discord.js')

const fs = require('fs')
const quotes = require('./quotes.json')
const config = require('./config.json')

const client = new Discord.Client()

const commonGreetings = ['hi', 'hello', 'howdy', 'whatsup', 'sup', 'yo']

const getRandomInt = (min, max) =>  {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`)
  client.user.setActivity(`on ${client.guilds.size} servers`)
});

client.on("message", async message => {
  const clientTag = "@"+ client.user.id
  if(message.author.bot) return;
  if(commonGreetings.includes(message.content)){
    message.channel.send("Greetings @" + message.author.username + ", may you forever prosper!")
  }

  if(message.content.includes(clientTag)){
    return message.reply(" are you enjoying your time on earth?")
  }

  if(message.content.indexOf(config.prefix) !== 0){ return;}

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?")
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`)
  }

  if(command === "say") {
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{});
    message.channel.send(sayMessage);
  }

  if(command === "wikiq") {
    let sayMessage = args.join("_");
    sayMessage = "https://en.wikipedia.org/wiki/" + sayMessage;
    message.delete().catch(O_o=>{});
    rp(sayMessage)
      .then(function (html) {
        const d = c.load(html);
        const userMess = 'That won\'t work try a different query'
        if(d(".noarticletext").length >= 1) {
          message.channel.send(userMess);
        } else {
          message.channel.send(sayMessage);
        }
      })
    .catch(function (err) {
        console.error(err)
        message.channel.send(userMess);
    });
  }

  if(command === "quote") {
    let r = getRandomInt(0, quotes.length);
    message.delete().catch(O_o=>{});
    message.channel.send(quotes[r].quote + ' - ' + quotes[r].name);
  }

  if(command === "kick") {
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable)
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the kick!");

    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }

  if(command === "ban") {
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable)
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the ban!");

    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }

  if(command === "purge") {
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    const deleteCount = parseInt(args[0], 10);
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    const fetched = await message.channel.fetchMessages({count: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

client.login(config.token);
