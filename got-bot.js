'use strict'
const http = require('http')
const Bot = require('messenger-bot')
var base_url = "http://www.anapioficeandfire.com/api/characters/"
var got_message =""
//Using environment variables.
//Feel free to fill the token, port and verify variables directly if you want.
const port = process.env.MY_BOT_PORT
let bot = new Bot({
  token: process.env.MY_PAGE_TOKEN,
  verify: process.env.MY_VERIFICATION_TOKEN,
})

bot.on('error', (err) => {
  console.log(err.message)
})

//TODO uncople this guy here to not look like a big monster oO.
bot.on('message', (payload, reply) => {
  let text = payload.message.text
  var rep = ""
  text = text.toLowerCase();
  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err
    console.log("-------------------------------------------------------------------------")
    console.log("Incoming message from "+profile.first_name+" "+profile.last_name+":"+text)

    if(text.indexOf("hi")>-1 || text.indexOf("hello")>-1 || text.indexOf("hey")>-1) {
      rep = "Hi "+profile.first_name+", my name is Lord Varys. "+
      "I know everything about everyone in Westeros, Essos and Sothoryos. "+
      "Give me a name, and i cant tell you more about that one .."

      reply({ text: rep }, (err) => {
        if (err) throw err

        console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`)
      })
    }
    else if (text.indexOf("valar morghulis")>-1) {
      rep = "Valar Dohaeris"
      reply({ text: rep }, (err) => {
        if (err) throw err

        console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`)
      })
    }
    else if (text.indexOf("valar dohaeris")>-1) {
      rep = "Valar Morghulis"
      reply({ text: rep }, (err) => {
        if (err) throw err

        console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`)
      })
    }
    else {
      var query_name="?name="+encodeURIComponent(text)
      var url = base_url+query_name
      console.log(url)
      http.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
          console.log(JSON.parse(body).length)
          // some times the api returns more than one result
          // TODO use some machine learning algorithym to be more accurate about
          // wich character array element is the most important(Ex. When search for Brandon Stark, there are 8 of them o.O )
          var character = JSON.parse(body)[0]
          if (body != "[]"){
            rep = getCharacterInfo(character)
            // cutting response messages in two to handle 320 character limits
            reply({ text: rep[0] }, (err) => {
              if (err) {
                console.log(err)
              }
              console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep[0]}`)
              reply({ text: rep[1] }, (err) => {
                if (err) {
                  console.log(err)
                }
                console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep[1]}`)
              })
            })

          } else {
            rep = "I am sorry, but I couldn't reach my birds on the web about this one, maybe you typed his name incorrectly or in another language (my valyrian is very trash =/ ). But we can try again with with a correct name or another one.."
            reply({ text: rep }, (err) => {
              if (err) throw err
              console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`)
            })
          }

        })
        .on('error', function (e) {
          rep = "I am sorry, but I couldn't reach my birds on the web. Try again later. "
          reply({ text: rep }, (err) => {
            if (err) throw err

            console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${rep}`)
          })
        });
      })
    }
  })
})

function getCharacterInfo(character){
  //TODO Give more information and handle when some fields are empty
  var name = character.name;
  var culture = character.culture;
  var gender = ""
  var heOrShe = ""
  if (character.gender == "Male"){
    gender = "man"
    heOrShe = "He"
  }
  else {
    heOrShe = "She"
    gender = "woman"
  }

  var aliases = ""
  var i = 0
  if (character.aliases.length==1){
    aliases+=character.aliases[0]
  }
  else{
    for(i=0;i<character.aliases.length;i++){
      if(i==character.aliases.length-1){
        aliases+=`and ${character.aliases[i]}`
      } else {
        aliases+=`${character.aliases[i]}, `
      }
    }
  }
  var titles = ""
  if (character.titles.length==1){
    titles+=character.titles[0]
  }
  else{
    for(i=0;i<character.titles.length;i++){
      if(i==character.titles.length-1){
        titles+=`and ${character.titles[i]}`
      } else {
        titles+=`${character.titles[i]}, `
      }
    }
  }
  var got_message = [`${name} is a ${culture} ${gender}. ${heOrShe} is also known as ${aliases}. `,
                    `By the way ${heOrShe.toLowerCase()} has the title of ${titles}.\n\nIf you want to know more about anyone, just give me another name`]
return got_message

}

http.createServer(bot.middleware()).listen(port)
console.log('Echo bot server running at port '+port)
