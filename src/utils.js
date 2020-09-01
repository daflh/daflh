const axios = require("axios");

const getAnimations = () => {
  return `
    /* Animations */
    @keyframes scaleInAnimation {
      from {
        transform: translate(-5px, 5px) scale(0);
      }
      to {
        transform: translate(-5px, 5px) scale(1);
      }
    }
    @keyframes fadeInAnimation {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;
};

const renderError = (message, secondaryMessage = "") => {
  return `
    <svg width="495" height="120" viewBox="0 0 495 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
    .text { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #2F80ED }
    .small { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #252525 }
    .gray { fill: #858585 }
    </style>
    <rect x="0.5" y="0.5" width="494" height="99%" rx="4.5" fill="#FFFEFE" stroke="#E4E2E2"/>
    <text x="25" y="45" class="text">Something went wrong! file an issue at https://git.io/JJmN9</text>
    <text data-testid="message" x="25" y="55" class="text small">
      <tspan x="25" dy="18">${encodeHTML(message)}</tspan>
      <tspan x="25" dy="18" class="gray">${secondaryMessage}</tspan>
    </text>
    </svg>
  `;
};

// https://stackoverflow.com/a/48073476/10629172
function encodeHTML(str) {
  return str
    .replace(/[\u00A0-\u9999<>&](?!#)/gim, (i) => {
      return "&#" + i.charCodeAt(0) + ";";
    })
    .replace(/\u0008/gim, "");
}

function isValidHexColor(hexColor) {
  return new RegExp(
    /^([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{4})$/
  ).test(hexColor);
}

function parseArray(str) {
  if (!str) return [];
  return str.split(",");
}

function clampValue(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function isValidGradient(colors) {
  return isValidHexColor(colors[1]) && isValidHexColor(colors[2]);
}

function fallbackColor(color, fallbackColor) {
  let colors = color.split(",");
  let gradient = null;

  if (colors.length > 1 && isValidGradient(colors)) {
    gradient = colors;
  }

  return (
    (gradient ? gradient : isValidHexColor(color) && `#${color}`) ||
    fallbackColor
  );
}

function request(data, headers) {
  return axios({
    url: "https://api.github.com/graphql",
    method: "post",
    headers,
    data,
  });
}

/**
 *
 * @param {String[]} items
 * @param {Number} gap
 * @param {string} direction
 *
 * @description
 * Auto layout utility, allows us to layout things
 * vertically or horizontally with proper gaping
 */
function FlexLayout({ items, gap, direction }) {
  // filter() for filtering out empty strings
  return items.filter(Boolean).map((item, i) => {
    let transform = `translate(${gap * i}, 0)`;
    if (direction === "column") {
      transform = `translate(0, ${gap * i})`;
    }
    return `<g transform="${transform}">${item}</g>`;
  });
}

// returns theme based colors with proper overrides and defaults
function getCardColors({
  title_color,
  text_color,
  bg_color
}) {
  const theme = {
    title_color: "33383d",
    text_color: "333",
    bg_color: "fffefe",
  };

  // get the color provided by the user else the theme color
  // finally if both colors are invalid fallback to default theme
  const titleColor = fallbackColor(
    title_color || theme.title_color,
    "#" + theme.title_color
  );
  const textColor = fallbackColor(
    text_color || theme.text_color,
    "#" + theme.text_color
  );
  const bgColor = fallbackColor(
    bg_color || theme.bg_color,
    "#" + theme.bg_color
  );

  return { titleColor, textColor, bgColor };
}

const noop = () => {};
// return console instance based on the environment
const logger =
  process.env.NODE_ENV !== "test" ? console : { log: noop, error: noop };

const SECONDARY_ERROR_MESSAGES = {
  MAX_RETRY:
    "Please add an env variable called PAT_1 with your github token in vercel",
  USER_NOT_FOUND: "Make sure the provided username is not an organization",
};

class CustomError extends Error {
  constructor(message, type) {
    super(message);
    this.type = type;
    this.secondaryMessage = SECONDARY_ERROR_MESSAGES[type] || "adsad";
  }

  static MAX_RETRY = "MAX_RETRY";
  static USER_NOT_FOUND = "USER_NOT_FOUND";
}

module.exports = {
  getAnimations,
  renderError,
  request,
  parseArray,
  FlexLayout,
  getCardColors,
  clampValue,
  logger,
  CustomError,
};
