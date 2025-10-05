import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <header className={clsx('hero', styles.heroMeshtastic)}>
            <div className="container">
                <img src="https://meshtastic.letstalkthis.com/wp-content/uploads/2022/02/Logo4.png" className="mx-auto" alt="" />
                <Heading as="h3" className="hero__title">
                    Неофіційний <span className={clsx(styles.underliner)}>Quick Start</span> гайд по Meshtastic
                </Heading>
                <div className={styles.buttons}>
                    <Link
                        className={clsx("button button--lg margin-right--lg", styles.buttonMesh)}
                        to="/docs/intro">
                        Розпочати →
                    </Link>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/intro">
                        Офіційна документація
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home() {
    return (
        <Layout
            title={`Персоналні нотатки UT3USW. dead.md`}
            description="Персональні нотатки про радіо, програмування та інженерію від однієї людини.">
            <HomepageHeader />
            <div className="container">
                <div className="row">
                    <div className="col--">
                        <p className={clsx('text--center')}><strong>Meshtastic</strong> — це проект, який дозволяє використовувати недорогі трансивери на базі LoRa як дальньобійну комунікаційну платформу в зонах без наявної або ненадійної комунікаційної інфраструктури.</p>
                        <p className={clsx('text--center')}>Радіостанції автоматично ретранслюють отримані повідомлення, щоб створити розподілену меш мережу, щоб усі в групі могли отримувати повідомлення – навіть від найдальшого учасника. Залежно від налаштувань, що використовуються, Meshtastic меш може підтримувати до 80 вузлів пристроїв (але загалом, можливо і більше).</p>
                    </div>
                    <div className="col--3">
                        a?
                    </div>
                </div>
            </div>

            <div className={clsx('row--align-center margin-top--lg', styles.meshRow)}>

            </div>
        </Layout>
    );
}