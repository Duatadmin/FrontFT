# Figma Image Export Instructions

## How to Export the Fitness Couple Image from Figma

1. **Open your Figma file** containing the welcome screens

2. **Select the first welcome screen** frame/component

3. **Find the fitness couple image layer** in the layers panel

4. **Right-click on the image** and select "Copy/Paste as" > "Copy as PNG" or:
   - Select the image layer
   - In the right panel, click the "Export" section
   - Add an export setting
   - Choose "JPG" format
   - Set scale to "2x" or "3x" for high quality
   - Click "Export [layer name]"

5. **Save the file** as `fitness-couple.jpg` in this directory (`/public/images/hero/`)

## Alternative Method - Using Browser DevTools

If the above doesn't work:

1. Open Figma in your browser
2. Select the welcome screen with the fitness couple
3. Open DevTools (F12)
4. Go to Network tab
5. Refresh the Figma page
6. Look for image files (filter by "Img")
7. Find the fitness couple image and save it

## Expected Image Specifications

- **Format**: JPG
- **Dimensions**: 375x445px (or 2x/3x for retina)
- **Content**: Black and white dramatic photo of muscular man and woman
- **Lighting**: Dramatic side/bottom lighting
- **Style**: Professional fitness photography

## After Export

Once you have the image, the welcome screen will automatically use it. The component is already set up to use `/images/hero/fitness-couple.jpg`.