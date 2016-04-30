'use strict';
const http = require('http');
const Bot = require('messenger-bot');
const baseUrl = 'http://www.anapioficeandfire.com/api/characters/';
// Using environment variables.
// Feel free to fill the token, port and verify variables directly if you want.
const port = process.env.MY_BOT_PORT;
const bot = new Bot({
  token: process.env.MY_PAGE_TOKEN,
  verify: process.env.MY_VERIFICATION_TOKEN,
});

function getCharacterInfo(character) {
  // TODO Give more information and handle when some fields are empty
  var name = character.name;
  var culture = character.culture;
  var gender = '';
  var heOrShe = '';
  var aliases = '';
  var i = 0;
  var titles = '';
  var gotMessage;
  if (character.gender === 'Male') {
    gender = 'man';
    heOrShe = 'He';
  } else {
    heOrShe = 'She';
    gender = 'woman';
  }

  if (character.aliases.length === 1) {
    aliases += character.aliases[0];
  } else {
    for (i = 0; i < character.aliases.length; i++) {
      if (i === character.aliases.length - 1) {
        aliases += `and ${character.aliases[i]}`;
      } else {
        aliases += `${character.aliases[i]}, `;
      }
    }
  }
  if (character.titles.length === 1) {
    titles += character.titles[0];
  } else {
    for (i = 0; i < character.titles.length; i++) {
      if (i === character.titles.length - 1) {
        titles += `and ${character.titles[i]}`;
      } else {
        titles += `${character.titles[i]}, `;
      }
    }
  }
  gotMessage = [`${name} is a ${culture} ${gender}. ${heOrShe} is also known as ${aliases}. `,
                    `By the way ${heOrShe.toLowerCase()} has the title of ${titles}.\n\nIf you want to know more about anyone, just give me another name`];
  return gotMessage;
}

bot.on('error', (err) => {
  console.log(err.message);
});

// TODO uncople this guy here to not look like a big monster oO.
bot.on('message', (payload, reply) => {
  let text = payload.message.text;
  let rep = '';
  text = text.toLowerCase();
  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err;
    console.log('-------------------------------------------------------------------------');
    console.log(`Incoming message from ${profile.first_name} ${profile.last_name}: ${text}`);

    if (text.indexOf('hi') > -1 || text.indexOf('hello') > -1 || text.indexOf('hey') > -1) {
      rep = `Hi ${profile.first_name}, my name is Lord Varys. ` +
      'I know everything about everyone in Westeros, Essos and Sothoryos. ' +
      'Give me a name, and i cant tell you more about that one ..';

      reply({ text: rep }, (errRpl) => {
        if (errRpl) throw errRpl;

        console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`);
      });
    } else if (text.indexOf('valar morghulis') > -1) {
      rep = 'Valar Dohaeris';
      reply({ text: rep }, (errRpl) => {
        if (errRpl) throw errRpl;

        console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`);
      });
    } else if (text.indexOf('valar dohaeris') > -1) {
      rep = 'Valar Morghulis';
      reply({ text: rep }, (errRpl) => {
        if (errRpl) throw errRpl;

        console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`);
      });
    } else {
      const queryName = `?name=${encodeURIComponent(text)}`;
      const url = baseUrl + queryName;
      console.log(url);
      http.get(url, (res) => {
        var body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          console.log(JSON.parse(body).length);
          // some times the api returns more than one result
          // TODO use some machine learning algorithym to be more accurate about
          // wich character array element is the most important(Ex. When search for Brandon Stark, there are 8 of them o.O )
          const character = JSON.parse(body)[0];
          if (body !== '[]') {
            rep = getCharacterInfo(character);
            // cutting response messages in two to handle 320 character limits
            reply({ text: rep[0] }, (errRpl) => {
              if (errRpl) {
                console.log(errRpl);
              }
              console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep[0]}`);
              reply({ text: rep[1] }, (errRpl1) => {
                if (errRpl1) {
                  console.log(errRpl1);
                }
                console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep[1]}`);
              });
            });
          } else {
            rep = "I am sorry, but I couldn't reach my birds on the web about this one, maybe you typed his name incorrectly or in another language (my valyrian is very trash =/ ).\nBut we can try again with a correct name or another one..";
            reply({ text: rep }, (errRpl) => {
              if (errRpl) throw errRpl;
              console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`);
            });
          }
        })
        .on('error', (e) => {
          rep = "I am sorry, but I couldn't reach my birds on the web. Try again later. ";
          console.log(e);
          reply({ text: rep }, (errRpl) => {
            if (errRpl) throw errRpl;

            console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`);
          });
        });
      });
    }
  });
});

http.createServer(bot.middleware()).listen(port);
console.log(`Echo bot server running at port +${port}`);
