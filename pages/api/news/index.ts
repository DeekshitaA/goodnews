import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient({ log: ["query"] });

    try {
        const news = await prisma.news.findMany();
        res.status(200);
        res.json({ news });
    } catch (e) {
        res.status(500);
        res.json({ error: "Unable to fetch news" });
    } finally {
        await prisma.$disconnect()
    }
}