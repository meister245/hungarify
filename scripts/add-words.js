const fs = require("fs");
const path = require("path");

const accentMapping = {
  a: ["á"],
  e: ["é"],
  i: ["í"],
  o: ["ó", "ö", "ő"],
  u: ["ú", "ü", "ű"],
};

const filePath = path.resolve(__dirname, "..", "hungarify", "words.json");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const transformWord = (word) => {
  let transformedWord = word.toLowerCase();

  const letters = [...transformedWord].map((item) => {
    for (const [key, value] of Object.entries(accentMapping)) {
      if (value.includes(item)) {
        return key;
      }
    }

    return item;
  });

  return letters.join("");
};

const registerWords = (data) => {
  const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
  const wordMapping = JSON.parse(fileContent);

  for (let [key, value] of Object.entries(data)) {
    wordMapping[value] = key;
  }

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
};

readline.question("Enter new word(s) separated by space:\n> ", (textInput) => {
  const register = {};

  const regex = /[^a-záéíóöőúüű]+/gm;
  const words = textInput.toLowerCase().replace(regex, " ");

  words.split(" ").forEach((word) => {
    if (word.length < 2) {
      return;
    }

    const transformedWord = transformWord(word);

    if (word === transformedWord) {
      return;
    }

    register[word] = transformedWord;
  });

  registerWords(register);

  readline.close();
});
