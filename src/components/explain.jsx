import React, { useState, useEffect } from "react";
import cloneDeep from "lodash.clonedeep";

import { convertState } from "../utils/explain";

import ReactJson from "react-json-view";
import { sortBy } from "lodash";

const COLORS = ["red", "green", "blue", "purple"];

export default function Explain({
  currentFrame,
  outer_props,
  explainState,
  setExplainState
}) {
  const snakeUrl = "http://localhost:8000/devious-devin/explain";

  useEffect(() => {
    setExplainState(undefined);
  }, [currentFrame.turn]);

  const explainOptions = explainState && explainState.options;

  const onClick = async () => {
    const newGameState = convertState(
      outer_props.options.game,
      outer_props.ruleset.name,
      500, // I don't see this in the props
      outer_props.grid.width,
      outer_props.grid.height,
      currentFrame,
      "devious-devin"
    );

    const result = await fetch(snakeUrl, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },

      //make sure to serialize your JSON body
      body: JSON.stringify(newGameState)
    });
    const newExplainState = await result.json();

    newExplainState.options.map((option, i) => {
      option.color = COLORS[i];
      option.selected = true;
    });

    newExplainState.options = sortBy(
      newExplainState.options,
      option => -option.score
    );

    setExplainState(newExplainState);
  };

  return (
    <>
      <button onClick={onClick}>Explain Devin</button>
      {explainOptions &&
        explainOptions.map((option, i) => (
          <>
            <br />
            <label style={{ color: option.color }}>
              Dir: {option.moves[0].dir}
              Score: {JSON.stringify(option.score)}
              <input
                type="checkbox"
                key={i}
                checked={option.selected}
                onChange={() =>
                  setExplainState(oldState => {
                    const newState = cloneDeep(oldState);
                    newState.options[i].selected = !oldState.options[i]
                      .selected;

                    return newState;
                  })
                }
              />
            </label>
          </>
        ))}
    </>
  );
}
