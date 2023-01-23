require("dotenv").config();
const { renderError, parseArray } = require("../src/utils");
const fetchData = require("../src/fetcher");
const render = require("../src/card");

module.exports = async (req, res) => {
  const username = "daflh";
  const {
    hide,
    max_lang,
    layout,
    card_width,
    title_color,
    text_color,
    bg_color
  } = req.query;
  let topLangs;

  res.setHeader("Content-Type", "image/svg+xml");

  try {
    topLangs = await fetchData(username, parseInt(max_lang || 10, 10));

    const cacheSeconds = 60 * 60 * 2;

    res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}`);
    
    return res.send(
      render(topLangs, {
        hide: parseArray(hide),
        layout,
        card_width: parseInt(card_width, 10),
        title_color,
        text_color,
        bg_color
      })
    );
  } catch (err) {
    return res.send(renderError(err.message, err.secondaryMessage));
  }
};
