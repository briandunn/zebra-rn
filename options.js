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

function applyInHouse(options, inHouse) {
  const map = inHouse.reduce(
    (map, clue) =>
      map.set(List(clue.get('args')[0]), Set([clue.get('args')[1]])),
    Map(),
  );
  return options.map((opts, args) => map.get(List(args), opts));
}

export default class Options {
  static init(height, width, inHouse) {
    return applyInHouse(buildOptions(height,width), inHouse)
  }
}
