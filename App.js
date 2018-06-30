//@flow

import Grid from "./components/Grid";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { reader, keyword } from "transit-js";
import { fromJS, List, Map, Set } from "immutable";

const times = n => [...Array(n)].map((_, i) => i);

const buildOptions = (height, width) =>
  times(height).reduce(
    (map, y) =>
      times(width).reduce(
        (m, x) => m.set(List([x, y]), Set(times(width))),
        map
      ),
    Map()
  );

function parse(body) {
  const data = reader().read(body);
  const get = (m, k) => m.get(keyword(`puzzle/${k}`));
  const puzzle = get(data, "puzzle");
  const grid = get(puzzle, "grid");
  const [height, width] = ["height", "width"].map(k => get(grid, k));
  const options = buildOptions(height, width);
  const clues = Set(get(puzzle, "clues")).map(clue =>
    Map({
      type: clue.get(keyword("clue/type")).name(),
      args: clue.get(keyword("clue/args"))
    })
  );

  return { clues, grid: { height, width }, options };
}

function emojisForRow(row, count) {
  return domain[row][1]
    .slice(0, count)
    .map((name, i) => ({ i, char: String.fromCodePoint(emoji[name]) }));
}

export default class App extends React.Component {
  constructor() {
    super();
    this.state = { grid: { width: 0, height: 0 }, options: Map([]) };
  }
  componentDidMount() {
    fetch("http://127.0.0.1:3000/api", {
      method: "POST",
      headers: { "Content-Type": "application/transit+json" },
      body: JSON.stringify([
        [
          "~#list",
          [
            ["^ ", "~:puzzle/puzzle", ["~:puzzle/clues", "~:puzzle/solution"]],
            [
              "^ ",
              "~:size",
              4,
              "~:clue-weights",
              [
                "^ ",
                "~:in-house",
                1,
                "~:left-of",
                1,
                "~:next-to",
                1,
                "~:same-house",
                1
              ],
              "~:extra-clues",
              1,
              "~:ensured-clues",
              ["^ ", "^6", 1, "^9", 1, "^7", 1]
            ]
          ]
        ]
      ])
    })
      .then(response => response.text())
      .then(text => {
        this.setState(parse(text));
      });
  }

  onClickOption = (row, col, i) => {
    this.setState(({ options, ...state }) => ({
      ...state,
      options: options.update(List([row, col]), opts => opts.delete(i))
    }));
  };

  render() {
    const { grid: { width, height }, options } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header} />
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
  header: { flex: 3 }
});
