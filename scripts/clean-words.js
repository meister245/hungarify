const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "..", "hungarify", "words.json");

const filteredWords = [
  "meg",
  "am",
  "ot",
  "tag",
  "tort",
  "bol",
  "bort",
  "ego",
  "elo",
  "teruleten",
  "teruletet",
];

const cleanWordList = () => {
  const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
  const wordMapping = JSON.parse(fileContent);

  const wordListKeys = Object.keys(wordMapping);

  filteredWords.forEach((item) => {
    if (wordListKeys.includes(item)) {
      delete wordMapping[item];
    }
  });

  if (wordListKeys.length !== Object.keys(wordMapping).length) {
    const orderedMapping = Object.keys(wordMapping)
      .sort()
      .reduce((obj, key) => {
        obj[key] = wordMapping[key];
        return obj;
      }, {});

    fs.writeFileSync(filePath, JSON.stringify(orderedMapping, null, 2), {
      encoding: "utf-8",
      flag: "w",
    });
  }
};

cleanWordList();
