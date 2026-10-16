# Para mi niña ♡ — Birthday gift website

A six-chapter, mobile-first birthday experience built with plain HTML, CSS, and JavaScript. No backend, account, framework, build step, paid API, analytics, or microphone permission is required.

## Project structure

```text
mi-nina-birthday/
├── index.html
├── styles.css
├── script.js
├── config.js
├── README.md
└── assets/
    ├── photos/
    │   └── README.md
    └── images/
```

## 1. Preview locally

1. Download or unzip the project.
2. Open `index.html` in a modern browser. The core interactions work as a static site.
3. For a more realistic local preview, run a simple static server from this folder:
   - Python 3: `python3 -m http.server 8000`
   - Then open `http://localhost:8000`.
4. Test both language options, all chapter buttons, gallery controls, the cake wish button, and the final replay button.

Google Fonts are optional and have system fallbacks. If the font service is unavailable, the site remains usable.

## 2. Personalise the messages

Open `config.js` in a text editor.

- `recipientName`: optional name or nickname. Leave it empty to use “mi niña” / “my girl”.
- `senderName`: optional. Update `signature` in the Spanish and English copy if you want your name shown.
- `loveNotes`: replace each `[SAMPLE]` title and message with things you genuinely love about her.
- `copy.es` and `copy.en`: edit chapter headings, paragraphs, button labels, and birthday messages. Keep the same keys in both languages so the toggle remains complete.
- The welcome heading inserts the recipient name automatically.

All sample romantic copy is generic and marked as sample where applicable. Add only memories and details that are true for you both.

## 3. Add your photos

1. Put your photographs in `assets/photos/`.
2. Recommended formats: JPG, PNG, or WebP. Resize large phone photos to a sensible web size (roughly 1600–2000 px on the longest side) to keep the page quick to load.
3. In `config.js`, update the `photos` list. For example:

```js
{
  src: "assets/photos/our-photo-1.jpg",
  alt: "A description of the photo",
  caption: "Your caption goes here ♡"
}
```

4. You can add or remove photo objects. Keep paths relative; do not begin them with `/`.
5. The starter filenames (`photo-1.jpg`, `photo-2.jpg`, `photo-3.jpg`) are examples. The gallery shows a fallback if those files are missing; it will not fetch or invent photos.

## 4. Configure music

The three requested tracks are included as selectable options:

- `Amor` — Emmanuel Cortes
- `COMPA COLETO (uy_como)`
- `gatito`

Artist fields are intentionally blank when not supplied. Songs have no audio source configured initially, so the controls show a friendly message rather than pretending audio is available.

### Use an audio file you are allowed to use

1. Create `assets/audio/`.
2. Add an audio file you have permission to use, such as `assets/audio/amor.mp3`.
3. Set the relevant song's `src` in `config.js`, for example:
   `src: "assets/audio/amor.mp3"`.
4. Configure the birthday song similarly, for example `src: "assets/audio/mananitas.mp3"`.

You may instead configure a legitimate official source if it supports playback in your chosen implementation. This simple player expects a browser-playable audio URL; a normal streaming-service web page URL is not necessarily a direct audio file and may not work as an `<audio>` source. Do not download or rehost copyrighted recordings without permission, scrape music services, or bypass access controls. Playback depends on the source, browser, and connection. Audio is optional and never autoplays.

## 5. Publish with GitHub Pages

GitHub Pages sites are **publicly accessible by default**. Do not put private or sensitive information in this project. This site does not implement password protection.

1. Sign in to GitHub and create a new repository, for example `mi-nina-birthday`.
2. If the repository is public, anyone who has the URL may be able to view it. Choose the visibility and Pages options available to your account, keeping in mind that Pages publication is not private access control.
3. Upload the project files and folders to the repository root. Ensure `index.html`, `styles.css`, `script.js`, and `config.js` are at the root.
4. Open the repository **Settings → Pages**.
5. Under the build/deployment source, select **Deploy from a branch** if available.
6. Select the `main` branch and `/(root)` folder, then save.
7. Wait for GitHub Pages to finish publishing. The URL is normally similar to:
   `https://YOUR-USERNAME.github.io/mi-nina-birthday/`
8. Open the published URL on your phone. Test the Spanish/English switch, chapter navigation, photo gallery, and any configured audio.
9. If you change files later, upload the updates to the same repository and branch. Refresh the published page; a hard refresh may help if the browser cached an older version.

The exact GitHub interface may change, so follow the labels currently shown in your repository settings.

## 6. Remove the site after the birthday

- To unpublish, open **Settings → Pages** and disable publication or change the deployment source.
- To remove the project entirely, use the repository's **Settings** page and its delete-repository option. GitHub asks for confirmation.
- Remember that copies, browser caches, or forks may remain outside your control. If the site contained anything you no longer want public, remove it promptly and consider the repository's visibility and history.

## Accessibility and reliability

- Keyboard-focus styles and semantic buttons are included.
- Motion is reduced when the device requests `prefers-reduced-motion`.
- The experience does not require login, microphone access, or sound.
- Music playback begins only after a user presses a play control.
- Missing images and unavailable audio have fallback messages.
- Relative file paths support a GitHub Pages repository subdirectory.
