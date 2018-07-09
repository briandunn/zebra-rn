//@flow

import {List, Map, Set} from 'immutable';

const times = n => [...Array(n)].map((_, i) => i);

const buildOptions = (height, width) =>
  times(height).reduce(
    (map, y) =>
      times(width).reduce(
        (m, x) => m.set(List([x, y]), Set(times(width))),
        map,
      ),
    Map(),
  );

type Opts = Map<List<number>, Set<number>>;
type Clue = Map<string, Array<number>>;

function applyInHouse(options: Opts, inHouse: List<Clue>) {
  const map = inHouse.reduce(
    (map, clue) =>
      map.set(List(clue.get('args')[0]), Set([clue.get('args')[1]])),
    Map(),
  );
  return options.map((opts, args) => map.get(List(args), opts));
}

export default class Options {
  static init(height: number, width: number, inHouse: List<Clue>) {
    return applyInHouse(buildOptions(height, width), inHouse);
  }

  static removeVal(options: Opts, row: number, col: number, val: number) {
    const updated = options.update(
      List([row, col]),
      opts => (opts.count() === 1 ? opts : opts.delete(val)),
    );

    const cell = updated.get(List([row, col]));

    if (cell.count() === 1) {
      return updated.map(
        (opts, key) =>
          key.get(0) === row && key.get(1) !== col
            ? opts.filter(opt => cell.first() !== opt)
            : opts,
      );
    } else return updated;
  }
}
