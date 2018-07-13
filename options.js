//@flow

import { List, Map, Set } from "immutable";
import emojisForRow from "./domain";

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

export type Opts = Map<List<number>, Set<number>>;
type Cell = {
  col: number,
  row: number,
  emojis: Set<{ i: number, char: string }>
};
type Clue = Map<string, Array<number>>;

function applyInHouse(options: Opts, inHouse: List<Clue>) {
  const map = inHouse.reduce((map, clue) => {
    const [[row, item], col] = clue.get("args");
    return map.set(List([row, col]), Set([item]));
  }, Map());
  return map.reduce(
    (acc, val, coords) => applyElimination(acc, coords.get(0), coords.get(1)),
    options.map((opts, args) => map.get(List(args), opts))
  );
}

function applyElimination(options, row, col) {
  const cell = options.get(List([row, col]));
  return cell.count() == 1
    ? options.map(
        (opts, key) =>
          key.get(0) === row && key.get(1) !== col
            ? opts.filter(opt => cell.first() !== opt)
            : opts
      )
    : options;
}

export default class Options {
  static init(height: number, width: number, inHouse: List<Clue>) {
    return applyInHouse(buildOptions(height, width), inHouse);
  }

  static removeVal(options: Opts, row: number, col: number, val: number) {
    const updated = options.update(
      List([row, col]),
      opts => (opts.count() === 1 ? opts : opts.delete(val))
    );

    return applyElimination(updated, row, col);
  }
  static toCells(options: Opts) {
    const width = this.width(options);
    return options.reduce(
      (acc, vals, [row, col]) =>
        acc.set(row * width + col, {
          col,
          emojis: vals.map(val => emojisForRow(row)[val]),
          row
        }),
      List()
    );
  }

  static rows(options: Opts): List<List<Cell>> {
    const width = this.width(options);
    const cells = this.toCells(options);
    return cells.reduce(
      (acc, cell, i) =>
        acc.update(Math.floor(i / width), List(), row => row.push(cell)),
      List()
    );
  }

  static width(options: Opts): number {
    return (
      List(options.keys())
        .map(([row, col]) => col)
        .max() + 1
    );
  }
}
