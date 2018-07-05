//@flow

import React from "react";
import emojisForRow from "../domain";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { reader, keyword } from "transit-js";
import { List } from "immutable";
import type {Map, Set} from 'immutable';

const times = n => [...Array(n)].map((_, i) => i);

type Props = {
  width: number,
  height: number,
  options: Map<List<number>, Set<number>>,
  onClickOption: (number,number,number)=> any
}

export default class Grid extends React.Component<Props, {frameWidth: number}> {
  constructor(props: Props) {
    super(props);
    this.state = { frameWidth: 0 };
  }

  onLayout = ({ nativeEvent: { layout: { width, height } } }: {nativeEvent: {layout: {width: number, height: number}}}) => {
    this.setState({ frameWidth: width });
  };

  onEmojiPress = (row: number, col: number, i: number) => () => {
    this.props.onClickOption(row, col, i);
  };

  isOptionAvailable = (row: number, col: number) => ({ i }: {i: number}) =>
    this.props.options.get(List([row, col])).includes(i);

  render() {
    const { frameWidth } = this.state;
    const { width, height, options } = this.props;
    const fontSize = 32;
    return (
      <View
        style={[styles.grid, { height: frameWidth }]}
        onLayout={this.onLayout}
      >
        {}
        {times(height).map(row =>
          times(width).map(col => (
            <View
              style={[
                styles.cell,
                {
                  backgroundColor: ["#9ccc65", "#ffa726", "#fdd835", "#29b6f6"][
                    row
                  ],
                  flexBasis: `${1 / width * 100}%`
                }
              ]}
              key={`cell-${row}-${col}`}
            >
              {emojisForRow(row)
                .slice(0, width)
                .filter(this.isOptionAvailable(row, col))
                .map(({ i, char }) => (
                  <TouchableOpacity
                    style={styles.emojiButon}
                    key={`emoji-${i}`}
                    onPress={this.onEmojiPress(row, col, i)}
                  >
                    <Text style={{ fontSize }}>{char}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          ))
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  grid: {
    alignContent: "stretch",
    borderColor: "#ddd",
    borderLeftWidth: 6,
    borderStyle: "solid",
    borderTopWidth: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  cell: {
    alignContent: "stretch",
    borderBottomWidth: 6,
    borderColor: "#ddd",
    borderRightWidth: 6,
    borderStyle: "solid",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  emojiButon: {
    alignItems: "center",
    flex: 1,
    flexBasis: "50%",
    justifyContent: "center"
  }
});
