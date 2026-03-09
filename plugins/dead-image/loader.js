/**
 * Webpack loader that processes images via sharp.
 *
 * Input:  raw image buffer (PNG/JPEG/etc.)
 * Output: ES module exporting { formats, lqip, original }
 *
 * formats: [{ mime, srcSet: [{ path, width, height }] }]
 * lqip:    data URI (base64 webp, 16px wide, blurred placeholder)
 * original: path to original file (for zoom)
 */
import loaderUtils from 'loader-utils';
import sharp from 'sharp';

const MIMES = {
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
};

export const raw = true;

export function pitch() {
  this.loaders = [this.loaders[this.loaderIndex]];
}

export default async function loader(buffer) {
  const callback = this.async();

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const originalWidth = metadata.width;

    if (!originalWidth) {
      throw new Error(`Cannot read width: ${this.resourcePath}`);
    }

    const options = this.getOptions();

    // Sizes: never upscale, deduplicate, sort ascending
    const sizes = [...new Set(
      options.sizes.map((s) => Math.min(s, originalWidth))
    )].sort((a, b) => a - b);

    // Generate responsive variants
    const formats = await Promise.all(
      options.formats.map(async (format) => {
        const srcSet = await Promise.all(
          sizes.map((size) => processImage(this, image.clone(), size, format, options))
        );
        return { mime: MIMES[format], srcSet };
      })
    );

    // LQIP
    let lqip;
    if (options.lqip) {
      lqip = await generateLqip(image.clone(), options.lqipSize, options.lqipQuality);
    }

    // Emit original for zoom
    const originalFormat = metadata.format || 'jpeg';
    const originalPath = emitFile(this, {
      buffer,
      width: originalWidth,
      height: metadata.height,
      format: originalFormat,
    }, options.fileNameTemplate);

    const output = { formats, lqip, original: originalPath };

    callback(null, generateOutput(output));
  } catch (err) {
    callback(err);
  }
}

async function processImage(context, image, size, format, options) {
  const resized = image.resize(size);
  const quality = options.quality[format] || 75;

  let output;
  switch (format) {
    case 'jpeg':
      output = resized.jpeg({ quality, progressive: size > 500 });
      break;
    case 'webp':
      output = resized.webp({ quality });
      break;
    case 'avif':
      output = resized.avif({ quality });
      break;
    default:
      output = resized.jpeg({ quality });
  }

  const buf = await output.toBuffer();
  const meta = await sharp(buf).metadata();
  const path = emitFile(context, {
    buffer: buf,
    width: meta.width,
    height: meta.height,
    format,
  }, options.fileNameTemplate);

  return { path, width: meta.width, height: meta.height };
}

function emitFile(context, data, template) {
  const filePath = loaderUtils
    .interpolateName(context, template, { content: data.buffer })
    .replaceAll('[width]', String(data.width))
    .replaceAll('[height]', String(data.height))
    .replaceAll('[format]', data.format);

  context.emitFile(filePath, data.buffer);
  return '__webpack_public_path__' + filePath;
}

async function generateLqip(image, size, quality) {
  const buf = await image
    .resize(size)
    .webp({ quality, alphaQuality: quality, smartSubsample: true })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

function generateOutput(output) {
  const json = JSON.stringify(output);
  return `export default ${json.replaceAll('"__webpack_public_path__', '__webpack_public_path__ + "')};`;
}
