const puppeteer = require('puppeteer');
const axios = require('axios');

// Hanime.tv URL to scrape
const baseUrl = 'https://hanime.tv';

// Function to bypass Cloudflare and get the page content
async function bypassCloudflare(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const content = await page.content();
  await browser.close();
  return content;
}

// Function to fetch streams from Hanime
async function fetchStreams() {
  const content = await bypassCloudflare(baseUrl + '/trending');
  
  // Simple parsing to extract video URLs and titles
  // This is just an example; you might need to adjust depending on page structure
  const videoLinks = [];
  
  const videoElements = content.match(/<a href="(\/video\/[a-z0-9\-]+)"[^>]*>(.*?)<\/a>/g);

  if (videoElements) {
    videoElements.forEach(element => {
      const urlMatch = element.match(/href="(\/video\/[a-z0-9\-]+)"/);
      const titleMatch = element.match(/>(.*?)<\/a>/);
      if (urlMatch && titleMatch) {
        videoLinks.push({
          title: titleMatch[1],
          url: baseUrl + urlMatch[1]
        });
      }
    });
  }

  return videoLinks;
}

// Function to fetch stream links for a specific video page
async function fetchVideoStream(videoUrl) {
  const content = await bypassCloudflare(videoUrl);

  // Extract the video stream URL from the page (you may need to inspect the page structure)
  const streamMatch = content.match(/"video_url":"(https:\/\/[^"]+)"/);
  if (streamMatch) {
    return streamMatch[1];
  }
  return null;
}

// Example usage
(async () => {
  const videos = await fetchStreams();
  console.log('Trending Videos:', videos);

  const firstVideo = videos[0];
  if (firstVideo) {
    const streamLink = await fetchVideoStream(firstVideo.url);
    console.log('First Video Stream Link:', streamLink);
  }
})();
