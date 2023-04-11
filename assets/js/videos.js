import * as params from "@params";
import { format } from "date-fns";

const { ids, template, plug } = params.default;

async function handler() {
  const data = await Promise.all(
    ids.map(async ({ id, take }) => {
      try {
        const response = await fetch(
          `/.netlify/functions/youtube-bypass?id=${id}${
            take ? `&take=${take}` : ""
          }`
        );
        return await response.json();
      } catch {
        return [];
      }
    })
  );

  if (!data.flat().length) {
    document.getElementById(ids[0].id).innerHTML = replace(template, plug);
    return;
  }

  data.map(async (playlistItems, i) => {
    const videoIds = playlistItems.map(
      ({ resourceId: { videoId } }) => videoId
    );
    const response = await fetch(
      `/.netlify/functions/youtube-bypass?type=videos&id=${videoIds.join(
        ","
      )}`
    );
    const videos = await response.json();

    const el = document.getElementById(ids[i].id);

    const items = playlistItems.map(
      ({ resourceId: { videoId: id }, description, title }, i) =>
        replace(template, {
          id,
          description,
          title,
          published: videos[i].publishedAt,
        })
    );
    el.innerHTML = items.join();
  });
}

function replace(template, { id, description, title, published }) {
  let tpl = template.replace("%id%", id);
  tpl = tpl.replace("%title%", title);
  tpl = tpl.replace(
    "%description%",
    description.length > 140 ? `${description.slice(0, 140)}...` : description
  );
  tpl = tpl.replace("%published%", format(new Date(published), "MMM dd, yyyy"));

  return tpl;
}

try {
  handler();
} catch {
  document.getElementById(ids[0].id).innerHTML = replace(template, plug);
}
