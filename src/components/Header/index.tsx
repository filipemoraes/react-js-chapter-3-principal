import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <img alt="logo" src="/images/logo.svg" />
            <span>spacingtraveling</span>.
          </a>
        </Link>
      </div>
    </header>
  );
}
