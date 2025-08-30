import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Admonition from '@theme/Admonition';
import styles from './bookmarks.module.css';
import BookmarksList from '../components/BookmarksList';
export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/prepared.json')
      .then(response => response.json())
      .then(data => {
        setBookmarks(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading bookmarks:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <Layout title="Закладки" description="Мої закладки з Twitter">
      <main className="container margin-vert--lg">
        <div style={{maxWidth: "800px", flexDirection: "column", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center",}}>
        <Admonition type="info" icon="😔" title="Оновлення">
            Ця сторінка автоматично оновлюється. Але в ручному режимі. Тобто у мене є скріпт що збирає всі мої закладки і формує цей список. Але через статичну суть цього сайту, цей список оновлюється разом з білдом всього сайту. Я спробую хочаб один раз в квартал оновлювати цей список. Сподіваюсь голих дівок тут не вилізе...
        </Admonition>
        <Admonition type="warning" icon="🖼️" title="Медіа">
            Я не зберігаю медіа файли у себе на сервері. А напряму вказую на оригінальні URL-адреси. Тому якщо ви бачите що щось не працює, то спробуйте перейти по оригінальній URL-адресі твіта.
        </Admonition>
        </div>
      
        {isLoading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
          </div>
        ) : (
          <BookmarksList bookmarks={bookmarks} />
        )}
      </main>
    </Layout>
  );
} 