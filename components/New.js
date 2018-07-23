import Puzzle, { type ConfigProps } from "../puzzle";
import React from "react";
import { Button, Slider, View, Text } from "react-native";

export default class NewPuzzle extends React.Component<
  { onNewPuzzle: Puzzle => any } & ConfigProps,
  *
> {
  constructor({ size, skill }: ConfigProps) {
    super();
    this.state = { size, skill };
  }

  static defaultProps = { size: 4, skill: "normal" };

  onPress = () => {
    Puzzle.fetch(this.state).then(puzzle => {
      this.props.onNewPuzzle(puzzle);
    });
  };

  onChange = field => value => {
    this.setState({
      [field]:
        field === "skill" ? ["beginner", "normal", "expert"][value] : value
    });
  };
  render() {
    return (
      <View>
        <Text>New Puzzle</Text>
        <Slider
          step={1}
          minimumValue={3}
          maximumValue={7}
          value={this.state.size}
          onValueChange={this.onChange("size")}
        />
        <Text>{this.state.size}</Text>
        <Slider
          step={1}
          minimumValue={0}
          maximumValue={2}
          value={["beginner", "normal", "expert"].indexOf(this.state.skill)}
          onValueChange={this.onChange("skill")}
        />
        <Text>{this.state.skill}</Text>
        <Button title="go" onPress={this.onPress} />
      </View>
    );
  }
}
