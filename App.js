//@flow

import React from "react";
import { Slider, StyleSheet, Text, View, Button } from "react-native";

import Game from "./components/Game";
import Options from "./options";
import Puzzle from "./puzzle";
import type { Opts } from "./options";

type State = { puzzle?: Puzzle, route: string };

class NewPuzzle extends React.Component<{ onNewPuzzle: Puzzle => any }, *> {
  get skill(): string {
    return ["beginner", "normal", "expert"][this.state.skill];
  }
  constructor() {
    super();
    this.state = { size: 4, skill: 1 };
  }
  onPress = () => {
    const config = { size: this.state.size, skill: this.skill };
    Puzzle.fetch(config).then(puzzle => {
      this.props.onNewPuzzle(puzzle);
    });
  };

  onChange = field => value => {
    this.setState({ [field]: value });
  };
  render() {
    return (
      <View>
        <Text>New Puzzle</Text>
        <Slider
          step={1}
          minimumValue={3}
          maximumValue={7}
          onValueChange={this.onChange("size")}
        />
        <Text>{this.state.size}</Text>
        <Slider
          step={1}
          minimumValue={0}
          maximumValue={2}
          onValueChange={this.onChange("skill")}
        />
        <Text>{this.skill}</Text>
        <Button title="go" onPress={this.onPress} />
      </View>
    );
  }
}

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
        <Button title="New" onPress={this.showNewForm} />
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
