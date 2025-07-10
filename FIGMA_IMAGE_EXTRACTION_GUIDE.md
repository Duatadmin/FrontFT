# Figma Image Extraction Guide

## How to Extract the Fitness Couple Image from Figma

### Method 1: Using Figma's Export Feature
1. Open your Figma design file
2. Select the fitness couple image component
3. In the right sidebar, scroll to the "Export" section
4. Click the "+" button to add an export setting
5. Choose format: PNG or JPG (PNG for transparency, JPG for smaller file size)
6. Set the scale to 2x or 3x for high quality
7. Click "Export [component name]"
8. Save the file as `fitness-couple-hero.jpg` or `fitness-couple-hero.png`

### Method 2: Using Figma's Copy as PNG Feature
1. Select the fitness couple image in Figma
2. Right-click on the image
3. Select "Copy/Paste as" > "Copy as PNG"
4. Open an image editor and paste
5. Save as `fitness-couple-hero.jpg` or `fitness-couple-hero.png`

### Method 3: Using the Figma MCP Integration
1. Make sure you have the Figma design file open as the active tab
2. Use Claude Code's Figma integration to extract the image
3. The image will be automatically downloaded

## Where to Place the Image in Your Project

Once you have extracted the image, place it here:
```
/mnt/c/Projects/PWA1/public/images/fitness-couple-hero.jpg
```

## Update the Code

After placing the image, update the WelcomeScreenFirst component to use the actual image instead of the base64 placeholder:

```tsx
// Replace the base64 data URI with:
<image href="/images/fitness-couple-hero.jpg" width="375" height="400"/>
```

## Image Optimization Tips

1. **Format**: Use WebP for best compression with quality
2. **Size**: Aim for under 200KB for hero images
3. **Dimensions**: 750x800px (2x for retina displays)
4. **Compression**: Use tools like TinyPNG or Squoosh
5. **Alternative formats**: Provide fallbacks for older browsers

## Alternative Stock Images

If you can't extract from Figma, here are some free stock photo resources:
- Unsplash: https://unsplash.com/s/photos/fitness-couple
- Pexels: https://www.pexels.com/search/fitness%20couple/
- Pixabay: https://pixabay.com/images/search/fitness%20couple/

Search for dramatic black and white fitness couple photos with similar composition.