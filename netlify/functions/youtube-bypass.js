import fetch from "node-fetch";

const API_URL = "https://youtube.googleapis.com/youtube/v3";

const mapToReponse = (response) => response.items.map(({ snippet }) => snippet);

exports.handler = async ({ queryStringParameters }, context) => {
  try {
    const { id, take } = queryStringParameters;
    const url = `${API_URL}/playlistItems?part=snippet&playlistId=${id}&maxResults=${
      take || 1
    }&key=${process.env.YOUTUBE_API_KEY}`;
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
