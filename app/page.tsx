import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <span className={styles.badge}>Coming soon</span>
        <h1 className={styles.title}>Pivotum</h1>
        <p className={styles.tagline}>
          Helping parents understand how AI is reshaping their kids&rsquo;
          career choices &mdash; and how to guide them with confidence.
        </p>
        <p className={styles.note}>
          We&rsquo;re building a place for parents to make sense of a fast-changing
          world of work. Real guidance, grounded in how artificial intelligence
          is actually changing careers.
        </p>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Pivotum</p>
      </footer>
    </main>
  );
}
