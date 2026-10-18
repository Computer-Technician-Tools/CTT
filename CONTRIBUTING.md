# Contributing to CTT

Thanks for helping with CTT it means a lot to me ❤️ god bless you! ☦️

## 1. Prerequisites

Before you begin, make sure you have:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) and npm
- A [GitHub account](https://github.com/)

## 2. Fork and clone the repository

Fork the [CTT repository](https://github.com/Computer-Technician-Tools/CTT/fork) on GitHub, then clone **your fork**:

```bash
git clone https://github.com/YOUR-USERNAME/CTT.git
cd CTT
```

Replace `YOUR-USERNAME` with your GitHub username. Cloning your fork lets you push your changes and open a pull request against the original repository.

## 3. Install dependencies

From the repository root, run:

```bash
npm install
```

If the repository provides a lockfile and you want a reproducible install, prefer `npm ci` when you have not changed dependencies.

## 4. Run CTT locally

Start the development server:

```bash
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The development server refreshes the site as you make and save changes.

## 5. Make your changes

You can contribute by:

- Adding or improving guides and reference pages
- Fixing errors, broken links, and outdated information
- Adding useful tools or resources
- Improving accessibility, responsive layouts, or site functionality
- Fixing bugs or improving existing code

Keep changes focused, use clear headings and descriptive link text, and verify that technical instructions are accurate. Do not submit secrets, credentials, private information, or content you do not have permission to publish.

### 5.1 External media: videos, images, and GIFs

Use direct URLs to media files where possible. Replace the example URLs and alternative text below with the actual values.

#### Video

Embed a directly accessible video with browser playback controls:

```html
<video
  controls
  playsInline
  preload="metadata"
  style={{ display: 'block', width: '100%', maxWidth: '800px', height: 'auto', backgroundColor: '#000', borderRadius: '8px' }}
>
  <source
    src="https://example.com/media/video.mp4"
    type="video/mp4"
  />
  Your browser does not support HTML video.
</video>
```

For broad browser compatibility, prefer MP4 containing H.264 video and AAC audio. The hosting server should return an appropriate `Content-Type`, normally `video/mp4`.

#### Image

Use descriptive alternative text. Wrapping the image in a link allows it to be opened separately if the CTT previewer does not intercept the click.

```html
<a href="https://example.com/media/image.png">
  <img
    src="https://example.com/media/image.png"
    alt="Describe what the image shows"
    loading="lazy"
    style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: '8px', cursor: 'zoom-in' }}
  />
</a>
```

#### GIF

Use a direct URL to the animated GIF and describe its content in the `alt` attribute.

```html
<a href="https://example.com/media/animation.gif">
  <img
    src="https://example.com/media/animation.gif"
    alt="Describe what the animation shows"
    loading="lazy"
    style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: '8px', cursor: 'zoom-in' }}
  />
</a>
```

**External media checklist:**

- Use direct media URLs rather than links to pages that contain an embedded player.
- Check that the URL is publicly accessible and does not require sign-in.
- Respect the media host's terms, bandwidth limits, and hotlinking rules.
- Only use media you created, have permission to share, or are otherwise allowed to publish.
- If video playback fails, check the actual file format, codecs, URL, and server MIME type.
- The image and GIF examples rely on CTT's media-preview click handling to open in the previewer. Without that behavior, the link may open the media URL directly.
- Use `loading="lazy"` on images that do not need to load immediately.

## 6. Test your changes

Before submitting, run a production build:

```bash
npm run build
```

If you also want to test the built site locally, run:

```bash
npm run serve
```

The `serve` command displays the production build and does **not** provide live reload. To see changes as you edit, use `npm run start` instead. If the build fails, fix the errors before opening a pull request.

Also check the pages you changed for broken links, incorrect formatting, and mobile layout issues.

## 7. Configure Git

Configure Git with the name and email you want associated with your commits:

```bash
git config --global user.name "Your GitHub Username"
git config --global user.email "your-email@example.com"
```

Check your current settings:

```bash
git config --global user.name
git config --global user.email
```

### Keep your email private (optional)

You can manage your commit email in [GitHub email settings](https://github.com/settings/emails). If you enable **Keep my email addresses private**, GitHub provides a `noreply` address you can use for commits:

```bash
git config --global user.email "12345678+username@users.noreply.github.com"
```

Replace the example with the `noreply` address shown in your own GitHub settings.

## 8. Commit and push your changes

Create a branch for your work:

```bash
git switch -c describe-your-change
```

Stage and commit the files you changed:

```bash
git add .
git commit -m "Describe your changes"
git push -u origin describe-your-change
```

Replace `describe-your-change` and the commit message with short, meaningful descriptions. If you are working directly on your fork's default branch, push that branch instead.

## 9. Open a pull request

On GitHub, open a pull request from your fork or branch to the `Computer-Technician-Tools/CTT` repository. Explain what you changed, why it is useful, and how you tested it. Include screenshots when they help reviewers understand a visual change.

Thank you for helping make CTT better!
