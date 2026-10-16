Updated birthday website files

Replace these files in your existing website project:
- index.html
- script.js
- styles.css
- config.js (included unchanged; it already points to assets/audio/amor.mp3, assets/audio/uy_como.mp3, and assets/audio/bday.mp3)

Keep your existing assets/ folder, including the audio, photos, and videos.

Music behavior:
- Chapter 1–3: amor.mp3 loops.
- Chapter 4: uy_como.mp3 loops.
- Chapter 5 (wish/cake): music stops until the wish button is clicked; clicking it starts bday.mp3.
- Chapter 6: bday.mp3 continues looping.
- The music icon in the top-right pauses/resumes the current track.

Autoplay note: browsers often block audio autoplay before the first interaction. The page attempts to start amor.mp3 immediately and retries on the first tap/click if the browser blocks it.
