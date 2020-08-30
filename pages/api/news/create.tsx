import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient({ log: ["query"] });

    try {
        const { news: newsData } = req.body;
        const news = await prisma.news.create({
            data: {
                siteUrl: newsData.siteUrl,
                imageUrl: newsData.imageUrl,
                descr: newsData.descr,
                title: newsData.title,
            },
        });
        res.status(201);
        res.json({ news });
    } catch (e) {
        res.status(500);
        res.json({ error: "Sorry unable to save news to database" });
    } finally {
        await prisma.$disconnect()
    }
}