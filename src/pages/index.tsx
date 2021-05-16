import { GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FaCalendar, FaUser } from 'react-icons/fa';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header/index';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function mapPosts(posts: Post[]): Post[] {
  posts.map(result => {
    result.data.title = Array.isArray(result.data.title)
      ? RichText.asText(result.data.title)
      : result.data.title;
    result.data.subtitle = Array.isArray(result.data.subtitle)
      ? RichText.asText(result.data.subtitle)
      : result.data.subtitle;
    result.data.author = Array.isArray(result.data.author)
      ? RichText.asText(result.data.author)
      : result.data.author;
    return result;
  });

  return posts;
}

export default function Home({ postsPagination }: HomeProps) {
  const mapped = mapPosts([...postsPagination.results]);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(mapped);

  function handlePagination(): void {
    fetch(`/api/prismic?nextpage=${btoa(nextPage)}`)
      .then(response => response.json())
      .then(response => {
        response.results.map(result => {
          result.first_publication_date = format(
            new Date(result.first_publication_date),
            'dd MMM yyyy',
            { locale: ptBR }
          );
        });
        setPosts([...posts, ...mapPosts(response.results)]);
        setNextPage(response.next_page);
      });
  }

  return (
    <>
      <Header />
      <main className={commonStyles.conatiner}>
        {posts.map(post => (
          <article key={post.uid} className={commonStyles.post}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <span>
                  <FaCalendar />&nbsp;&nbsp;<span>{post.first_publication_date}</span>
                  <FaUser />&nbsp;&nbsp;{post.data.author}
                </span>
              </a>
            </Link>
          </article>
        ))}
        <div className={styles.loadmore}>
          {nextPage && (
            <button onClick={() => handlePagination()}>Carregar mais posts</button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { pageSize: 1 }
  );

  response.results.map(result => {
    result.first_publication_date = format(
      new Date(result.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    );
  });

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: response.results,
      },
    },
  };
};
