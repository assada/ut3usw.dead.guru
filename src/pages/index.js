import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import classnames from 'classnames';
import CodeBlock from '@theme/CodeBlock';
import { useEffect } from 'react';

import Heading from '@theme/Heading';
import styles from './index.module.css';

import TerminalCard from '@site/src/components/TerminalCard';

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

  useEffect(() => {
    const bouncingImage = document.getElementById('bouncing-image');
    const staticLogo = document.getElementById('static-logo');
    if (!bouncingImage || !staticLogo) return;

    const imageWidth = bouncingImage.width || 120;
    const imageHeight = bouncingImage.height || 120;
    const imageHalfWidth = imageWidth / 2;
    const imageHalfHeight = imageHeight / 2;

    let x = 0;
    let y = 0;
    let velocityX = 0;
    let velocityY = 0;
    let isActive = false;
    let isAnimating = false;
    
    const baseSpeed = 2;
    const maxSpeed = 19;
    const hitForceMultiplier = 0.4;
    const friction = 0.99;
    const hitRadius = Math.max(imageWidth, imageHeight) * 0.8;
    let lastTime = performance.now();
    let animationId;

    function positionAtLogo() {
      const logoRect = staticLogo.getBoundingClientRect();
      x = logoRect.left;
      y = logoRect.top;
      bouncingImage.style.transform = `translate(${x}px, ${y}px)`;
    }

    positionAtLogo();

    function activateBouncing(event) {
      if (isActive) return;
      
      isActive = true;
      
      staticLogo.classList.add('hidden');
      bouncingImage.classList.add('active');
      
      velocityX = 0;
      velocityY = 0;
      
      let pushDirection = { x: 0, y: 0 };
      
      if (event) {
        const logoRect = staticLogo.getBoundingClientRect();
        const logoCenterX = logoRect.left + logoRect.width / 2;
        const logoCenterY = logoRect.top + logoRect.height / 2;
        
        let clientX, clientY;
        if (event.touches && event.touches[0]) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else {
          clientX = event.clientX;
          clientY = event.clientY;
        }
        
        const dirX = logoCenterX - clientX;
        const dirY = logoCenterY - clientY;
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        
        if (distance > 0) {
          pushDirection.x = (dirX / distance) * 1;
          pushDirection.y = (dirY / distance) * 1;
        }
      }
      
      if (Math.abs(pushDirection.x) < 0.1 && Math.abs(pushDirection.y) < 0.1) {
        pushDirection.x = (Math.random() - 0.5) * 0.5;
        pushDirection.y = -1.0;
      }
      
      setTimeout(() => {
        if (isActive) {
          velocityX = pushDirection.x;
          velocityY = pushDirection.y;
          isAnimating = true;
          
          if (!animationId) {
            animationId = requestAnimationFrame(animateBounce);
          }
        }
      }, 1);
    }

    function deactivateBouncing() {
      if (!isActive) return;
      
      isActive = false;
      isAnimating = false;
      
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      positionAtLogo();
      
      setTimeout(() => {
        staticLogo.classList.remove('hidden');
        bouncingImage.classList.remove('active');
        velocityX = 0;
        velocityY = 0;
      }, 300);
    }
    
    let lastMousePos = { x: 0, y: 0 };
    let currentTouchId = null;
    let isMouseDown = false;
    
    const iframe = document.querySelector('iframe');

    function checkImageHit(clientX, clientY, velocity) {
      const imageCenter = {
        x: x + imageHalfWidth,
        y: y + imageHalfHeight
      };
      
      const distance = Math.sqrt(
        Math.pow(clientX - imageCenter.x, 2) +
        Math.pow(clientY - imageCenter.y, 2)
      );
      
      if (distance < hitRadius) {
        velocityX += velocity.x * hitForceMultiplier;
        velocityY += velocity.y * hitForceMultiplier;
        
        const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        if (currentSpeed > maxSpeed) {
          const scale = maxSpeed / currentSpeed;
          velocityX *= scale;
          velocityY *= scale;
        }
        return true;
      }
      return false;
    }

    function animateBounce(currentTime) {
      if (!isAnimating) return;
      
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;

      x += velocityX * deltaTime;
      y += velocityY * deltaTime;
      
      if (iframe) {
        const iframeRect = iframe.getBoundingClientRect();
        const imageBottom = y + imageHeight;
        const imageRight = x + imageWidth;
        const imageTop = y;
        const imageLeft = x;
        
        if (imageBottom > iframeRect.top && 
            imageTop < iframeRect.top && 
            imageRight > iframeRect.left && 
            imageLeft < iframeRect.right &&
            velocityY > 0) {
          y = iframeRect.top - imageHeight;
          velocityY = -Math.abs(velocityY) * 0.8;
        }
        
        if (imageTop < iframeRect.bottom && 
            imageBottom > iframeRect.top) {
          if (imageRight > iframeRect.left && 
              imageLeft < iframeRect.left && 
              velocityX > 0) {
            x = iframeRect.left - imageWidth;
            velocityX = -Math.abs(velocityX) * 0.8;
          }
          else if (imageLeft < iframeRect.right && 
                   imageRight > iframeRect.right && 
                   velocityX < 0) {
            x = iframeRect.right;
            velocityX = Math.abs(velocityX) * 0.8;
          }
        }
      }
      
      if (x + imageWidth > window.innerWidth) {
        x = window.innerWidth - imageWidth;
        velocityX = -Math.abs(velocityX) * 0.8;
      }
      if (x < 0) {
        x = 0;
        velocityX = Math.abs(velocityX) * 0.8;
      }
      if (y + imageHeight > window.innerHeight) {
        y = window.innerHeight - imageHeight;
        velocityY = -Math.abs(velocityY) * 0.8;
      }
      if (y < 0) {
        y = 0;
        velocityY = Math.abs(velocityY) * 0.8;
      }

      velocityX *= friction;
      velocityY *= friction;
      
      const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (currentSpeed < baseSpeed && currentSpeed > 0.1) {
        const scale = baseSpeed / currentSpeed;
        velocityX *= scale;
        velocityY *= scale;
      }

      bouncingImage.style.transform = `translate(${x}px, ${y}px)`;
      animationId = requestAnimationFrame(animateBounce);
    }
    
    function handleMouseMove(e) {
      if (!isActive) return;
      
      const clientX = e.clientX;
      const clientY = e.clientY;
      const velocity = {
        x: (clientX - lastMousePos.x) * 0.5,
        y: (clientY - lastMousePos.y) * 0.5
      };
      
      checkImageHit(clientX, clientY, velocity);
      lastMousePos.x = clientX;
      lastMousePos.y = clientY;
    }

    function handleMouseDown(e) {
      if (!isActive) return;
      
      isMouseDown = true;
      lastMousePos.x = e.clientX;
      lastMousePos.y = e.clientY;
      checkImageHit(e.clientX, e.clientY, { x: 0, y: 0 });
    }

    function handleMouseUp() {
      isMouseDown = false;
    }
    
    function handleTouchStart(e) {
      if (!isActive || currentTouchId || e.touches.length === 0) return;
      
      const touch = e.touches[0];
      currentTouchId = touch.identifier;
      lastMousePos.x = touch.clientX;
      lastMousePos.y = touch.clientY;
      checkImageHit(touch.clientX, touch.clientY, { x: 0, y: 0 });
    }

    function handleTouchMove(e) {
      if (!isActive) return;
      
      const touch = Array.from(e.touches).find(t => t.identifier === currentTouchId);
      if (touch) {
        const clientX = touch.clientX;
        const clientY = touch.clientY;
        const velocity = {
          x: (clientX - lastMousePos.x) * 0.5,
          y: (clientY - lastMousePos.y) * 0.5
        };
        
        checkImageHit(clientX, clientY, velocity);
        lastMousePos.x = clientX;
        lastMousePos.y = clientY;
      }
    }

    function handleTouchEnd(e) {
      if (e.touches.length === 0 || !Array.from(e.touches).some(t => t.identifier === currentTouchId)) {
        currentTouchId = null;
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    staticLogo.addEventListener('mouseenter', (e) => {
      activateBouncing(e);
    });
    staticLogo.addEventListener('touchstart', (e) => {
      activateBouncing(e);
    }, { passive: true });
    
    let deactivateTimeout;
    document.addEventListener('mouseleave', () => {
      deactivateTimeout = setTimeout(deactivateBouncing, 2000);
    });
    
    document.addEventListener('mouseenter', () => {
      if (deactivateTimeout) {
        clearTimeout(deactivateTimeout);
        deactivateTimeout = null;
      }
    });
    
    window.addEventListener('resize', () => {
      if (!isActive) {
        positionAtLogo();
      }
    });
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (deactivateTimeout) {
        clearTimeout(deactivateTimeout);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      staticLogo.removeEventListener('mouseenter', activateBouncing);
      staticLogo.removeEventListener('touchstart', activateBouncing);
      window.removeEventListener('resize', positionAtLogo);
    };
  }, []);

  return (
      <Layout title={`Персоналні нотатки UT3USW. ut3usw.dead.guru`} Add commentMore actions
              description="Персональні нотатки про радіо, програмування та інженерію від однієї людини.">
        <img id={"bouncing-image"} alt={"dead!"} src={"/img/animation_logo.gif"} width="120" height="120"/>
        <header className={clsx('hero', styles.heroBanner)}>
          <div className="container">
            <div className="row">
              <div className="col col--5">
                <img id={"static-logo"} src={"/img/animation_logo.gif"} alt={"dead!"} width="120" height="120"/>
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
                <TerminalCard title="Terminal" glowing>
                <CodeBlock language="cpp" className="cpp">
                  {codeExamples[Math.floor(Math.random() * codeExamples.length)].code}
                </CodeBlock>
                </TerminalCard>
              </div>
            </div>
          </div>
        </header>
        <iframe height="500" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                src="https://irc.dead.guru/"></iframe>
      </Layout>
  );
}
