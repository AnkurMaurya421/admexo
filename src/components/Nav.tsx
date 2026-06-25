"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.brand}>
        <span className={styles.brandDot} />
        LeadTrack
      </Link>

      <div className={styles.tabs}>
        <Link
          href="/"
          className={`${styles.tab} ${pathname === "/" ? styles.tabActive : ""}`}
        >
          Contact Form
        </Link>
        <Link
          href="/dashboard"
          className={`${styles.tab} ${pathname === "/dashboard" ? styles.tabActive : ""}`}
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
