import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient({ log: ["query"] });

    try {
        await prisma.news.deleteMany({})
        res.status(200);
        res.json({ msg: "Successfully truncates news table" });
    } catch (e) {
        res.status(500);
        res.json({ error: "Sorry unable to truncate news table in database" });
    } finally {
        await prisma.$disconnect()
    }
}