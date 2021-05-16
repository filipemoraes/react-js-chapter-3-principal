import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FaCalendar, FaUser, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header/index';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function mapPosts(post: Post): Post {
  post.data.title = Array.isArray(post.data.title)
    ? RichText.asText(post.data.title)
    : post.data.title;
  post.data.author = Array.isArray(post.data.author)
    ? RichText.asText(post.data.author)
    : post.data.author;
  post.data.content.map(content => {
    const heading = Array.isArray(content.heading)
      ? RichText.asText(content.heading)
      : content.heading;
    const body = Array.isArray(content.body)
      ? RichText.asHtml(content.body)
      : content.body;
    content.heading = heading;
    content.body = body;
  });

  return post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  //TODO fallback

  const mapPost = mapPosts(post);
  let words = 0;
  post.data.content.forEach(content => words += content.body.split(" ").length );
  const time = Math.ceil(words/200);

  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={mapPost.data.banner.url} />
      </div>
      <article className={commonStyles.conatiner}>
        <div className={commonStyles.post}>
          <h1>{mapPost.data.title}</h1>
          <span>
            <FaCalendar />&nbsp;&nbsp;<span>{mapPost.first_publication_date}</span>
            <FaUser />&nbsp;&nbsp;<span>{mapPost.data.author}</span>
            <FaClock />&nbsp;&nbsp;<span>{time} min</span>
          </span>
          {mapPost.data.content.map((content, i) => (
            <div key={i}>
              <h2>{content.heading}</h2>
              <div className={commonStyles.body} dangerouslySetInnerHTML={{ __html: content.body }} />
            </div>
          ))}
        </div>
      </article>
    </>
  );
}

export const getStaticPaths = async () => {
  const paths: Array<{ params: { slug: string } }> = [];
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { pageSize: 1000 }
  );

  response.results.forEach(post => {
    paths.push({ params: { slug: post.uid } });
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', String(slug), {});

  if (post) {
    post.first_publication_date = format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    );
  };

  return {
    props: {
      post: post ? post : null,
    },
  };
};
