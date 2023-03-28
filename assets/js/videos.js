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

  data.map((videos, i) => {
    const el = document.getElementById(ids[i].id);
    const items = videos.map(
      ({
        resourceId: { videoId: id },
        description,
        title,
        publishedAt: published,
      }) => replace(template, { id, description, title, published })
    );
    el.innerHTML = items.join();
  });
}

function replace(template, { id, description, title, published }) {
  let tpl = template.replace("%id%", id);
  tpl = tpl.replace("%title%", title);
  tpl = tpl.replace(
    "%description%",
    description.length > 200 ? `${description.slice(0, 200)}...` : description
  );
  tpl = tpl.replace("%published%", format(new Date(published), "MMM dd, yyyy"));

  return tpl;
}

try {
  handler();
} catch {
  document.getElementById(ids[0].id).innerHTML = replace(template, [plug, plug, plug].join(''));
}
