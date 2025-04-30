import React from 'react';
import styles from './styles.module.css';
import TwitterBookmark from '../TwitterBookmark';

export default function BookmarksList({ bookmarks }) {
  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No bookmarks found</h2>
        <p>Try checking your JSON file or reload the page</p>
      </div>
    );
  }

  return (
    <div className={styles.bookmarksList}>
      {bookmarks.map((bookmark, index) => (
        <TwitterBookmark key={index} bookmark={bookmark} />
      ))}
    </div>
  );
} 