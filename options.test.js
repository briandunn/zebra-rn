import Options from "./options";
import type Opts from "./options";
import { List, Map } from "immutable";

describe("removeVal", () => {
  function toString(options: Opts) {
    console.log(
      Options.rows(options)
        .map(row =>
          row
            .map(({ emojis }) =>
              emojis
                .toList()
                .setSize(row.count())
                .map(({ char } = {}) => char)
                .join(" ")
            )
            .toJS()
            .join("\t\t")
        )
        .toJS()
        .join("\n\n")
    ) + "\n\n";
  }
  it("recursively eliminates", () => {
    const inHouse = List([Map({ args: [[0, 0], 0] })]);
    const options = Options.init(4, 4, inHouse);
    toString(options);
  });
});
