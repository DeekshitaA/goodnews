import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer-core'
import chromium from 'chrome-aws-lambda'

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
    });
    const prisma = new PrismaClient({ log: ["query"] });

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
                    newsArticles.map(async data => {
                        await prisma.news.create({
                            data
                        });
                    })
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
                    console.log('goodnews', newsArticles)
                    newsArticles.map(async data => {
                        await prisma.news.create({
                            data
                        });
                    })
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