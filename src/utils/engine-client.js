import { streamAll } from "../io/websocket";
import { makeQueryString, httpToWsProtocol, join } from "./url";
import { loadSvgs, getSvg, svgExists, makeDom } from "./inline-svg";
import { isLastFrameOfGame } from "./game-state";

const DEFAULT_SNAKE_HEAD = "default";
const DEFAULT_SNAKE_TAIL = "default";
const APP_VERSION = process.env.REACT_APP_VERSION;

async function get(url, query) {
  const response = await fetch(url + makeQueryString(query));
  if (response.status === 200) {
    return Promise.resolve(response.json());
  } else {
    return Promise.resolve(response.json()).then(responseJson => {
      console.error(responseJson.error);
      return Promise.reject(responseJson.error);
    });
  }
}

export function delay(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

export function getReadableCauseOfDeath(death) {
  // See https://github.com/BattlesnakeOfficial/rules/blob/master/standard.go
  switch (death.cause) {
    case "snake-collision":
      return `Ran into ${death.eliminatedBy}'s body`;
    case "snake-self-collision":
      return "Collided with itself";
    case "starvation": // DEPRECATED, REMOVE ME
      return "Out of health";
    case "out-of-health":
      return "Out of health";
    case "head-collision":
      return `Lost head-to-head with ${death.eliminatedBy}`;
    case "wall-collision":
      return "Moved out of bounds";
    case "squad-eliminated":
      return "Squad was eliminated";
    default:
      return death.cause;
  }
}

// Gets a list of all unique SVG paths required by the snakes.
function getAllSvgs(snakes) {
  const all = snakes.reduce((result, snake) => {
    return result.concat([snake.HeadType, snake.TailType]);
  }, []);
  const unique = new Set(all);
  return Array.from(unique);
}

async function assignHeadAndTailUrls(snakes) {
  for (const snake of snakes) {
    // Assign default if missing
    if (!snake.HeadType) {
      snake.HeadType = DEFAULT_SNAKE_HEAD;
    }
    if (!snake.TailType) {
      snake.TailType = DEFAULT_SNAKE_TAIL;
    }

    // Format as actual URL if it's just a name
    snake.HeadType = getSnakeHeadSvgUrl(snake.HeadType);
    snake.TailType = getSnakeTailSvgUrl(snake.TailType);

    if (!(await svgExists(snake.HeadType))) {
      snake.HeadType = getSnakeHeadSvgUrl(DEFAULT_SNAKE_HEAD);
    }
    if (!(await svgExists(snake.TailType))) {
      snake.TailType = getSnakeTailSvgUrl(DEFAULT_SNAKE_TAIL);
    }
  }
}

async function setHeadAndTailSvgs(snakes) {
  await assignHeadAndTailUrls(snakes);
  await loadSvgs(getAllSvgs(snakes));

  for (const snake of snakes) {
    snake.HeadSvg = getSvg(
      snake.HeadType,
      '<svg id="root" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle fill="none" cx="12.52" cy="28.55" r="9.26"/><path d="M0 100h100L56 55.39l44-39.89V.11L0 0zm12.52-80.71a9.26 9.26 0 1 1-9.26 9.26 9.26 9.26 0 0 1 9.26-9.26z"/></svg>'
    );
    snake.TailSvg = getSvg(
      snake.TailType,
      '<svg id="root" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 0H0v100h50l50-50L50 0z"/></svg>'
    );
  }
}

function isIllegalSvgPath(nameOrPath) {
  return nameOrPath.indexOf("/") >= 0 || nameOrPath.indexOf(".") >= 0;
}

function svgUrlFromName(base, relative) {
  //appending the git hash of this version allows for cache busting on deploy
  const extension = ".svg?board_version=" + APP_VERSION;
  return join("https://media.battlesnake.com", base, relative) + extension;
}

function getSnakeHeadSvgUrl(path) {
  const effectivePath = isIllegalSvgPath(path) ? DEFAULT_SNAKE_HEAD : path;
  return svgUrlFromName("/snakes/heads", effectivePath);
}

function getSnakeTailSvgUrl(path) {
  const effectivePath = isIllegalSvgPath(path) ? DEFAULT_SNAKE_TAIL : path;
  return svgUrlFromName("/snakes/tails", effectivePath);
}

async function prepareFrame(frame) {
  await setHeadAndTailSvgs(frame.Snakes);
}

export function fetchGameInfo(baseUrl, gameId) {
  const url = join(baseUrl, `games/${gameId}`);
  return get(url);
}

export async function streamAllFrames(baseUrl, gameId, receiveFrame) {
  const game = await fetchGameInfo(baseUrl, gameId);

  let chain = Promise.resolve();
  function onFrame(frame) {
    chain = chain.then(async () => {
      await prepareFrame(frame);
      return receiveFrame(game, frame);
    });
    return isLastFrameOfGame(frame);
  }

  const wsUrl = join(httpToWsProtocol(baseUrl), `socket/${gameId}`);
  await streamAll(wsUrl, onFrame);
  await chain;
}

export function getFrameByTurn(frames, turn) {
  return frames.filter(frame => frame.turn === turn)[0];
}
