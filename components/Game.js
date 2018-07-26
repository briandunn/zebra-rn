//@flow
import React from "react";
import { List, Map, Set } from "immutable";
import { LayoutAnimation, StyleSheet, Text, View, Button } from "react-native";

import Grid from "./Grid";
import Clue from "./Clue";
import Options, { type Opts } from "../options";
import type Puzzle from "../puzzle";

type State = {
  history: List<Opts>,
  options: Opts,
  startedAt: Date,
  undoCount: number,
  wonAt?: Date
};

type Props = { puzzle: Puzzle };

export default class Game extends React.Component<Props, State> {
  constructor({ puzzle: { height, width, inHouse } }: Props) {
    super();
    const options = Options.init(height, width, inHouse);
    this.state = {
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

  render() {
    const { options } = this.state;
    const {
      puzzle: { clues, width, height, skill }
    } = this.props;
    return (
      <React.Fragment>
        <View style={styles.header}>
          <Text>{skill}</Text>
          {this.state.wonAt && (
            <Text>
              You won in {this.state.wonAt - this.state.startedAt}s, bruh!
            </Text>
          )}
          <Button title="Undo" onPress={this.undo} />
          {clues.map((clue, i) => (
            <Clue args={clue.args} type={clue.type} key={i} />
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
  header: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }
});
