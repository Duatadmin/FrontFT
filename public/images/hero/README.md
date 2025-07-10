# Hero Images Directory

This directory contains hero images for the application, particularly for the welcome/onboarding screens.

## Current Images

### fitness-couple-hero-placeholder.svg
- **Status**: Placeholder
- **Dimensions**: 375x400px
- **Purpose**: Temporary placeholder for the fitness couple hero image
- **To Replace**: Extract the actual image from Figma design

## Required Image: fitness-couple-hero.jpg

### Description
A dramatic black and white photograph of a fitness couple:
- Man and woman in athletic/fitness attire
- Shot from a low angle for dramatic effect
- High contrast black and white photography
- Professional fitness/athletic appearance
- Should convey strength, partnership, and fitness goals

### Technical Requirements
- **Dimensions**: 375x400px minimum (750x800px for 2x retina)
- **Format**: JPG or WebP (JPG for compatibility, WebP for performance)
- **File Size**: Target < 200KB
- **Quality**: High quality, optimized for web

### How to Extract from Figma

1. **Open Figma Design**
   - Navigate to the welcome screen design
   - Find the fitness couple component

2. **Export Settings**
   - Select the image component
   - Export settings: 2x or 3x scale
   - Format: JPG (high quality)
   - Export as: `fitness-couple-hero.jpg`

3. **Optimize the Image**
   - Use tools like TinyPNG or Squoosh
   - Maintain visual quality while reducing file size
   - Consider creating WebP version for modern browsers

4. **Update the Code**
   Replace in `WelcomeScreenFirst.tsx`:
   ```tsx
   <image href="/images/hero/fitness-couple-hero-placeholder.svg" .../>
   ```
   With:
   ```tsx
   <image href="/images/hero/fitness-couple-hero.jpg" .../>
   ```

## Alternative Approach

If Figma extraction is not possible, consider using high-quality stock photos:
- Search for "fitness couple black white dramatic"
- Ensure proper licensing for commercial use
- Match the aesthetic of the original design