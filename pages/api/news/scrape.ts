import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client';
import chromium from 'chrome-aws-lambda'

const isProd = process.env.NODE_ENV === "production";
let puppeteer;
if (isProd) {
    puppeteer = require("puppeteer-core");
} else {
    puppeteer = require("puppeteer");
}
async function addToDB(newsArticles) {
    const prisma = new PrismaClient({ log: ["query"] });
    newsArticles.map(async data => {
        await prisma.news.upsert({
            where: { siteUrl: data.siteUrl },
            update: {
                imageUrl: data.imageUrl,
                title: data.title
            },
            create: {
                imageUrl: data.imageUrl,
                siteUrl: data.siteUrl,
                title: data.title
            },
        });
    });
}
export default async function (req: NextApiRequest, res: NextApiResponse) {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: true,
    });

    try {
        const { urlList } = req.body;
        const page = await browser.newPage();
        let news = [];
        for (const url of urlList) {
            console.log('url', url);
            await page.goto(url);
            //TODO: need to figure out how to get all news items await page.waitForSelector('div.td-block-span6')
            switch (url) {
                case 'https://www.positive.news': {
                    let newsArticles = await page.evaluate(() =>
                        // let's just get all links and create an array from the resulting NodeList
                        Array.from(document.querySelectorAll('div.column, div.card')).map(news => {
                            return {
                                'siteUrl': news.querySelector('a').href,
                                'imageUrl': news.querySelector('img').src,
                                'title': news.querySelector('span').innerText,
                            }
                        })
                    )
                    addToDB(newsArticles);
                    break;
                }
                case 'https://www.goodnewsnetwork.org': {
                    let newsArticles = await page.evaluate(() =>
                        // let's just get all links and create an array from the resulting NodeList
                        Array.from(document.querySelectorAll('div.td-block-span6')).map(news => {
                            return {
                                'siteUrl': news.querySelector('a').href,
                                'imageUrl': news.querySelector('img').src,
                                'title': news.querySelector('a').title,
                            }
                        })
                    )
                    addToDB(newsArticles);
                    break;
                }
            }
        };
        res.status(201);
        res.json({ msg: 'Scraped data stored in Database' })
    } catch {
        res.status(500);
        res.json({ error: 'Cannot scrape data' });
    } finally {
        // close the browser 
        await browser.close();
    }
}