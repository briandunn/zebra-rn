//@flow

import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

import Game from "./components/Game";
import NewPuzzle from "./components/New";
import Options from "./options";
import type Puzzle from "./puzzle";
import type { Opts } from "./options";

type State = { puzzle?: Puzzle, route: string };

export default class App extends React.Component<{}, State> {
  state = { puzzle: undefined, route: "new" };

  showNewForm = () => {
    this.setState({ route: "new" });
  };

  onNewPuzzle = (puzzle: Puzzle) => {
    this.setState({ route: "game", puzzle });
  };

  render() {
    const { puzzle } = this.state;
    const routes = {
      new: <NewPuzzle onNewPuzzle={this.onNewPuzzle} />,
      game: <Game {...{ puzzle }} />
    };

    return (
      <View style={styles.container}>
        {this.state.route === "game" && (
          <Button title="New" onPress={this.showNewForm} />
        )}
        {routes[this.state.route]}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    padding: 20
  }
});
