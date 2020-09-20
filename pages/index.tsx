import Head from 'next/head'
import CardColumns from 'react-bootstrap/CardColumns';
import Card from 'react-bootstrap/Card';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import useSWR from 'swr'

const fetcher = url => fetch(url).then(res => res.json());

export default function Home() {
  const { data, error } = useSWR('/api/news', fetcher)

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  const { news } = data;
  return (
    <>
      <Container>
        <Head>
          <title>Good News</title>
        </Head>
        <Jumbotron
          fluid
          style={{ backgroundImage: 'url(/images/homeBanner.jpg)', backgroundSize: 'cover' }}
          className="text-center"
        >
          <Container>
            <h1 className="text-white">Good News</h1>
            <h2 className="text-white">
              Daily
                        </h2>
          </Container>
        </Jumbotron>
        <CardColumns>
          {news.map(({ id, title, imageUrl, siteUrl }) => (

            <a key={id} href={siteUrl} target="_blank" >
              <Card>
                <Card.Img variant="top" src={imageUrl} />
                <Card.Body>
                  <Card.Title>{title}</Card.Title>
                </Card.Body>
              </Card>
            </a>

          ))}
        </CardColumns>
      </Container>
    </>
  )
}