const express = require('express');
const iconv = require('iconv-lite');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();


const VIDLICKY_A_NOZE = 'https://www.menicka.cz/2271-smichovske-vidlicky-a-noze.html'


axios.get(VIDLICKY_A_NOZE, {responseType: 'arraybuffer'} )
    .then( res => {
        const corruptHtml = res.data;
        const data = iconv.decode(corruptHtml, 'windows-1250');
        const utf8Data = iconv.encode(data, 'utf-8').toString();
        const $ = cheerio.load(utf8Data)
        const articles = []
        $('.popup-gallery', utf8Data).first().each(function () {

            const SOUP = $(this).find('.polozka').first().text()+' Kč';
            const jidlo = $(this).find('.jidlo').text()
            const newString = jidlo.replace(/\n/g, "").trimStart();
            const regex = /(\d+\.\s.*?Kč)/g;
            const MENU = newString.match(regex);
           
            articles.push({ SOUP ,MENU })
        })
        console.log(articles)

    })
// https.get(url, req => {
//     req.on('data', (data) => {
//         console.log(data.toString('utf8'))
//     })
// })

app.listen(process.env.PORT, () => console.log('server running'))