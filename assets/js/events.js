import * as params from "@params";
import { format, addDays } from "date-fns";

(() => {
  const fromString = (template) => {
    const el = document.createElement("template");
    el.innerHTML = template.trim();
    return el.content.firstChild;
  };

  const { events, type, take } = params;

  const communityEvents = (events) => {
    const eventTemplate = `
      <div class="event my-5">
        <hr class="my-5" />
        <div class="d-flex flex-sm-row justify-content-between align-items-center">
          <h4 class="text-primary mb-0 event__title"></h4>
          <a class="event__info btn btn-outline-primary" role="button" target="_blank">Learn more</a>
        </div>
      </div>`;

    const eventCardTemplate = `   
      <div class="event__card card card-sm btn btn-light p-0 shadow mt-2">
        <div class="card-body d-flex flex-column flex-sm-row align-items-sm-center gap-4 text-left">
          <div class="event__time"></div>
          <div class="event__content w-100"></div>
          <i class="fa fa-arrow-right text-primary d-none d-sm-block"></i>
        </div>
      </div>`;

    const eventItemTemplate = `
      <div class="event__item">
        <h6 class="event__item-title mt-5 d-flex justify-content-between"></h6>
      </div>`;

    const hostElement = document.getElementById("community-events");

    events.forEach((e, i) => {
      const event = fromString(eventTemplate);

      event.getElementsByClassName("event__title")[0].innerText = e.title;
      event.getElementsByClassName("event__info")[0].href = e.url;

      e.schedule.forEach((item) => {
        start = format(new Date(item.start), "MMM dd%, yyyy");
        end = item.end ? format(new Date(item.end), " - dd") : "";
        const title = start.replace("%", `${end}`);

        const eventItem = fromString(eventItemTemplate);

        eventItem.getElementsByClassName("event__item-title")[0].innerText =
          title;

        item.time.forEach(({ start, end, content }) => {
          const eventCard = fromString(eventCardTemplate);

          eventCard.getElementsByClassName("event__time")[0].innerHTML = start
            ? `${format(new Date(start), 'HH:mm')}${format(new Date(end), 'HH:mm') ? ` - ${format(new Date(end), 'HH:mm')}` : ""}`
            : "All day";
          const [eventContent] =
            eventCard.getElementsByClassName("event__content");
          eventContent.innerHTML = content.trim();

          if (!eventContent.getElementsByTagName("a").length)
            eventContent.nextElementSibling.remove();

          eventItem.appendChild(eventCard);
        });

        event.appendChild(eventItem);
      });

      hostElement.appendChild(event);
    });
  };

  const landingEvents = (events, take) => {
    const template = `
    <div class="event">
      <hr/>
      <div class="text-muted mb-2 event__start"></div>
      <a class="card-title mb-2 text-body event__link" target="_blank">
        <h6 class="event__title mb-2"></h6>
      </a>
      <div class="card-text event__content"></div>
    </div>`;

    // TODO: add a container to the landing page
    const hostElement = document.getElementById("landing-events");

    events.slice(0, take).forEach(({ start, title, description, url }) => {
      const eventItem = fromString(template);
      eventItem.getElementsByClassName("event__start")[0].innerText = format(
        new Date(start),
        "MMM dd, yyyy"
      );
      eventItem.getElementsByClassName("event__title")[0].innerText = title;
      eventItem.getElementsByClassName("event__link")[0].href = url;
      eventItem.getElementsByClassName("event__content")[0].innerHTML =
        description;

      hostElement.append(eventItem);
    });
  };

  const webcasts = (events, take = 3) => {
    const template = `
      <div class="card bg-light">
        <img class="card-img-top webcast__img" loading="lazy"/>
        <div class="card-body pt-4">
          <div class="align-items-start card-text d-flex flex-column text-left h-100">
            <div class="d-flex mb-4">
              <span class="-text-600 mr-4 webcast__start"></span>
              <span class="text-secondary text-uppercase webcast__type"></span>
            </div>
            <h5 class="webcast__title flex-grow-1"></h5>
            <a class="btn btn-link p-0 webcast__link"></a>
          </div>
        </div>
      </div>
    `;
    const hostElement = document.getElementById("community-webcasts");

    events.slice(0, take).forEach(({ start, title, type, url, img }) => {
      const eventItem = fromString(template);
      eventItem.getElementsByClassName("webcast__start")[0].innerText = format(
        new Date(start),
        "MMM dd, yyyy"
      );
      eventItem.getElementsByClassName("webcast__img")[0].src = img;
      eventItem.getElementsByClassName("webcast__title")[0].innerText = title;
      eventItem.getElementsByClassName("webcast__type")[0].innerText = type;
      const [link] = eventItem.getElementsByClassName("webcast__link");
      link.href = url;
      link.innerText = "Register";

      hostElement.append(eventItem);
    });
  };

  const eventsMap = events
    .map(({ start, end, ...rest }) => ({
      start: new Date(start),
      end: new Date(end),
      ...rest,
    }))
    .filter(({ end }) => addDays(end, 1).getTime() > Date.now());

  switch (type) {
    case "landing":
      landingEvents(eventsMap);
      break;
    case "webcast":
      webcasts(eventsMap);
      break;
    default:
      communityEvents(eventsMap);
      break;
  }
})();
