//@flow

import Grid from "./components/Grid";
import Clue from "./components/Clue";
import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { List, Map, Set } from "immutable";
import Options from "./options";
import Puzzle from "./puzzle";
import type { Opts } from "./options";

type State = {
  solution: Opts,
  options: Opts,
  grid: { width: number, height: number },
  clues: List<{ args: any, type: string }>,
  history: List<Opts>
};

export default class App extends React.Component<{}, State> {
  constructor() {
    super();
    this.state = {
      clues: List([]),
      grid: { width: 0, height: 0 },
      options: Map([]),
      solution: Map([]),
      history: List([])
    };
  }
  componentDidMount() {
    this.reset();
  }

  undo = () => {
    const history = this.state.history.pop();
    if (!history.isEmpty()) this.setState({ options: history.last(), history });
  };

  reset = () => {
    Puzzle.fetch({}).then(({ width, height, inHouse, clues, solution }) => {
      const options = Options.init(height, width, inHouse);
      this.setState({
        clues,
        grid: { width, height },
        options,
        solution,
        history: List([options])
      });
    });
  };

  onClickOption = (row: number, col: number, val: number) => {
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
    const { options, solution } = this.state;
    //$FlowFixMe
    return options.equals(solution);
  }

  render() {
    const {
      clues,
      grid: { width, height },
      options
    } = this.state;
    return (
      <View style={styles.container}>
        {this.won && <Text>You win, bruh!</Text>}
        <View style={styles.header}>
          <Button title="Reset" onPress={this.reset} />
          <Button title="Undo" onPress={this.undo} />
          {clues.map((clue, i) => (
            <Clue args={clue.args} type={clue.type} key={i} />
          ))}
        </View>
        <Grid
          {...{ width, height, options, onClickOption: this.onClickOption }}
        />
      </View>
    );
  }
}

const border = borderColor => ({
  borderColor,
  borderWidth: 1,
  borderStyle: "solid"
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  header: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }
});
