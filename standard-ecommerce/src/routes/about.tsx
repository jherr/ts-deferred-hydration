import { createFileRoute } from '@tanstack/react-router'
import styles from './about.module.css'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <p className={styles.kicker}>About</p>
        <h1 className={styles.title}>A small starter with room to grow.</h1>
        <p className={styles.body}>
          TanStack Start gives you type-safe routing, server functions, and
          modern SSR defaults. Use this as a clean foundation, then layer in
          your own routes, styling, and add-ons.
        </p>
      </section>
    </main>
  )
}
