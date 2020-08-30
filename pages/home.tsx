import Head from 'next/head'
import useSWR from 'swr'
import styles from '../styles/Home.module.css'

const fetcher = url => fetch(url).then(res => res.json());

export default function NewsHome() {
    const { data, error } = useSWR('/api/news', fetcher)

    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>
    const { news } = data;
    return (
        <div className={styles.container}>
            <Head>
                <title>Good News</title>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to Good News!
                </h1>

                <div className={styles.grid}>
                    {news.map(({ title, imageUrl, siteUrl }) => (
                        <a href={siteUrl} className={styles.card}>
                            <h3>{title}</h3>
                            <img
                                src={imageUrl}
                                className={styles.headerHomeImage}
                                alt={title}
                            />
                        </a>

                    ))}
                </div>
            </main>
        </div>
    )
}