import React, { useState } from 'react';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';
import TerminalCard from '../TerminalCard';

export default function TwitterBookmark({ bookmark }) {
  const { 
    profile_image_url_https, 
    screen_name, 
    name, 
    full_text, 
    note_tweet_text,
    tweeted_at, 
    tweet_url,
    extended_media,
    is_quote,
    quoted_tweet_url,
    quoted_tweet_text,
    quoted_tweet_author,
    quoted_tweet_author_name
  } = bookmark;
  
  const [playingVideos, setPlayingVideos] = useState({});
  const [showFullNote, setShowFullNote] = useState(false);

  const formattedDate = new Date(tweeted_at).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const renderText = (text) => {
    if (!text) return null;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    const handleRegex = /@(\w+)/g;
    
    const hashtagRegex = /#(\w+)/g;

    let processedText = text
      .replace(urlRegex, (url) => {
        if (extended_media && extended_media.some(m => m.display_url === url.replace('https://t.co/', ''))) {
          return ''; // Remove the URL if it corresponds to a media attachment
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      })
      .replace(handleRegex, '<a href="https://x.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>')
      .replace(hashtagRegex, '<a href="https://x.com/hashtag/$1?src=hashtag_click" target="_blank" rel="noopener noreferrer">#$1</a>');

    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  const playVideo = (index, videoUrl) => {
    setPlayingVideos(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const toggleFullNote = () => {
    setShowFullNote(!showFullNote);
  };

  return (
    <TerminalCard title={`${name} on Twitter`}>
      <div className={styles.tweetHeader}>
        <div className={styles.userInfo}>
          <img 
            src={profile_image_url_https} 
            alt={`${name}'s profile`} 
            className={styles.profileImage} 
          />
          <div className={styles.nameContainer}>
            <div className={styles.name}>{name}</div>
            <div className={styles.screenName}>@{screen_name}</div>
          </div>
        </div>
        <Link 
          to={tweet_url} 
          className={styles.tweetLink} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <div className={styles.twitterIcon}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <g>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </g>
            </svg>
          </div>
        </Link>
      </div>

      <div className={styles.tweetBody}>
        <div className={styles.tweetText}>
          {showFullNote && note_tweet_text ? renderText(note_tweet_text) : renderText(full_text)}
          
          {note_tweet_text && !showFullNote && (
            <button 
              className={styles.readMoreButton}
              onClick={toggleFullNote}
            >
              Читати більше...
            </button>
          )}
          
          {note_tweet_text && showFullNote && (
            <button 
              className={styles.readMoreButton}
              onClick={toggleFullNote}
            >
              Згорнути
            </button>
          )}
        </div>
        
        {is_quote && quoted_tweet_text && (
          <Link 
            to={quoted_tweet_url} 
            className={styles.quotedTweet} 
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.quotedTweetHeader}>
              <div className={styles.quotedTweetAuthor}>
                <span className={styles.quotedTweetAuthorName}>{quoted_tweet_author_name}</span>
                <span className={styles.quotedTweetAuthorHandle}>@{quoted_tweet_author}</span>
              </div>
            </div>
            <div className={styles.quotedTweetText}>
              {renderText(quoted_tweet_text)}
            </div>
          </Link>
        )}
        
        {extended_media && extended_media.length > 0 && (
          <div className={extended_media.length > 1 ? styles.mediaGrid : styles.singleMedia}>
            {extended_media.map((media, index) => {
              if (media.type === 'photo') {
                return (
                  <div key={index} className={styles.mediaContainer}>
                    <img
                      src={media.media_url_https}
                      alt="Tweet media"
                      className={styles.tweetMedia}
                      onClick={() => window.open(media.expanded_url, '_blank')}
                    />
                  </div>
                );
              } else if (media.type === 'video' || media.type === 'animated_gif') {
                const videoUrl = media.video_url || media.media_url_https;
                return (
                  <div key={index} className={styles.mediaContainer}>
                    {playingVideos[index] ? (
                      <div className={styles.videoContainer}>
                        <video 
                          className={styles.videoPlayer}
                          controls
                          autoPlay
                          src={videoUrl}
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                    ) : (
                      <div 
                        className={styles.videoPlaceholder}
                        onClick={() => playVideo(index, videoUrl)}
                      >
                        <div className={styles.playButton}>
                          <svg viewBox="0 0 24 24" width="50" height="50">
                            <path fill="#ffffff" d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      <div className={styles.tweetFooter}>
        <div className={styles.tweetDate}>{formattedDate}</div>
      </div>
    </TerminalCard>
  );
} 