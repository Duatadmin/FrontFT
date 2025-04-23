# Jarvis UI Style Guide

This style guide documents the design system, color palette, and styling patterns used in Jarvis products. Use this as a reference when developing new components or applications.

## Color Palette

### Primary Colors
- **Background:** `#0e0e1a` - Dark background for all applications
- **Text:** `#f3f4f6` - Light text for dark backgrounds
- **Accent:** `#5533ff` - Primary purple accent color
- **Secondary:** `#00ffcc` - Secondary teal accent color

### Secondary Colors
- **Purple Gradient:** From `#9747FF` to `#C084FC`
- **Glow Effect:** `rgba(151, 71, 255, 0.5)` - Used for shadows and glows

### UI State Colors
- **Hover Background:** `rgba(255, 255, 255, 0.1)`
- **Border:** `rgba(255, 255, 255, 0.1)`
- **Glass Background:** `rgba(255, 255, 255, 0.05)` - For glassmorphism effect

### Light Theme Overrides (optional)
- **Background:** `#f5f5f5`
- **Text:** `#1a1a2e`

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
```

### Text Styles
- **Headings:** Use gradient text with semibold weight
  ```css
  background: linear-gradient(90deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  ```

- **Body Text:** Regular weight, light color
- **Labels:** Slightly reduced opacity (0.8)

### Font Sizes
- Headings: `2.5rem`
- Body: `1rem`
- Small text: `0.9rem`

## Components

### Buttons
```css
button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-color);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
}

button:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
}

button:active {
    transform: translateY(0);
}
```

### Containers
```css
.container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
}
```

### Form Controls
```css
input[type="range"] {
    -webkit-appearance: none;
    width: 160px;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--accent-color);
    border-radius: 50%;
    cursor: pointer;
}
```

## Visual Effects

### Glassmorphism
```css
.glassmorphism {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Glow Effects
```css
.glow-effect {
    filter: drop-shadow(0 0 10px var(--accent-color));
}
```

### Animations

#### Transitions
- Use `transition: all 0.2s ease;` for hover effects
- Use `transition: all 0.3s ease;` for larger transitions

#### Hover Transform
```css
.hover-scale:hover {
    transform: scale(1.05);
}

.hover-translate:hover {
    transform: translateY(-2px);
}
```

## Layout

### Spacing
- Use multiples of 0.5rem for spacing (0.5rem, 1rem, 1.5rem, 2rem)
- Standard padding: `0.5rem 1rem` for buttons, `1rem` for containers
- Standard gap: `0.5rem` for inline elements, `1rem` for larger components

### Flex Layouts
```css
.flex-container {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.flex-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
```

### Centering
```css
.center-content {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

## Implementation Examples

### CSS Variables Setup
```css
:root {
    --bg-color: #0e0e1a;
    --text-color: #f3f4f6;
    --accent-color: #5533ff;
    --secondary-color: #00ffcc;
    --glow-strength: 10px;
}

/* Light theme overrides */
body.light-theme {
    --bg-color: #f5f5f5;
    --text-color: #1a1a2e;
}
```

### Theme Toggle
```javascript
function toggleTheme() {
    document.body.classList.toggle('light-theme');
}
```

## Icon Usage

We use [Lucide icons](https://lucide.dev/) across all products. Import them using:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

Initialize icons with:
```javascript
lucide.createIcons();
```

## Best Practices

1. Always use CSS variables for colors and key values
2. Design for dark mode first, then add light mode overrides
3. Use flexbox for layouts
4. Add subtle animations for interactions
5. Keep text high-contrast for accessibility
6. Use glassmorphism sparingly for important UI elements

## Integration Guide

When integrating this style guide into a new project:

1. Copy the CSS variables and base styles
2. Import the same font stack
3. Use the component patterns described above
4. Add Lucide icons for consistent iconography
5. Test in both dark and light mode

---

*This style guide is maintained by the Jarvis Design Team. Last updated: April 2025.* 