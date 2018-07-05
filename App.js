//@flow

import Grid from "./components/Grid";
import Clue from "./components/Clue";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import t from "transit-js";
import { List, Map, Set } from "immutable";
import Options from './options'

function parse(body) {
  const parseSolution = solution =>
    [...solution.keys()].reduce(
      (map, key) => map.set(List(key), Set([solution.get(key)])),
      Map()
    );
  const data = t.reader().read(body);
  const get = (m, k) => m.get(t.keyword(`puzzle/${k}`));
  const puzzle = get(data, "puzzle");
  const grid = get(puzzle, "grid");
  const [height, width] = ["height", "width"].map(k => get(grid, k));
  const clues = Set(get(puzzle, "clues"))
    .map(clue =>
      Map({
        type: clue.get(t.keyword("clue/type")).name(),
        args: clue.get(t.keyword("clue/args"))
      })
    )
    .groupBy(c => c.get("type"));

  const inHouse = clues.get("in-house");
  const otherClues = List(clues.delete("in-house").values())
    .reduce((list, clues) => list.concat(clues), List())
    .sortBy(c => c.get("type"));

  const solution = parseSolution(get(puzzle, "solution"));

  return {
    clues: otherClues,
    grid: { height, width },
    options: Options.init(height, width, inHouse),
    solution
  };
}

type State = {
  solution: Map<List<number>, Set<number>>,
  options: Map<List<number>, Set<number>>,
  grid: {width: number, height: number},
  clues: List<Map<string, string>>,
  won: boolean
}

export default class App extends React.Component<{}, State> {
  constructor() {
    super();
    this.state = {
      clues: List([]),
      grid: { width: 0, height: 0 },
      options: Map([]),
      solution: Map([]),
      won: false,
    };
  }
  componentDidMount() {
    const body = t
      .writer()
      .write([
        t.list([
          t.map([
            t.keyword("puzzle/puzzle"),
            [t.keyword("puzzle/clues"), t.keyword("puzzle/solution")]
          ]),
          t.map([
            t.keyword("size"),
            4,
            t.keyword("clue-weights"),
            t.map([
              t.keyword("in-house"),
              1,
              t.keyword("left-of"),
              1,
              t.keyword("next-to"),
              1,
              t.keyword("same-house"),
              1
            ]),
            t.keyword("extra-clues"),
            1,
            t.keyword("ensured-clues"),
            t.map([
              t.keyword("in-house"),
              1,
              t.keyword("left-of"),
              1,
              t.keyword("same-house"),
              1
            ])
          ])
        ])
      ]);

    fetch("https://zebra.joshuadavey.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/transit+json" },
      body
    })
      .then(response => response.text())
      .then(text => {
        this.setState(parse(text));
      });
  }

  onClickOption = (row: number, col: number, i: number) => {
    this.setState(({ solution, options, ...state }) => {
      const updatedOptions = (() => {
        const updated = options.update(
          List([row, col]),
          opts => (opts.count() === 1 ? opts : opts.delete(i))
        );

        const cell = updated.get(List([row, col]));

        if (cell.count() === 1) {
          return updated.map(
            (opts, key) =>
              key.get(0) === row && key.get(1) !== col
                ? opts.filter(opt => cell.first() !== opt)
                : opts
          );
        } else return updated;
      })();

      return {
        ...state,
        solution,
        won: solution.equals(updatedOptions),
        options: updatedOptions
      };
    });
  };

  render() {
    const { clues, grid: { width, height }, options } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {clues.map((clue, i) => (
            <Clue args={clue.get("args")} type={clue.get("type")} key={i} />
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
