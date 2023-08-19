const { App } = require('@slack/bolt');
require('dotenv').config();

const schedule = require('node-schedule')
const iconv = require('iconv-lite');
const axios = require('axios');
const cheerio = require('cheerio');

const VIDLICKY_A_NOZE = 'https://www.menicka.cz/2271-smichovske-vidlicky-a-noze.html';
const CORLEONE = 'https://www.menicka.cz/2219-corleone-andel-.html';

const app = new App({
    token: process.env.TOKEN,
    signingSecret: process.env.SECRET
})

const asyncFunc = async () => {
    app.start(process.env.PORT || 3500)
    console.log('shit working')
}
asyncFunc()

const vidle = () => {
    axios.get(VIDLICKY_A_NOZE, {responseType: 'arraybuffer'} )
    .then( res => {
        const corruptHtml = res.data;
        const data = iconv.decode(corruptHtml, 'windows-1250');
        const utf8Data = iconv.encode(data, 'utf-8').toString();
        const $ = cheerio.load(utf8Data);
        const articles = [];
        
        // Iterating over the elements
        $('.popup-gallery', utf8Data).first().each(function () {
            const SOUP = $(this).find('.polozka').first().text()+' Kč';
            const jidlo = $(this).find('.jidlo').text()
            const newString = jidlo.replace(/\n/g, "").trimStart();
            const regex = /(\d+\.\s.*?Kč)/g;
            const MENU = newString.match(regex);
            
            // Add line breaks after each match in the MENU array
            const formattedMenu = MENU.map(item => item.replace(/Kč/g, 'Kč\n')).join('');
            
            articles.push({ SOUP, MENU: formattedMenu });
        });
        
        // Posting to Slack outside of the .each() function
        app.client.chat.postMessage({
            channel: process.env.CHANNEL,
            token: process.env.TOKEN,
            text: `Dnešní menu v restauraci Smíchovské vidličky a nože:\n\n${articlesToString(articles)}` // Convert the object to a custom string
        }).catch(error => {
            console.error(error);
        });
    })
    .catch(error => {
        console.error(error)
    })
}
const corleone = () => {
    axios.get(CORLEONE, {responseType: 'arraybuffer'} )
    .then( res => {
        const corruptHtml = res.data;
        const data = iconv.decode(corruptHtml, 'windows-1250');
        const utf8Data = iconv.encode(data, 'utf-8').toString();
        const $ = cheerio.load(utf8Data);
        
        const articles = [];
        
        // Iterating over the elements
        $('.popup-gallery', utf8Data).first().each(function () {
            const SOUP = $(this).find('.polozka').first().text()+' Kč';
            const jidlo = $(this).find('.jidlo').text()
            const newString = jidlo.replace(/\n/g, "").trimStart();
            const regex = /(\d+\.\s.*?Kč)/g;
            const MENU = newString.match(regex);
            
            // Add line breaks after each match in the MENU array
            const formattedMenu = MENU.map(item => item.replace(/Kč/g, 'Kč\n')).join('');

            articles.push({ SOUP, MENU: formattedMenu });
        });
        console.log(pepa)

        
        // Posting to Slack outside of the .each() function
        app.client.chat.postMessage({
            channel: 'C05NT57ANBA',
            token: process.env.TOKEN,
            text: `Dnešní menu v restauraci Corleone Anděl:\n\n${articlesToString(articles)}` // Convert the object to a custom string
        }).catch(error => {
            console.error(error);
        });
    })
    .catch(error => {
        console.error(error)
    })

}

// Custom function to convert the articles object to a string
function articlesToString(articles) {
    let result = '';
    articles.forEach(article => {
        result += `Soup:\n ${article.SOUP}\n`;
        result += 'Menu:\n';
        result += article.MENU;

    });
    return result;
}


const job = schedule.scheduleJob('00 11 * * 1-5', function() {
    vidle();
    corleone()
});
