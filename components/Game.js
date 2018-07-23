//@flow
import React from "react";
import { List, Map, Set } from "immutable";
import { LayoutAnimation, StyleSheet, Text, View, Button } from "react-native";

import Grid from "./Grid";
import Clue from "./Clue";
import Options, { type Opts } from "../options";
import type Puzzle from "../puzzle";

type State = {
  options: Opts,
  history: List<Opts>
};

type Props = { puzzle: Puzzle };

export default class Game extends React.Component<Props, State> {
  constructor({ puzzle: { height, width, inHouse } }: Props) {
    super();
    const options = Options.init(height, width, inHouse);
    this.state = {
      options,
      history: List([options])
    };
  }

  undo = () => {
    const history = this.state.history.pop();
    if (!history.isEmpty()) this.setState({ options: history.last(), history });
  };

  onClickOption = (row: number, col: number, val: number) => {
    LayoutAnimation.linear();
    this.setState(({ options, history, ...state }) => {
      const updatedOptions = Options.removeVal(options, row, col, val);

      return {
        ...state,
        options: updatedOptions,
        //$FlowFixMe
        history: updatedOptions.equals(options)
          ? history
          : history.push(updatedOptions)
      };
    });
  };

  get won() {
    const { options } = this.state;
    const {
      puzzle: { solution }
    } = this.props;
    //$FlowFixMe
    return options.equals(solution);
  }

  render() {
    const { options } = this.state;
    const {
      puzzle: { clues, width, height }
    } = this.props;
    return (
      <React.Fragment>
        <View style={styles.header}>
          {this.won && <Text>You win, bruh!</Text>}
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
