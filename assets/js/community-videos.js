import * as params from "@params";
import { format } from "date-fns";

(() => {
  const { playlist_id, take } = params.default;

  async function handler() {
    const template = `
  <div class="card bg-light">
    <img class="card-img-top" src="%img_src%" />
    <div class="card-body pt-4">
      <div class="card-text">
        <p class="text-secondary -text-600">%published%</p>
        <h5>%title%</h5>
      </div>
    </div>
  </div>`;

    const response = await fetch(
      `/.netlify/functions/youtube-bypass?id=${playlist_id}${
        take ? `&take=${take}` : ""
      }`
    );
    const data = await response.json();

    const el = document.getElementById(playlist_id);
    console.log(data, el);

    const items = data
      .map(({ title, publishedAt, thumbnails }) => {
        let tpl = template.replace("%img_src%", thumbnails?.standard?.url);
        tpl = tpl.replace("%title%", title);
        tpl = tpl.replace(
          "%published%",
          format(new Date(publishedAt), "MMM dd, yyyy")
        );
        return tpl.trim();
      })
      .join("");

    el.innerHTML = items;
  }

  handler();
})();
