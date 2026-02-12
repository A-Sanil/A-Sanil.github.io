# Aaditya Sanil - Portfolio Website

A modern, responsive portfolio website showcasing experience, projects, and education.

## Features

- **Timeline-based layout** for experience and projects
- **Responsive design** that works on all devices
- **Smooth scrolling** navigation
- **Animated sections** with fade-in effects
- **Clean, modern UI** inspired by contemporary portfolio designs

## Project Structure

```
A-Sanil.github.io/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # JavaScript for interactivity
├── projects/           # Project screenshots folder
│   ├── byow-screenshot.png
│   ├── adversarial-screenshot.png
│   ├── coevolution-screenshot.png
│   └── diabetes-screenshot.png
└── README.md           # This file
```

## Adding Screenshots

To add screenshots for your projects:

1. Place your screenshot images in the `projects/` folder
2. Name them according to the project:
   - `byow-screenshot.png` - For the BYOW project
   - `adversarial-screenshot.png` - For the Adversarial Probability project
   - `coevolution-screenshot.png` - For the Coevolutionary Trait Dynamics Analyzer
   - `diabetes-screenshot.png` - For the Diabetes Classifier

3. The images will automatically display in the project sections. If an image is missing, it will be hidden gracefully.

## Customization

### Colors
Edit the CSS variables in `styles.css` to change the color scheme:
```css
:root {
    --primary-color: #2563eb;
    --primary-dark: #1e40af;
    /* ... */
}
```

### Content
Edit `index.html` to update:
- Personal information
- Experience entries
- Project descriptions
- Education details
- Contact information

## Deployment

This is a GitHub Pages repository. To deploy:

1. Push your changes to the `main` branch
2. Go to Settings > Pages in your GitHub repository
3. Select the source branch (usually `main`)
4. Your site will be available at `https://A-Sanil.github.io`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Personal portfolio - All rights reserved.

