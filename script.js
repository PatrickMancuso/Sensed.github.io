const API_KEY = "e530c016b028fa384b92183344f7526e";

const form = document.getElementById("searchForm");
const input = document.getElementById("songInput");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = "<p>Loading...</p>";

  try {
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

function displayResults(data) {
  const tracks = data.results?.trackmatches?.track || [];

  if (!tracks.length) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  resultsDiv.innerHTML = "";

  tracks.forEach((track) => {
    const imageUrl =
      track.image?.[2]?.["#text"] ||
      "https://via.placeholder.com/80x80?text=No+Art";

    const item = document.createElement("div");
    item.classList.add("track");
    item.innerHTML = `
      <img src="${imageUrl}" alt="Album Art">
      <div>
        <h3>${track.name} — ${track.artist}</h3>
        <p><a href="${track.url}" target="_blank">View on Last.fm</a></p>
      </div>
    `;
    resultsDiv.appendChild(item);
  });
}
