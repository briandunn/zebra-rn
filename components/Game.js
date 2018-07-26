//@flow
import React from "react";
import { List, Map, Set } from "immutable";
import { LayoutAnimation, StyleSheet, Text, View, Button } from "react-native";

import Grid from "./Grid";
import ClueComponent from "./Clue";
import Options, { type Opts } from "../options";
import type Puzzle, { Clue } from "../puzzle";

type State = {
  history: List<Opts>,
  options: Opts,
  startedAt: Date,
  undoCount: number,
  wonAt?: Date,
  appliedClues: List<Clue>
};

type Props = { puzzle: Puzzle };

const toggle = (list: List<Clue>, item: Clue): List<Clue> =>
  list.includes(item)
    ? list.filter(i => !(i.type === item.type && i.args === item.args))
    : list.push(item);

export default class Game extends React.Component<Props, State> {
  constructor({ puzzle: { height, width, inHouse } }: Props) {
    super();
    const options = Options.init(height, width, inHouse);
    this.state = {
      appliedClues: List([]),
      history: List([options]),
      options,
      startedAt: new Date(),
      undoCount: 0
    };
  }

  undo = () => {
    const history = this.state.history.pop();
    if (!history.isEmpty()) {
      this.setState({
        options: history.last(),
        history,
        undoCount: this.state.undoCount + 1
      });
    }
  };

  onClickOption = (row: number, col: number, val: number) => {
    LayoutAnimation.linear();
    this.setState(({ options, history, ...state }) => {
      const updatedOptions = Options.removeVal(options, row, col, val);

      if (!updatedOptions.equals(options)) {
        const {
          puzzle: { solution }
        } = this.props;

        return {
          ...state,
          options: updatedOptions,
          history: history.push(updatedOptions),
          wonAt: updatedOptions.equals(solution) ? new Date() : undefined
        };
      }
      return state;
    });
  };

  get duration() {
    if (this.state.wonAt) {
      const ms = this.state.wonAt - this.state.startedAt;
      return ms / 1000;
    }
  }

  onPressClue = (clue: Clue) => () => {
    this.setState(({ appliedClues, ...state }) => ({
      ...state,
      appliedClues: toggle(appliedClues, clue)
    }));
  };

  isAppliedClue = (clue: Clue) => this.state.appliedClues.includes(clue);

  render() {
    const { options } = this.state;
    const {
      puzzle: { clues, width, height, skill }
    } = this.props;
    return (
      <React.Fragment>
        <Text>{skill}</Text>
        {this.state.wonAt && <Text>You won in {this.duration}s, bruh!</Text>}
        <Button title="Undo" onPress={this.undo} />
        <View style={styles.clues}>
          {clues.map((clue, i) => (
            <ClueComponent
              args={clue.args}
              type={clue.type}
              key={i}
              onPress={this.onPressClue(clue)}
              applied={this.isAppliedClue(clue)}
            />
          ))}
        </View>
        <Grid
          {...{ width, height, options, onClickOption: this.onClickOption }}
        />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  clues: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }
});
