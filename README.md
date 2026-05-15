# Portfolio

Simple two-page portfolio website:

- **Presentation page**: `./index.html`
- **Activities page**: `./activities.html`

The activities list is loaded from `./data/activities.json`, including activity name, hours, and proof image path.
To update the content, edit `data/activities.json`.

## Run locally (Linux)

If you open `activities.html` directly with `file://`, the browser blocks `fetch` for JSON files.
Run a local server instead:

```bash
cd /home/arthur/Desktop/Portfolio
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/index.html`
- `http://localhost:8000/activities.html`
