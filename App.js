//@flow

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { reader, keyword } from "transit-js";
import domain from "./domain";
import emoji from "./emoji";
const times = n => [...Array(n)].map((_, i) => i);
function parse(body) {
  const data = reader().read(body);
  const get = (m, k) => m.get(keyword(`puzzle/${k}`));
  const puzzle = get(data, "puzzle");
  const grid = get(puzzle, "grid");
  const [height, width] = ["height", "width"].map(k => get(grid, k));
  return { grid: { height, width } };
}

function emojisForRow(row, count) {
  return domain[row][1]
    .slice(0, count)
    .map(name => ({ name, char: String.fromCodePoint(emoji[name]) }));
}

export default class App extends React.Component {
  constructor() {
    super();
    this.state = { grid: { width: 0, height: 0 } };
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
  render() {
    const { grid: { width, height } } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header} />
        <View style={styles.grid}>
          {times(height).map(row =>
            times(width).map(col => (
              <View
                style={{
                  flexBasis: "25%",
                  ...border("blue"),
                  backgroundColor: ["#9ccc65", "#ffa726", "#fdd835", "#29b6f6"][
                    row
                  ]
                }}
                key={`cell-${row}-${col}`}
              >
                {emojisForRow(row, width).map(({ name, char }) => (
                  <Text
                    style={{ textAlign: "center", ...border("green"), flex: 2 }}
                    key={`emoji-${name}`}
                  >
                    {char}
                  </Text>
                ))}
              </View>
            ))
          )}
        </View>
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
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...border("red")
  },
  header: { flex: 3 },
  grid: {
    alignContent: "stretch",
    ...border("yellow"),
    flex: 7,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center"
  }
});
