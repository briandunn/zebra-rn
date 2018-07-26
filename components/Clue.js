import React from "react";
import emoji from "../emoji";
import emojisForRow from "../domain";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Map } from "immutable";

const typeToComponent = Map({
  ["next-to"]: NextTo,
  ["left-of"]: LeftOf,
  ["same-house"]: SameHouse
});

function backgroundColor(row) {
  return { backgroundColor: ["#9ccc65", "#ffa726", "#fdd835", "#29b6f6"][row] };
}

function Adjacent({
  args: [[leftRow, leftI], [rightRow, rightI]],
  indicator,
  style
}) {
  return (
    <View style={[styles.adjacent, style]}>
      <Emoji row={leftRow} i={leftI} />
      <Text>{String.fromCodePoint(emoji[indicator])}</Text>
      <Emoji row={rightRow} i={rightI} />
    </View>
  );
}

function NextTo(props) {
  return <Adjacent {...props} indicator="left_right_arrow" />;
}

function LeftOf(props) {
  return <Adjacent {...props} indicator="arrow_right" />;
}

const Emoji = ({ row, i }) => (
  <Text style={backgroundColor(row)}>{emojisForRow(row)[i].char}</Text>
);

function SameHouse({ args, style }) {
  return (
    <View style={[styles.sameHouse, style]}>
      {args.map(([row, i]) => <Emoji key={[row, i]} {...{ row, i }} />)}
    </View>
  );
}

export default function Clue({ args, type, onPress, applied }) {
  const Component = typeToComponent.get(type);
  return (
    <TouchableOpacity {...{ onPress }}>
      <Component args={args} style={{ opacity: applied ? 0.4 : 1 }} />
    </TouchableOpacity>
  );
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
