// @flow

import { List, Map, Set } from "immutable";
import emojisForRow from "./domain";
import { type InHouse } from "./puzzle";

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

function applyInHouse(options: Opts, inHouse: Set<InHouse>) {
  const map = inHouse.reduce(
    (map, { row, item, col }) => map.set(List([row, col]), Set([item])),
    Map()
  );
  return map.reduce(
    (acc, val, coords) => applyElimination(acc, coords.get(0)),
    options.map((opts, args) => map.get(List(args), opts))
  );
}

function mapRow(options, row, cb) {
  const rowCells = options.reduce(
    (list, vals, key) =>
      key.get(0) === row ? list.set(key.get(1), vals) : list,
    List()
  );
  const mappedRow = cb(rowCells);
  return mappedRow.reduce(
    (opts, cell, col) => opts.set(List([row, col]), cell),
    options
  );
}

function applyElimination(options, rowNumber): Opts {
  return mapRow(options, rowNumber, row => {
    const settle = cells => {
      const settled = cells.filter(({ vals }) => vals.count() === 1);

      if (settled.count() === 0) return cells;

      const unsettled = cells.filter(({ vals }) => vals.count() > 1);

      const settledSet = settled.reduce((s, { vals }) => s.union(vals), Set());

      return settled.concat(
        settle(
          unsettled.map(({ vals, col }) => ({
            col,
            vals: vals.subtract(settledSet)
          }))
        )
      );
    };

    return settle(row.map((vals, col) => ({ vals, col })))
      .sortBy(({ col }) => col)
      .map(({ vals }) => vals);
  });
}

export default class Options {
  static init(height: number, width: number, inHouse: Set<InHouse>) {
    return applyInHouse(buildOptions(height, width), inHouse);
  }

  static removeVal(options: Opts, row: number, col: number, val: number) {
    const updated = options.update(
      List([row, col]),
      opts => (opts.count() === 1 ? opts : opts.delete(val))
    );

    return applyElimination(updated, row);
  }
  static toCells(options: Opts) {
    const width = this.width(options);
    return options.reduce((acc, vals, k) => {
      const [row, col] = k.toJS();
      return acc.set(row * width + col, {
        col,
        emojis: vals.map(val => emojisForRow(row)[val]),
        row
      });
    }, List());
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
    const keys: Array<List<number>> = Array.from(options.keys());
    return (
      List(keys)
        .map(coords => coords.get(1))
        .max() + 1
    );
  }
}
