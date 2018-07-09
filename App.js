//@flow

import Grid from './components/Grid';
import Clue from './components/Clue';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {List, Map, Set} from 'immutable';
import Options from './options';
import Puzzle from './puzzle';

type State = {
  solution: Map<List<number>, Set<number>>,
  options: Map<List<number>, Set<number>>,
  grid: {width: number, height: number},
  clues: List<Map<string, string>>,
  won: boolean,
};

export default class App extends React.Component<{}, State> {
  constructor() {
    super();
    this.state = {
      clues: List([]),
      grid: {width: 0, height: 0},
      options: Map([]),
      solution: Map([]),
      won: false,
    };
  }
  componentDidMount() {
    Puzzle.fetch({}).then(({width, height, inHouse, clues, solution}) => {
      this.setState({
        clues,
        grid: {width, height},
        options: Options.init(height, width, inHouse),
        solution,
      });
    });
  }

  onClickOption = (row: number, col: number, val: number) => {
    this.setState(({solution, options, ...state}) => {
      const updatedOptions = Options.removeVal(options, row, col, val);

      return {
        ...state,
        solution,
        won: solution.equals(updatedOptions),
        options: updatedOptions,
      };
    });
  };

  render() {
    const {
      clues,
      grid: {width, height},
      options,
    } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {clues.map((clue, i) => (
            <Clue args={clue.get('args')} type={clue.get('type')} key={i} />
          ))}
        </View>
        <Grid
          {...{width, height, options, onClickOption: this.onClickOption}}
        />
      </View>
    );
  }
}

const border = borderColor => ({
  borderColor,
  borderWidth: 1,
  borderStyle: 'solid',
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20},
});
