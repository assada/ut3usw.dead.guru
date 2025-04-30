import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import classnames from 'classnames';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock';


import Heading from '@theme/Heading';
import styles from './index.module.css';

const exampleCode = `#include <iostream>
#include <random>

int main() {
    std::mt19937 g{std::random_device{}()};
    std::uniform_real_distribution<> d(0,1);
    int in = 0, N = 1e6;
    for (int i = 0; i < N; ++i) in += d(g)*d(g) < 1;
    std::cout << 4.0 * in / N << '\\n';
}`;

const codeExamples = [
  {
    language: 'cpp',
    code: exampleCode,
  },
  {
    language: 'cpp',
    code: `#include <iostream>

template<int N>
struct H { static void go() { std::cout << "Hello, World!\\n"; } };

int main() {
    constexpr int magic = __LINE__;
    H<magic>::go();
}    
`,
  },
  {
    language: 'cpp',
    code: `#include <iostream>

template<int N> struct F { static constexpr int val = F<N-1>::val + F<N-2>::val; };
template<> struct F<0>{static constexpr int val=0;};
template<> struct F<1>{static constexpr int val=1;};

int main() { std::cout << F<10>::val; }`,
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
          <img src="/img/animation_logo.gif" className="mx-auto" alt="Dead Guru!" />
        <Heading as="h1" className="hero__title">
            {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Continue exploring?
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`} description="Documentation for the C# .NET SpotifyAPI-NET Library">
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className="row">
          <div className="col col--5">
            <img src="/img/animation_logo.gif" width="120" height="120" />
            <Heading as="h1" className="hero__title">
            {siteConfig.title}
            </Heading>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className={styles.buttons}>
              <Link
              className="button button--secondary button--lg"
              to="/docs/intro">
              Continue exploring?
            </Link>
            </div>
          </div>
          <div className={classnames('col col--7', styles.exampleCode)}>
            <CodeBlock language="cpp" className="cpp">
              {codeExamples[Math.floor(Math.random() * codeExamples.length)].code}
            </CodeBlock>
          </div>
        </div>
      </div>
    </header>
  </Layout>
  );
}
