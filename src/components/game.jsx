import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";

import BlankState from "./blank-state";
import LoadingIndicator from "./loading-indicator";
import GameNotFound from "./game-not-found";
import Board from "./board";
import Scoreboard from "./scoreboard";
import MediaControls from "./mediaControls";
import Logo from "./logo";
import Explain from "./explain";
import { breakpoints, colors, themes } from "../theme";

const PageWrapper = styled("div")`
  position: relative;
  height: 100%;
  width: 100%;
  background: ${({ theme }) =>
    theme === themes.dark ? colors.purple : "transparent"};
  background: ${({ theme }) =>
    theme === themes.dark
      ? `linear-gradient(30deg,hsl(280, 94%, 16%) 30%,hsl(269,99%,30%) 100%)`
      : "transparent"};
`;

const GameBoardWrapper = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  height: "100%"
});

const BoardTitle = styled("div")(({ theme }) => ({
  paddingLeft: "2rem",
  paddingTop: "1rem",
  fontSize: "3.5rem",
  fontFamily: "'Permanent Marker', cursive",
  textAlign: "center",
  color: theme === themes.dark ? colors.lightText : colors.darkText,
  letterSpacing: ".3rem"
}));

const HeaderWrapper = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding-right: 1rem;
  text-align: center;

  @media (min-width: ${breakpoints.xxl}) {
    padding-top: 1rem;
    padding-bottom: 2rem;
  }
`;

const LogoWrapper = styled("div")`
  width: 100%;
  height: 5rem;

  @media (min-width: ${breakpoints.lg}) {
    height: 8rem;
  }

  @media (min-width: ${breakpoints.xxl}) {
    height: 16rem;
  }
`;

const TurnCount = styled("div")`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${({ theme }) =>
    theme === themes.dark ? colors.lightText : colors.darkText};

  @media (min-width: ${breakpoints.xxl}) {
    font-size: 3rem;
  }
`;
const TurnCountValue = styled("span")`
  display: inline-block;
  width: 8rem;
`;

const BoardWrapper = styled("div")`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  @media (min-width: ${breakpoints.md}) {
    width: ${({ hideScoreboard }) => (hideScoreboard ? "100%" : "60vw")};
  }
`;

const ScoreboardWrapper = styled("div")`
  display: none;
  width: 40vw;
  margin-left: 2rem;

  @media (min-width: ${breakpoints.md}) {
    display: ${({ hide }) => (hide ? "none" : "block")};
  }
`;

const Ruleset = styled("p")`
  width: 100%;
  font-size: 1.2rem;
  text-align: center;
  color: #aaa;
  text-transform: capitalize;
`;

function Game(props) {
  const { options } = props;

  if (options.boardTheme) {
    props.toggleTheme(options.boardTheme);
  }

  const [explainState, setExplainState] = useState();

  useEffect(() => {
    props.setGameOptions(options);
    props.fetchFrames();
  }, []);

  if (!(options.game && options.engine)) {
    return <BlankState />;
  }

  const hideLogo = options.hideLogo === "true";
  const hideScoreboard = options.hideScoreboard === "true";
  const title = options.title && decodeURIComponent(options.title);

  if (props.gameNotFound) {
    return <GameNotFound />;
  }

  if (!props.currentFrame) {
    return <LoadingIndicator />;
  }

  const { currentFrame } = props;
  return (
    <PageWrapper theme={props.theme}>
      <GameBoardWrapper>
        <BoardWrapper hideScoreboard={hideScoreboard}>
          <BoardTitle theme={props.theme}>{title}</BoardTitle>
          <Board
            snakes={currentFrame.snakes}
            food={currentFrame.food}
            foodImage={options.foodImage}
            hazards={currentFrame.hazards}
            columns={props.grid.width}
            rows={props.grid.height}
            highlightedSnake={props.highlightedSnake}
            theme={props.theme}
            turn={currentFrame.turn}
            explainState={explainState}
          />
          <MediaControls
            currentFrame={currentFrame}
            hideControls={options.hideMediaControls === "true"}
            toggleTheme={props.toggleTheme}
            reloadGame={props.reloadGame}
            toggleGamePause={props.toggleGamePause}
            stepBackwardFrame={props.stepBackwardFrame}
            stepForwardFrame={props.stepForwardFrame}
            paused={props.paused}
            theme={props.theme}
          />
        </BoardWrapper>
        {!hideScoreboard && (
          <ScoreboardWrapper>
            <HeaderWrapper>
              {!hideLogo && (
                <LogoWrapper>
                  <Logo theme={props.theme} />
                </LogoWrapper>
              )}
              <TurnCount theme={props.theme}>
                Turn <TurnCountValue>{currentFrame.turn}</TurnCountValue>
              </TurnCount>
            </HeaderWrapper>
            <Scoreboard
              turn={currentFrame.turn}
              snakes={currentFrame.snakes}
              food={currentFrame.food}
              highlightSnake={props.highlightSnake}
              theme={props.theme}
            />
            <Ruleset>Game Ruleset: {props.ruleset.name}</Ruleset>
            <Explain
              currentFrame={currentFrame}
              outer_props={props}
              setExplainState={setExplainState}
              explainState={explainState}
            />
          </ScoreboardWrapper>
        )}
      </GameBoardWrapper>
    </PageWrapper>
  );
}

export default Game;
