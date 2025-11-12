import React from "react";
import Zoom from "../lib/react-medium-image-zoom/index.js";
import "../lib/react-medium-image-zoom/styles.css";

type TurboImageProps = {
    img: any;
    zoomSrc?: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
};

const TurboImage: React.FC<TurboImageProps> = ({ img, zoomSrc, alt, title, width, height }) => {
    console.log(img);
    return (
        <Zoom swipeToUnzoomThreshold={5} zoomMargin={20} zoomImg={{ src: zoomSrc || img.src.images[img.src.images.length - 1].path }}>
            <img decoding="async" srcSet={img.src.srcSet} className="medium-zoom-image" src={img.src.images[0].path} alt={alt} width={width || img.src.images[0].width} height={height || img.src.images[0].height} />
        </Zoom>
    );
};

export default TurboImage;
