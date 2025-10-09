// Last.fm API key
const API_KEY = "e530c016b028fa384b92183344f7526e";

// Elements
const form = document.getElementById("searchForm");
const input = document.getElementById("songInput");
const resultsDiv = document.getElementById("results");

// Handle form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = "<p>Loading...</p>";

  try {
    // Fetch songs from Last.fm
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(
        query
      )}&api_key=${API_KEY}&format=json`
    );
    const data = await response.json();

    displayResults(data);
  } catch (err) {
    resultsDiv.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
});

// Render results
function displayResults(data) {
  if (!data.results || !data.results.trackmatches.track.length) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  const tracks = data.results.trackmatches.track;
  resultsDiv.innerHTML = "";

  tracks.forEach((track) => {
    const item = document.createElement("div");
    item.classList.add("track");
    item.innerHTML = `
      <h3>${track.name} — ${track.artist}</h3>
      ${
        track.image[1]["#text"]
          ? `<img src="${track.image[1]["#text"]}" alt="Album Art">`
          : ""
      }
      <p><a href="${track.url}" target="_blank">View on Last.fm</a></p>
    `;
    resultsDiv.appendChild(item);
  });
}

