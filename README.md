# hungarify

A browser extension to support hungarian developers, so they don't have to switch between keyboard layouts, in order to properly write hungarian sentences.

The extension aims to change words (without accents) to grammatically correct hungarian words with accents.

## Contributing

#### Adding words

You can contribute new words to the project by running the below script.

Simply copy-paste hungarian text with accents into the prompt, the script will automatically remove any duplicates and extend the word list.

```
npm run-script addwords
```

#### Cleaning words

Some words can have different meanings depending on the accent. (e.g. sör - sor)

These words are not handled well by the extension and should be excluded from the wordlist in `scripts/clean-words.js`

## Known Issues

#### Immutable state

Some websites may have editable content, that use input fields with immutable state. (particularly Facebook)

Any changes made to the editable content will are reverted to the last editor state, as soon as the next input is received, after replacement.

There is no workaround for this at the moment, however the replaced text is copied to the clipboard, so it can be manually pasted to the input field.
