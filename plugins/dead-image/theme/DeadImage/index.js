/**
 * DeadImage — responsive <picture> with LQIP and built-in medium-zoom.
 *
 * Everything in one component:
 * - Responsive AVIF/WebP/JPEG with srcset
 * - Blurred LQIP placeholder that fades out on load
 * - Click-to-zoom: clone animates to viewport center
 * - Scroll/Escape/click overlay to dismiss
 * - Loads original (uncompressed) image during zoom
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import './styles.css';

const TRANSITION_MS = 300;
const TRANSITION_EASE = 'cubic-bezier(0.2, 0, 0.2, 1)';
const SCROLL_THRESHOLD = 30;
const ZOOM_MARGIN = 40;

// Global zoom state — only one image zoomed at a time
let activeZoom = null;

function getScale(rect) {
  const scaleX = (window.innerWidth - ZOOM_MARGIN * 2) / rect.width;
  const scaleY = (window.innerHeight - ZOOM_MARGIN * 2) / rect.height;
  return Math.min(scaleX, scaleY, 3);
}

function getTranslate(rect, scale) {
  const imgCX = rect.left + rect.width / 2;
  const imgCY = rect.top + rect.height / 2;
  const viewCX = window.innerWidth / 2;
  const viewCY = window.innerHeight / 2;
  return {
    x: (viewCX - imgCX) / scale,
    y: (viewCY - imgCY) / scale,
  };
}

function openZoom(img, originalSrc) {
  if (activeZoom) return;

  const rect = img.getBoundingClientRect();
  const scale = getScale(rect);
  const translate = getTranslate(rect, scale);
  const scrollY = window.scrollY;

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'dead-zoom-overlay';
  document.body.appendChild(overlay);

  // Clone at original position
  const clone = document.createElement('img');
  clone.src = img.currentSrc || img.src;
  clone.className = 'dead-zoom-clone';
  clone.style.top = `${rect.top + window.scrollY}px`;
  clone.style.left = `${rect.left + window.scrollX}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  document.body.appendChild(clone);

  // Hide original
  img.style.visibility = 'hidden';

  // Force reflow
  clone.getBoundingClientRect();

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('dead-zoom-overlay--active');
    clone.style.transition = `transform ${TRANSITION_MS}ms ${TRANSITION_EASE}`;
    clone.style.transform = `scale(${scale}) translate3d(${translate.x}px, ${translate.y}px, 0)`;
    clone.classList.add('dead-zoom-clone--active');
  });

  // Load original for HD zoom
  let hdImg = null;
  if (originalSrc && originalSrc !== (img.currentSrc || img.src)) {
    hdImg = new Image();
    hdImg.src = originalSrc;
    hdImg.onload = () => {
      if (activeZoom?.clone === clone) {
        clone.src = originalSrc;
      }
    };
  }

  function close() {
    if (!activeZoom) return;
    activeZoom = null;

    overlay.classList.remove('dead-zoom-overlay--active');
    clone.style.transform = '';
    clone.classList.remove('dead-zoom-clone--active');

    // Revert to display src for smooth animation back
    if (hdImg && clone.src !== (img.currentSrc || img.src)) {
      clone.src = img.currentSrc || img.src;
    }

    setTimeout(() => {
      img.style.visibility = '';
      overlay.remove();
      clone.remove();
    }, TRANSITION_MS);

    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', close);
    document.removeEventListener('keydown', onKeyDown);
  }

  function onScroll() {
    if (Math.abs(window.scrollY - scrollY) > SCROLL_THRESHOLD) close();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') close();
  }

  overlay.addEventListener('click', close);
  clone.addEventListener('click', close);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', close);
  document.addEventListener('keydown', onKeyDown);

  activeZoom = { img, clone, overlay, close };
}

function getSourceSrcSet(srcSet) {
  return srcSet.length === 1
    ? encodeURI(srcSet[0].path)
    : srcSet.map((s) => `${encodeURI(s.path)} ${s.width}w`).join(',');
}

export default function DeadImage({ img, alt, title, ...rest }) {
  const data = img && ('default' in img ? img.default : img);
  if (!data?.formats) return <img src={img} alt={alt} title={title} {...rest} />;

  const { formats, lqip, original } = data;
  const sources = formats.slice(0, -1);
  const fallback = formats[formats.length - 1];
  const isSingle = fallback.srcSet.length === 1;
  const largest = fallback.srcSet[fallback.srcSet.length - 1];

  const imgSrc = isSingle ? getSourceSrcSet(fallback.srcSet) : undefined;
  const imgSrcSet = isSingle ? undefined : getSourceSrcSet(fallback.srcSet);
  const sizesAttr = imgSrcSet ? 'auto' : undefined;

  const imageRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [showLqip, setShowLqip] = useState(false);

  useEffect(() => {
    if (loaded) return;
    if (imageRef.current?.complete) {
      setLoaded(true);
      return;
    }
    const id = setTimeout(() => setShowLqip(true), 50);
    return () => clearTimeout(id);
  }, [loaded]);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    if (imageRef.current) {
      openZoom(imageRef.current, original);
    }
  }, [original]);

  const pictureClass = [
    'dead-image',
    showLqip && 'dead-image--lqip',
    loaded && 'dead-image--loaded',
  ].filter(Boolean).join(' ');

  return (
    <picture
      className={pictureClass}
      style={lqip ? { '--lqip': `url(${lqip})` } : undefined}
      onLoad={() => setLoaded(true)}
    >
      {sources.map((format) => (
        <source
          srcSet={getSourceSrcSet(format.srcSet)}
          type={format.mime}
          key={format.mime}
        />
      ))}
      <img
        ref={imageRef}
        loading="lazy"
        src={imgSrc}
        srcSet={imgSrcSet}
        sizes={sizesAttr}
        width={largest.width}
        height={largest.height}
        alt={alt || ''}
        title={title}
        onClick={handleClick}
        {...rest}
      />
    </picture>
  );
}
