import fetch from "node-fetch";

const API_URL = "https://youtube.googleapis.com/youtube/v3";

const mapToReponse = (response) => response.items.map(({ snippet }) => snippet);

exports.handler = async ({ queryStringParameters }, context) => {
  try {
    const { id, take, type } = queryStringParameters;
    let url;
    switch (type) {
      case "videos":
        url = `${API_URL}/videos?key=${process.env.YOUTUBE_API_KEY}&part=snippet&id=${id}`;
        break;
      default: // playlist is default 
        url = `${API_URL}/playlistItems?key=${process.env.YOUTUBE_API_KEY}&part=snippet&playlistId=${id}&maxResults=${take || 1}`;
        break;
    }

    const response = await fetch(url);
    const json = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(mapToReponse(json)),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (err) {
    console.log(err);

    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
