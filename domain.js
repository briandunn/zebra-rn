import emoji from "./emoji";

const domain = [
  [
    "tenant",
    [
      "goblin",
      "santa",
      "alien",
      "nerd",
      "detective",
      "older_woman",
      "sunglasses"
    ]
  ],
  ["pet", ["pig", "fish", "snake", "horse", "monkey_face", "cat", "dog"]],
  [
    "food",
    [
      "pizza",
      "meat_on_bone",
      "icecream",
      "apple",
      "lemon",
      "hamburger",
      "birthday"
    ]
  ],
  [
    "hobby",
    [
      "art",
      "football",
      "performing_arts",
      "musical_note",
      "video_game",
      "soccer",
      "baseball"
    ]
  ],
  [
    "vehicle",
    [
      "taxi",
      "minibus",
      "bike",
      "steam_locomotive",
      "red_car",
      "rocket",
      "rowboat"
    ]
  ],
  [
    "clothes",
    ["tshirt", "mans_shoe", "bikini", "tophat", "briefcase", "dress", "boot"]
  ],
  [
    "symbol",
    [
      "yin_yan",
      "star_of_david",
      "latin_cross",
      "star_and_crescent",
      "wheel_of_dharma",
      "atom",
      "om"
    ]
  ]
];

export default function emojisForRow(row) {
  return domain[row][1].map((name, i) => ({
    i,
    char: String.fromCodePoint(emoji[name])
  }));
}
