# YouTube Likes Preview Extension

[![Mozilla Add-on](https://img.shields.io/amo/v/youtube-preview-likes?label=Firefox)](https://addons.mozilla.org/en-US/firefox/addon/youtube-preview-likes/)

Displays YouTube video likes directly on thumbnails - no need to click the videos!

![Extension Screenshot](screenshots/single-video.png)

## Features

- Shows like counts on all pages - homepage, search results, and sidebar in video player page
- Real-time updates as you browse
- Perfectly styled to match YouTube's design (It wouldn't look odd and adjusts color based on theme)
- Works with YouTube's dynamic content loading
- Simple & Lightweight (no user tracking)

## Installation

### Chrome
#### Load unpacked:
   - Download this repository
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `chrome` folder in this project

### Firefox
1. [Install from Firefox Add-ons store](https://addons.mozilla.org/en-US/firefox/addon/youtube-preview-likes/)
2. Or load temporarily (Works untill you close the browser):
   - Download this repository
   - Go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select any file in the `firefox` folder of this project

## How It Works

The extension:
1. Detects YouTube video thumbnails
2. Fetches like counts via YouTube's API
3. Displays counts in a beautifully formatted element
4. Works with YouTube's single-page navigation
5. Automatically updates as you scroll

## Technical Details

- Uses YouTube's internal API with proper API key retrieval
- Handles all YouTube layout variations (homepage, search, sidebar, etc)
- Efficient processing with IntersectionObserver
- Memory-safe with processed video tracking
- Responsive to YouTube navigation events

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
If you have any questions or just want to tell me how awful this addon is reach out to me at jayconar@hotmail.com