import Options from "./options";
import type Opts from "./options";
import { List, Map, Set } from "immutable";

describe("removeVal", () => {
  function toString(options: Opts) {
    return (
      Options.rows(options)
        .map(row =>
          row
            .map(({ emojis }) =>
              emojis
                .toList()
                .setSize(row.count())
                .map(({ char } = { char: "  " }) => char)
                .join(" ")
            )
            .toJS()
            .join("\t\t")
        )
        .toJS()
        .join("\n\n") + "\n\n"
    );
  }
  it("recursively eliminates", () => {
    let options = Options.init(3, 3, []);
    console.log(toString(options));
    options = Options.removeVal(options, 0, 0, 0);
    console.log(toString(options));
    options = Options.removeVal(options, 0, 1, 0);
    console.log(toString(options));
    options = Options.removeVal(options, 0, 1, 1);
    console.log(toString(options));
    expect(options.get(List([0, 2]))).toEqual(Set([0]));
  });
});
