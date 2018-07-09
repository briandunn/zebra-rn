// @flow

import {List, Map, Set} from 'immutable';
import t from 'transit-js';

function parse(body) {
  const parseSolution = solution =>
    [...solution.keys()].reduce(
      (map, key) => map.set(List(key), Set([solution.get(key)])),
      Map(),
    );
  const data = t.reader().read(body);
  const get = (m, k) => m.get(t.keyword(`puzzle/${k}`));
  const puzzle = get(data, 'puzzle');
  const grid = get(puzzle, 'grid');
  const [height, width] = ['height', 'width'].map(k => get(grid, k));
  const clues = Set(get(puzzle, 'clues'))
    .map(clue =>
      Map({
        type: clue.get(t.keyword('clue/type')).name(),
        args: clue.get(t.keyword('clue/args')),
      }),
    )
    .groupBy(c => c.get('type'));

  const inHouse = clues.get('in-house');
  const otherClues = List(clues.delete('in-house').values())
    .reduce((list, clues) => list.concat(clues), List())
    .sortBy(c => c.get('type'));

  const solution = parseSolution(get(puzzle, 'solution'));

  return {
    clues: otherClues,
    height, width,
    inHouse,
    solution,
  };
}

type EnsuredCluesProps = {inHouse: number, leftOf: number, sameHouse: number};

type ClueWeightsProps = {
  inHouse: number,
  leftOf: number,
  sameHouse: number,
  nextTo: number,
};

type ConfigProps = {
  size: number,
  extraClues: number,
  ensuredClues: EnsuredCluesProps,
  clueWeights: ClueWeightsProps,
};

function configToBody({
  ensuredClues,
  clueWeights,
  ...configuration
}: ConfigProps) {
  const config = {
    size: 4,
    extraClues: 1,
    ensuredClues: {inHouse: 1, leftOf: 1, sameHouse: 1, ...ensuredClues},
    clueWeights: {
      inHouse: 1,
      leftOf: 1,
      sameHouse: 1,
      nextTo: 1,
      ...clueWeights,
    },
  };

  return t
    .writer()
    .write([
      t.list([
        t.map([
          t.keyword('puzzle/puzzle'),
          [t.keyword('puzzle/clues'), t.keyword('puzzle/solution')],
        ]),
        t.map([
          t.keyword('size'),
          config.size,
          t.keyword('clue-weights'),
          t.map([
            t.keyword('in-house'),
            config.clueWeights.inHouse,
            t.keyword('left-of'),
            config.clueWeights.leftOf,
            t.keyword('next-to'),
            config.clueWeights.nextTo,
            t.keyword('same-house'),
            config.clueWeights.sameHouse,
          ]),
          t.keyword('extra-clues'),
          config.extraClues,
          t.keyword('ensured-clues'),
          t.map([
            t.keyword('in-house'),
            config.ensuredClues.inHouse,
            t.keyword('left-of'),
            config.ensuredClues.leftOf,
            t.keyword('same-house'),
            config.ensuredClues.sameHouse,
          ]),
        ]),
      ]),
    ]);
}

export default class Puzzle {
  static fetch(config: any) {
    return fetch('https://zebra.joshuadavey.com/api', {
      method: 'POST',
      headers: {'Content-Type': 'application/transit+json'},
      body: configToBody(config),
    })
      .then(response => response.text())
      .then(parse);
  }
}
