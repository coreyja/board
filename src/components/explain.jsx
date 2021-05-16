import React, { useState, useEffect } from "react";

import { convertState } from "../utils/explain";

import ReactJson from "react-json-view";

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

  const onClick = async () => {
    const newGameState = convertState(
      outer_props.options.game,
      outer_props.ruleset.name,
      500, // I don't see this in the props
      outer_props.grid.width,
      outer_props.grid.height,
      currentFrame,
      "gs_MXxcS3WCBVJKQQBcjWc7pVbS"
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

    setExplainState(await result.json());
  };

  return (
    <>
      Lets do some explaining <button onClick={onClick}>Explain Devin</button>
      {explainState && (
        <ReactJson
          src={explainState}
          style={{ maxHeight: "35vh", overflowX: "scroll" }}
          collapsed={3}
        />
      )}
    </>
  );
}
