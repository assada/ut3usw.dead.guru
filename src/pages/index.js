import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import classnames from 'classnames';
import CodeBlock from '@theme/CodeBlock';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

import Heading from '@theme/Heading';
import styles from './index.module.css';

import Float from "../components/float";

import ScrambleIn, {
  ScrambleInHandle,
} from "@site/src/components/scramble-in"

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
    
    const baseSpeed = 15;
    const maxSpeed = 25;
    const repelForce = 100;
    const friction = 0.72;
    const detectionRadius = 30;
    const cornerEscapeDistance = 100;
    const cornerEscapeForce = 80;
    const predictionMultiplier = 6;
    let lastTime = performance.now();
    let animationId;
    let currentMousePos = { x: -1000, y: -1000 };
    let lastMousePos = { x: -1000, y: -1000 };
    let mouseVelocity = { x: 0, y: 0 };

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
          pushDirection.x = (dirX / distance) * 8;
          pushDirection.y = (dirY / distance) * 8;
        }
      }
      
      if (Math.abs(pushDirection.x) < 0.1 && Math.abs(pushDirection.y) < 0.1) {
        pushDirection.x = (Math.random() - 0.5) * 6;
        pushDirection.y = -4.0;
      }
      
      setTimeout(() => {
        if (isActive) {
          velocityX = pushDirection.x * 40;
          velocityY = pushDirection.y * 40;
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
        bouncingImage.style.transition = '';
        bouncingImage.style.opacity = '';
        bouncingImage.style.transform = '';
        velocityX = 0;
        velocityY = 0;
      }, 300);
    }
    
    let currentTouchId = null;
    let isMouseDown = false;
    
    const iframe = document.querySelector('iframe');

    function applyRepelForce(mouseX, mouseY) {
      const imageCenter = {
        x: x + imageHalfWidth,
        y: y + imageHalfHeight
      };
      
      const predictedMouseX = mouseX + mouseVelocity.x * predictionMultiplier;
      const predictedMouseY = mouseY + mouseVelocity.y * predictionMultiplier;
      
      const distanceCurrent = Math.sqrt(
        Math.pow(mouseX - imageCenter.x, 2) +
        Math.pow(mouseY - imageCenter.y, 2)
      );
      
      const distancePredicted = Math.sqrt(
        Math.pow(predictedMouseX - imageCenter.x, 2) +
        Math.pow(predictedMouseY - imageCenter.y, 2)
      );
      
      const effectiveMouseX = distancePredicted < distanceCurrent ? predictedMouseX : mouseX;
      const effectiveMouseY = distancePredicted < distanceCurrent ? predictedMouseY : mouseY;
      const effectiveDistance = Math.min(distanceCurrent, distancePredicted);
      
      if (effectiveDistance < detectionRadius && effectiveDistance > 0) {
        const repelX = imageCenter.x - effectiveMouseX;
        const repelY = imageCenter.y - effectiveMouseY;
        
        const normalizedX = repelX / effectiveDistance;
        const normalizedY = repelY / effectiveDistance;
        
        if (effectiveDistance < 100) {
          velocityX = normalizedX * maxSpeed * 0.9;
          velocityY = normalizedY * maxSpeed * 0.9;
        } else {
          const distanceFactor = 1 - (effectiveDistance / detectionRadius);
          let forceMagnitude = repelForce * Math.pow(distanceFactor, 4);
          
          if (effectiveDistance < 150) {
            forceMagnitude *= 4;
          } else if (effectiveDistance < 250) {
            forceMagnitude *= 2.5;
          } else if (effectiveDistance < 400) {
            forceMagnitude *= 1.5;
          }
          
          velocityX += normalizedX * forceMagnitude;
          velocityY += normalizedY * forceMagnitude;
          
          const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
          if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            velocityX *= scale;
            velocityY *= scale;
          }
        }
      }
    }

    function avoidCorners() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const imageCenter = {
        x: x + imageHalfWidth,
        y: y + imageHalfHeight
      };
      
      const distanceToLeft = x;
      const distanceToRight = screenWidth - (x + imageWidth);
      const distanceToTop = y;
      const distanceToBottom = screenHeight - (y + imageHeight);
      
      const minDistanceX = Math.min(distanceToLeft, distanceToRight);
      const minDistanceY = Math.min(distanceToTop, distanceToBottom);
      
      if (minDistanceX < cornerEscapeDistance) {
        const distanceFactor = 1 - (minDistanceX / cornerEscapeDistance);
        const force = cornerEscapeForce * distanceFactor * distanceFactor * distanceFactor;
        if (distanceToLeft < distanceToRight) {
          velocityX += force * 3;
        } else {
          velocityX -= force * 3;
        }
      }
      
      if (minDistanceY < cornerEscapeDistance) {
        const distanceFactor = 1 - (minDistanceY / cornerEscapeDistance);
        const force = cornerEscapeForce * distanceFactor * distanceFactor * distanceFactor;
        if (distanceToTop < distanceToBottom) {
          velocityY += force * 3;
        } else {
          velocityY -= force * 3;
        }
      }
      
      if (minDistanceX < cornerEscapeDistance && minDistanceY < cornerEscapeDistance) {
        const escapeAngle = Math.atan2(screenHeight / 2 - imageCenter.y, screenWidth / 2 - imageCenter.x);
        const cornerFactor = 1 - Math.min(minDistanceX, minDistanceY) / cornerEscapeDistance;
        const cornerForce = cornerEscapeForce * Math.pow(cornerFactor, 3) * 8;
        velocityX += Math.cos(escapeAngle) * cornerForce;
        velocityY += Math.sin(escapeAngle) * cornerForce;
      }
    }

    function animateBounce(currentTime) {
      if (!isAnimating) return;
      
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;

      mouseVelocity.x *= 0.85;
      mouseVelocity.y *= 0.85;

      applyRepelForce(currentMousePos.x, currentMousePos.y);
      avoidCorners();

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
        velocityX = -Math.abs(velocityX) * 0.9;
      }
      if (x < 0) {
        x = 0;
        velocityX = Math.abs(velocityX) * 0.9;
      }
      if (y + imageHeight > window.innerHeight) {
        y = window.innerHeight - imageHeight;
        velocityY = -Math.abs(velocityY) * 0.9;
      }
      if (y < 0) {
        y = 0;
        velocityY = Math.abs(velocityY) * 0.9;
      }

      const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      
      if (currentSpeed > baseSpeed) {
        velocityX *= friction;
        velocityY *= friction;
      } else if (currentSpeed > 1) {
        const scale = baseSpeed / currentSpeed;
        velocityX *= scale;
        velocityY *= scale;
      }
      
      const clampedSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (clampedSpeed > maxSpeed) {
        const scale = maxSpeed / clampedSpeed;
        velocityX *= scale;
        velocityY *= scale;
      }

      bouncingImage.style.transform = `translate(${x}px, ${y}px)`;
      animationId = requestAnimationFrame(animateBounce);
    }
    
    function handleMouseMove(e) {
      const newX = e.clientX;
      const newY = e.clientY;
      
      mouseVelocity.x = newX - lastMousePos.x;
      mouseVelocity.y = newY - lastMousePos.y;
      
      lastMousePos.x = currentMousePos.x;
      lastMousePos.y = currentMousePos.y;
      currentMousePos.x = newX;
      currentMousePos.y = newY;
    }

    function handleMouseDown(e) {
      isMouseDown = true;
      lastMousePos.x = currentMousePos.x;
      lastMousePos.y = currentMousePos.y;
      currentMousePos.x = e.clientX;
      currentMousePos.y = e.clientY;
    }

    function handleMouseUp() {
      isMouseDown = false;
    }
    
    function handleImageClick(e) {
      if (!isActive) return;
      
      e.stopPropagation();
      
      const rect = bouncingImage.getBoundingClientRect();
      const centerX = (rect.left + rect.right) / 2;
      const centerY = (rect.top + rect.bottom) / 2;
      
      const xPos = centerX / window.innerWidth;
      const yPos = centerY / window.innerHeight;
      
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { x: xPos, y: yPos },
        colors: ['#8B0000', '#A50000', '#C00000', '#DC143C', '#FF0000'],
        startVelocity: 50,
        gravity: 1.2,
        scalar: 1.4,
        ticks: 120,
      });
      
      confetti({
        particleCount: 120,
        spread: 180,
        origin: { x: xPos, y: yPos },
        colors: ['#8B0000', '#B22222', '#DC143C', '#FF4444'],
        startVelocity: 70,
        gravity: 0.8,
        scalar: 1.0,
        ticks: 140,
      });
      
      confetti({
        particleCount: 80,
        spread: 360,
        origin: { x: xPos, y: yPos },
        colors: ['#A50000', '#C00000', '#DC143C'],
        startVelocity: 80,
        gravity: 1.5,
        scalar: 0.7,
        shapes: ['circle'],
        ticks: 100,
      });
      
      bouncingImage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      bouncingImage.style.opacity = '0';
      bouncingImage.style.transform = `translate(${x}px, ${y}px) scale(0)`;
      
      setTimeout(() => {
        deactivateBouncing();
      }, 300);
    }
    
    function handleTouchStart(e) {
      if (currentTouchId || e.touches.length === 0) return;
      
      const touch = e.touches[0];
      currentTouchId = touch.identifier;
      lastMousePos.x = currentMousePos.x;
      lastMousePos.y = currentMousePos.y;
      currentMousePos.x = touch.clientX;
      currentMousePos.y = touch.clientY;
    }

    function handleTouchMove(e) {
      const touch = Array.from(e.touches).find(t => t.identifier === currentTouchId);
      if (touch) {
        const newX = touch.clientX;
        const newY = touch.clientY;
        
        mouseVelocity.x = newX - lastMousePos.x;
        mouseVelocity.y = newY - lastMousePos.y;
        
        lastMousePos.x = currentMousePos.x;
        lastMousePos.y = currentMousePos.y;
        currentMousePos.x = newX;
        currentMousePos.y = newY;
      }
    }

    function handleTouchEnd(e) {
      if (e.touches.length === 0 || !Array.from(e.touches).some(t => t.identifier === currentTouchId)) {
        currentTouchId = null;
        currentMousePos.x = -1000;
        currentMousePos.y = -1000;
        lastMousePos.x = -1000;
        lastMousePos.y = -1000;
        mouseVelocity.x = 0;
        mouseVelocity.y = 0;
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    bouncingImage.addEventListener('click', handleImageClick);
    bouncingImage.addEventListener('touchend', (e) => {
      if (e.target === bouncingImage) {
        handleImageClick(e);
      }
    });

    staticLogo.addEventListener('mouseenter', (e) => {
      activateBouncing(e);
    });
    staticLogo.addEventListener('touchstart', (e) => {
      activateBouncing(e);
    }, { passive: true });
    
    let deactivateTimeout;
    document.addEventListener('mouseleave', () => {
      currentMousePos.x = -1000;
      currentMousePos.y = -1000;
      lastMousePos.x = -1000;
      lastMousePos.y = -1000;
      mouseVelocity.x = 0;
      mouseVelocity.y = 0;
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
      bouncingImage.removeEventListener('click', handleImageClick);
      staticLogo.removeEventListener('mouseenter', activateBouncing);
      staticLogo.removeEventListener('touchstart', activateBouncing);
      window.removeEventListener('resize', positionAtLogo);
    };
  }, []);

  return (
      <Layout title={`Журнал UT3USW. dead.md`} Add commentMore actions
              description="Персональний журнал про радіо, програмування та інженерію від людини.">
        <img id={"bouncing-image"} alt={"dead!"} src={"/img/animation_logo.gif"} width="120" height="120"/>
        <header className={clsx('hero', styles.heroBanner)}>
          <div className="container">
            <div className="row">
              <div className="col col--5">
                <img id={"static-logo"} src={"/img/animation_logo.gif"} alt={"dead!"} width="120" height="120"/>
                <Heading as="h1" className="hero__title">
                  <ScrambleIn scrambledLetterCount={8} text={siteConfig.title} autoStart={true} />
                </Heading>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                  <Link
                      className="button button--secondary button--lg"
                      to="/docs/intro">
                    <ScrambleIn scrambledLetterCount={8} text={"Continue exploring?"} autoStart={true} />
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
