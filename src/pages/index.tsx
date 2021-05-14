import { GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FaCalendar, FaUser } from 'react-icons/fa';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';
import { PostAdater } from './api/_lib/post.adapter';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  function handlePagination(): void {
    fetch(`/api/prismic?nextpage=${btoa(nextPage)}`)
      .then(response => response.json())
      .then(response => {
        const newPosts = response.results.map(post => PostAdater(post));
        setPosts([...posts, ...newPosts]);
        setNextPage(response.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Posts | Spacetraveling</title>
      </Head>
      <main className={styles.conatiner}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <span>
                  <FaCalendar />&nbsp;&nbsp;{post.first_publication_date}
                  <FaUser />&nbsp;&nbsp;{post.data.author}
                </span>
              </a>
            </Link>
          ))}
        </div>
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
    {pageSize: 1}
  );

  const posts = response.results.map(post => PostAdater(post));

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
    },
  };
};
