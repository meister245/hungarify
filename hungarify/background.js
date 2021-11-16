const editorImmutableDomains = ["facebook.com"];

const selectionErrorMsg = {
  "en-US":
    "Your browser does not support reading text from the selection area.",
  "hu-HU":
    "A böngésződ nem támogatja a kijelölt helyről való szöveg beolvasását.",
};

const manualPasteMsg = {
  "en-US":
    "This website blocks this extension from making changes here. The hungarified text has been placed on the clipboard, so you can manually paste it here.",
  "hu-HU":
    "Ez a weboldal nem engedi a bővítménynek, hogy változtatásokat csináljon itt. A magyarosított szöveg a vágólapra lett másolva, így kézileg beillesztheted ide.",
};

const retrieveDOMSelection = (tabId, callback) =>
  chrome.tabs.executeScript(
    tabId,
    {
      code: "window.getSelection().toString()",
    },
    callback
  );

const replaceDOMSelection = (tabId, processedText) => {
  const browserLanguage = navigator.language;

  const pasteMsg = Object.keys(manualPasteMsg).includes(browserLanguage)
    ? manualPasteMsg[browserLanguage]
    : manualPasteMsg["en-US"];

  let isFieldImmutable = false;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const windowUrl = tabs[0].url;

    editorImmutableDomains.forEach((item) => {
      isFieldImmutable = isFieldImmutable || windowUrl.includes(item);
    });

    const replaceText = isFieldImmutable
      ? pasteMsg
      : processedText.replace(/\n/g, "\\n");

    chrome.tabs.executeScript(
      tabId,
      {
        code: `(${overrideSelectionText.toString()})("${replaceText}")`,
      },
      () => {
        isFieldImmutable && writeToClipBoard(tabId, processedText);
      }
    );
  });
};

const overrideSelectionText = (processedText) => {
  const el = document.activeElement;
  const selection = window.getSelection();

  const recursiveReplaceDivText = (elem, pattern, replaceText) => {
    if (elem.children.length === 0) {
      elem.textContent = elem.textContent.replace(pattern, replaceText);
    } else {
      [...elem.children].forEach((childElem) => {
        recursiveReplaceDivText(childElem, pattern, replaceText);
      });
    }
  };

  if (selection && selection.rangeCount) {
    const selectionText = selection.toString();

    if (el.nodeName === "TEXT") {
      el.textContent = processedText;
    } else if (el.nodeName === "TEXTAREA" || el.nodeName === "INPUT") {
      const regex = new RegExp(selectionText, "g");
      el.value = el.value.replace(regex, processedText);
    } else if (el.nodeName === "DIV") {
      const originalSelectionList = selectionText.split("\n");
      const replacedSelectionList = processedText.split("\n");

      originalSelectionList.forEach((item, idx) => {
        const replaceText = replacedSelectionList[idx];
        recursiveReplaceDivText(el, new RegExp(item, "g"), replaceText);
      });
    }
  }
};

const sendSelectionErrorMessage = (tabId) => {
  const browserLanguage = navigator.language;

  const errorMsg = Object.keys(selectionErrorMsg).includes(browserLanguage)
    ? selectionErrorMsg[browserLanguage]
    : selectionErrorMsg["en-US"];

  chrome.tabs.executeScript(tabId, {
    code: `alert("${errorMsg}")`,
  });
};

const writeToClipBoard = (tabId, selectionText) =>
  chrome.tabs.executeScript(tabId, {
    code: `navigator.clipboard.writeText("${selectionText}")`,
  });

const processSelection = (selectionText, wordMapping) => {
  const selectionRegex = /[a-zA-ZáÁéÉíÍóÓöÖőŐúÚüÜűŰ]+/gm;
  const matches = new Set(selectionText.match(selectionRegex));

  if (matches) {
    const wordMappingKeys = Object.keys(wordMapping);

    [...matches].forEach((matchString) => {
      const matchStringLowerCase = matchString.toLowerCase();

      let replaceString = "";

      if (wordMappingKeys.includes(matchStringLowerCase)) {
        replaceString = wordMapping[matchStringLowerCase];
      }

      if (replaceString.length > 0) {
        if (matchString !== matchStringLowerCase) {
          [...matchString].forEach((letter, idx) => {
            if (letter !== letter.toLowerCase()) {
              replaceString =
                replaceString.substr(0, idx) +
                replaceString[idx].toUpperCase() +
                replaceString.substr(idx + 1, replaceString.length);
            }
          });
        }

        selectionText = selectionText.replace(matchString, replaceString);
      }
    });
  }

  return selectionText;
};

const wordFileURL = chrome.runtime.getURL("words.json");

const hungarify = (info, tab) =>
  retrieveDOMSelection(tab.id, (response) => {
    const selectionText = response[0];

    if (selectionText === "") {
      sendSelectionErrorMessage(tab.id);
      throw new Error("browser support issue with selection");
    }

    const multiLineSelection = selectionText.split("\n");

    fetch(wordFileURL)
      .then((resp) => resp.json())
      .then((wordList) =>
        multiLineSelection.map((item) => processSelection(item, wordList))
      )
      .then((multiLineResult) =>
        replaceDOMSelection(tab.id, multiLineResult.join("\n"))
      )
      .catch((error) => console.log(error));
  });

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "hungarify",
    title: "Hungarify",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(hungarify);
