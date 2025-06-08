import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import toIco from 'to-ico';

const SIZES = [16, 32, 48, 192, 512];
const INPUT_SVG = path.resolve('assets/logo_minimal.svg'); // Assuming logo_minimal.svg is the target
const OUTPUT_DIR_ICONS = path.resolve('public/icons');
const OUTPUT_DIR_PUBLIC = path.resolve('public');
const BACKGROUND_COLOR = '#242424';
const PADDING_PERCENTAGE = 0.10; // 10% padding

async function generateIcons() {
  try {
    await fs.ensureDir(OUTPUT_DIR_ICONS);
    console.log(`Output directory for icons created/ensured at ${OUTPUT_DIR_ICONS}`);

    const svgBuffer = await fs.readFile(INPUT_SVG);
    const metadata = await sharp(svgBuffer).metadata();
    const svgWidth = metadata.width;
    const svgHeight = metadata.height;

    if (!svgWidth || !svgHeight) {
      throw new Error('Could not read SVG dimensions.');
    }

    const pngPromises = SIZES.map(async (size) => {
      const outputFileName = `icon-${size}.png`;
      const outputFilePath = path.join(OUTPUT_DIR_ICONS, outputFileName);

      // Calculate padding in pixels
      const padding = Math.floor(size * PADDING_PERCENTAGE);
      const innerSize = size - (2 * padding); // Size of the logo itself within the padded canvas

      console.log(`Generating ${outputFileName} (size: ${size}x${size}, padding: ${padding}px, innerSize: ${innerSize}x${innerSize})...`);

      // Calculate the dimensions for the logo itself (content area)
      const contentSize = innerSize; // innerSize already calculated as size - (2 * padding)

      // Resize the SVG to fit within the content area
      const resizedSvgBuffer = await sharp(svgBuffer, { density: 300 }) // Keep high DPI
        .resize({
          width: contentSize,
          height: contentSize,
          fit: 'contain', // Fit within the content box
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background for the SVG itself
        })
        .png()
        .toBuffer();

      // Create a background canvas and composite the resized SVG onto it
      await sharp({ 
        create: { 
          width: size, 
          height: size, 
          channels: 4, 
          background: BACKGROUND_COLOR 
        }
      })
        .composite([{
          input: resizedSvgBuffer,
          gravity: 'center' // This will center the resized SVG on the background canvas
        }])
        .png()
        .toFile(outputFilePath);
      console.log(`Successfully generated ${outputFilePath}`);
      return outputFilePath;
    });

    const generatedPngPaths = await Promise.all(pngPromises);
    console.log('All PNG icons generated successfully.');

    // Generate favicon.ico from 16x16 and 32x32 PNGs
    const icoSizes = [16, 32];
    const icoSourceFiles = await Promise.all(
      icoSizes.map(size => fs.readFile(path.join(OUTPUT_DIR_ICONS, `icon-${size}.png`)))
    );

    const icoBuffer = await toIco(icoSourceFiles);
    const faviconPath = path.join(OUTPUT_DIR_PUBLIC, 'favicon.ico');
    await fs.writeFile(faviconPath, icoBuffer);
    console.log(`Successfully generated ${faviconPath}`);

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
