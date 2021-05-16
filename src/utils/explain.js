export function convertPoint(point) {
  return {
    x: point.x,
    y: point.y
  };
}

export function convertSnake(snake) {
  return {
    id: snake._id,
    name: snake.name,
    body: snake.body.map(convertPoint),
    health: snake.health,
    latency: parseInt(snake.latency),
    head: convertPoint(snake.body[0]),
    length: snake.body.length,
    shout: snake.shout,
    squad: snake.squad
  };
}

export function convertState(
  gameId,
  ruleset,
  timeout,
  width,
  height,
  frame,
  snakeId
) {
  // Only grab alive snakes
  const snakes = frame.snakes
    .filter(snake => snake.death == null)
    .map(convertSnake);
  const you = snakes.find(snake => snake.id == snakeId);

  if (!you) {
    throw new Error("The snake is already dead");
  }

  return {
    game: {
      id: gameId,
      ruleset: { name: ruleset, version: "1" },
      timeout: timeout
    },
    turn: frame.turn,
    board: {
      width: width,
      height: height,
      food: frame.food.map(convertPoint),
      hazards: frame.hazards.map(convertPoint),
      snakes: snakes
    },
    you
  };
}
