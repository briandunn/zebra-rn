// @flow

import { List, Map, Set, Record } from "immutable";
import t from "transit-js";
import { type Opts } from "./options";

export type InHouse = {
  col: number,
  item: number,
  row: number,
  type: string
};

type Clue = {
  args: Array<Array<number>>,
  type: string
};

const dificulties = {
  beginner: {
    extraClues: 2,
    clueWeights: { inHouse: 1.2, leftOf: 1, nextTo: 0, sameHouse: 1.3 },
    ensuredClues: { inHouse: 1, sameHouse: 2, leftOf: 1 }
  },
  normal: {
    extraClues: 1,
    clueWeights: { inHouse: 1, leftOf: 1, nextTo: 1, sameHouse: 1 },
    ensuredClues: { inHouse: 1, sameHouse: 1, leftOf: 1 }
  },
  expert: {
    extraClues: 0,
    clueWeights: { inHouse: 0.9, leftOf: 1.1, nextTo: 1.2, sameHouse: 1.1 },
    ensuredClues: { inHouse: 0, sameHouse: 1, leftOf: 1 }
  }
};

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
      ({
        ["in-house"]: (type, [[row, item], col]) => ({ row, item, col, type }),
        ["left-of"]: (type, args) => ({ args, type }),
        ["next-to"]: (type, args) => ({ args, type }),
        ["same-house"]: (type, args) => ({ args, type })
      }[clue.get(t.keyword("clue/type")).name()](
        clue.get(t.keyword("clue/type")).name(),
        clue.get(t.keyword("clue/args"))
      ))
    )
    .groupBy(c => c.type)
    .toMap();

  const inHouse = clues.get("in-house", List([]));
  const otherClues = List(clues.delete("in-house").values())
    .reduce((list, clues) => list.concat(clues), List())
    .sortBy(c => c.type);

  const solution = List(get(puzzle, "solution")).reduce(
    (acc, [[row, item], col]) => acc.set(List([row, col]), Set([item])),
    Map()
  );

  return {
    clues: otherClues,
    height,
    width,
    inHouse,
    solution
  };
}

type EnsuredCluesProps = { inHouse: number, leftOf: number, sameHouse: number };

export type ConfigProps = {
  size: number,
  skill: string
};

function configToBody({ skill, size }: ConfigProps) {
  const config = {
    size,
    ...dificulties[skill]
  };

  return t
    .writer()
    .write([
      t.list([
        t.map([
          t.keyword("puzzle/puzzle"),
          [t.keyword("puzzle/clues"), t.keyword("puzzle/solution")]
        ]),
        t.map([
          t.keyword("size"),
          config.size,
          t.keyword("clue-weights"),
          t.map([
            t.keyword("in-house"),
            config.clueWeights.inHouse,
            t.keyword("left-of"),
            config.clueWeights.leftOf,
            t.keyword("next-to"),
            config.clueWeights.nextTo,
            t.keyword("same-house"),
            config.clueWeights.sameHouse
          ]),
          t.keyword("extra-clues"),
          config.extraClues,
          t.keyword("ensured-clues"),
          t.map([
            t.keyword("in-house"),
            config.ensuredClues.inHouse,
            t.keyword("left-of"),
            config.ensuredClues.leftOf,
            t.keyword("same-house"),
            config.ensuredClues.sameHouse
          ])
        ])
      ])
    ]);
}

export default class Puzzle {
  clues: List<Clue>;
  height: number;
  inHouse: Set<InHouse>;
  solution: Opts;
  width: number;
  skill: string;

  static fetch(config: ConfigProps): Promise<Puzzle> {
    return fetch("https://zebra.joshuadavey.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/transit+json" },
      body: configToBody(config)
    })
      .then(response => response.text())
      .then(parse)
      .then(puzzle => ({ ...puzzle, skill: config.skill }));
  }
}
