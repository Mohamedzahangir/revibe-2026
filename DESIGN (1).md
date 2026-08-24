---
name: Web-Slinger Modern
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#5b403f'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#8f6f6e'
  outline-variant: '#e4bebc'
  surface-tint: '#bb152c'
  primary: '#b7102a'
  on-primary: '#ffffff'
  primary-container: '#db313f'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b1'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#006860'
  on-tertiary: '#ffffff'
  tertiary-container: '#008379'
  on-tertiary-container: '#f3fffc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#8cf4e8'
  tertiary-fixed-dim: '#6fd8cc'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 84px
    fontWeight: '400'
    lineHeight: 80px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 38px
  headline-md:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is built on a "Neo-Comic" aesthetic—a fusion of modern minimalism and high-energy superhero dynamics. It targets a multi-generational audience of fans, creators, and enthusiasts who value both the legacy of the character and a premium, contemporary digital experience. 

The UI should evoke a sense of agility, heroism, and precision. We achieve this by utilizing a "Flat-Brutalist" approach: sharp corners, high-contrast color blocking, and dynamic structural lines that mimic the kinetic energy of a comic book panel while maintaining the sophisticated white space of a premium SaaS product. The atmosphere is intentional and bold, stripping away soft gradients in favor of raw, impactful layouts.

## Colors

The palette is anchored by a high-chroma **Spider-Man Red** (#E63946) used exclusively for primary actions and brand-critical identifiers. The **Off-White** (#F5F5F5) background provides a matte, paper-like canvas that prevents eye strain while making the **Deep Black** (#1A1A1A) elements feel structural and heavy.

- **Primary (Red):** Used for CTA buttons, active states, and critical highlights.
- **Secondary (Black):** Used for typography, borders, and heavy structural blocks.
- **Neutral (Off-White):** The primary surface color for all pages.
- **Accent (Muted Blue):** Introduced sparingly for secondary links or informational badges to complete the iconic tri-color hero palette without overwhelming the minimalist aesthetic.

## Typography

Typography in this design system is used as a structural element. 

- **Headlines:** We use **Anton** for its condensed, impactful, and "Headline-News" feel, reminiscent of Daily Bugle front pages. Large headings should be treated like graphic elements—tight tracking and minimal line height.
- **Body:** **Hanken Grotesk** provides a sharp, modern contrast to the heavy headlines. It ensures high readability for long-form content.
- **Technical/Labels:** **JetBrains Mono** is used for small metadata, labels, and "Editor-note" style callouts to lean into the "tech-suit" side of the brand's identity.

## Layout & Spacing

This design system utilizes a **hard-grid fluid system**. All layouts are based on an 8px base unit to ensure alignment and rhythmic consistency.

- **Grid:** A 12-column grid for desktop with wide 64px margins to create a "cinematic" letterbox feel.
- **Gutters:** 24px gutters remain constant to maintain vertical "gutters" similar to comic book panels.
- **Breakpoints:** 
  - Mobile: < 600px (4 columns, 16px margins)
  - Tablet: 600px - 1024px (8 columns, 32px margins)
  - Desktop: > 1024px (12 columns, 64px margins)

Alignment should be "edge-to-edge" where possible. Use heavy vertical lines (2px Black) to separate major content sections, reinforcing the comic panel structure.

## Elevation & Depth

This system rejects shadows in favor of **Tonal Layering** and **Hard Offsets**. 

- **Flat Surfaces:** Elements sit flush on the background or are separated by 1px or 2px solid Deep Black borders.
- **Hard Shadows:** To create depth for buttons or floating cards, use a solid, 100% opacity Red or Black offset (e.g., 4px down, 4px right) rather than a soft blur.
- **Webbing Overlays:** Subtle, low-opacity (5%) geometric webbing patterns can be applied to secondary containers to add texture without breaking the minimalist constraint.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every UI element—from buttons and input fields to cards and images—must have square corners. This reinforces the "Brutalist" aesthetic and mimics the sharp edges of comic frames and urban architecture. Diagonal cuts (45-degree clipped corners) may be used sparingly for "Hero" buttons or tag shapes to evoke a sense of forward motion.

## Components

- **Buttons:** Large, sharp-edged blocks. Primary buttons use the Spider-Man Red background with White Anton text. Hover states should trigger a solid Black "Hard Shadow" offset.
- **Cards:** White or very light gray containers with a 2px Deep Black border. Headers within cards should have a solid Black background with White text.
- **Input Fields:** 2px solid Black bottom-border only (minimalist style) or full 1px box. Active state changes border to Red.
- **Chips/Tags:** Solid Black background with White JetBrains Mono text. No rounded corners.
- **Lists:** Separated by horizontal 1px Black lines. Bullet points are replaced by small Red squares or "chevron" shapes.
- **Webbing Pattern:** A CSS-generated vector pattern used strictly as a background-mask for large "Hero" sections or the interior of specific Red buttons to provide tactile interest.
- **Progress Bars:** High-contrast Red fill on a Black background, creating a sleek, technical look.