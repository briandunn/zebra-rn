import React from "react";
import emoji from "../emoji";
import emojisForRow from "../domain";
import { Text, StyleSheet, View } from "react-native";
import { Map } from "immutable";

const typeToComponent = Map({
  ["next-to"]: NextTo,
  ["left-of"]: LeftOf,
  ["same-house"]: SameHouse
});

function backgroundColor(row) {
  return { backgroundColor: ["#9ccc65", "#ffa726", "#fdd835", "#29b6f6"][row] };
}

function Adjacent({ args: [[leftRow, leftI], [rightRow, rightI]], indicator }) {
  return (
    <View style={styles.adjacent}>
      <Emoji row={leftRow} i={leftI} />
      <Text>{String.fromCodePoint(emoji[indicator])}</Text>
      <Emoji row={rightRow} i={rightI} />
    </View>
  );
}

function NextTo({ args }) {
  return <Adjacent {...{ args }} indicator="left_right_arrow" />;
}

function LeftOf({ args }) {
  return <Adjacent {...{ args }} indicator="arrow_right" />;
}

const Emoji = ({ row, i }) => (
  <Text style={backgroundColor(row)}>{emojisForRow(row)[i].char}</Text>
);

function SameHouse({ args }) {
  return (
    <View style={styles.sameHouse}>
      {args.map(([row, i]) => <Emoji key={[row, i]} {...{ row, i }} />)}
    </View>
  );
}

export default function Clue({ args, type }) {
  const Component = typeToComponent.get(type);
  return <Component args={args} />;
}

const border = {
  borderColor: "#ddd",
  borderWidth: 6,
  borderStyle: "solid"
};

const styles = StyleSheet.create({
  inHouse: {
    ...border
  },
  adjacent: {
    ...border,
    flexDirection: "row"
  },
  sameHouse: {
    ...border
  }
});
