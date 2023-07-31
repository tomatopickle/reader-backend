import { JSDOM } from 'jsdom'
import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import request from 'request'

const app = express()
const port = 8000

app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/trending', async (req, res) => {
    const response = await fetch('https://www.annas-archive.org/')
    const data = await response.text()
    const discoverBooksSelector = 'a.custom-a.flex.items-center.relative'
    const dom = new JSDOM(data)
    let result = []
    dom.window.document.querySelectorAll(discoverBooksSelector).forEach((el) => {
        const title = el.querySelector('h3').textContent;
        const authors = el.querySelector('div.text-lg.italic').textContent;
        const cover = el.querySelector('img').src;
        result.push({ title, authors, cover })
    })
    res.json(result)
})
app.get('/book', async (req, res) => {
    const response = await fetch(`https://www.annas-archive.org/${req.query.url}`)
    const data = await response.text()
    const dom = new JSDOM(data)
    let title = dom.window.document.querySelector('.text-3xl.font-bold').textContent
    let publisher = dom.window.document.querySelector('.text-md').textContent
    let authors = dom.window.document.querySelector('.italic').textContent
    let description = dom.window.document.querySelector('.js-md5-top-box-description').innerHTML.replaceAll('<br>','\n')
    let cover = dom.window.document.querySelector('main img').src
    let downloadLink = dom.window.document.querySelector('main ul.mb-4:not(.js-fast-download-links-enabled) a').href
    title = title.replace('🔍','').trim()
    authors = authors.replace('🔍','').trim()
    let book = { title, publisher, authors, description, cover, downloadLink }
    res.json(book)
})
app.get('/search', async (req, res) => {
    const response = await fetch(`https://www.annas-archive.org/search?lang=&content=&ext=epub&sort=&q=${req.query.q}`)
    const data = await response.text()
    const discoverBooksSelector = '.custom-a.flex.items-center.relative'
    const dom = new JSDOM(data)
    let result = []
    dom.window.document.querySelectorAll(discoverBooksSelector).forEach((el) => {
        const link = el.href;
        const title = el.querySelector('h3').textContent;
        const authors = el.querySelector('div.italic').textContent;
        const cover = el.querySelector('img').src;
        const publisher = el.querySelector('div.text-sm').textContent;
        const fileName = el.querySelector('div.truncate.text-xs').textContent;
        result.push({ title, authors, cover, publisher, fileName, link })
    })
    res.json(result)
})

app.get('/cors', async (req, res) => {
    request({ url: req.query.url, method: req.method, headers: { 'Authorization': req.header('Authorization') } },
        function (error, response, body) {
            if (error) {
                console.log(error)
                // console.error('error: ' + response.statusCode)
            }
        }).pipe(res);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})