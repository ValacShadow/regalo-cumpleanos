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

