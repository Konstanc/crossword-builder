# crossword-builder
A simple tool for creating crosswords.

This will build a valid crossword of a given structure out of a given words list.

All continuous runs of cell of 2 and more are considered as valid words.

## Usage

```
node .\dist\crossword-builder.js -f field.txt -w words.txt
```
This will produce either a filled crossword field or an error message if it's impossible to build a crossword for the given field out of the given dictionary.

### Options:
`-f <field_file>` default 'field.txt', a file representing crossword field. Unused cell should be marked as '*'.
Examples:
```
___
___
___
```
```
***___
__*___
______
______
***_*_
```
More examples can be found in `./fields`.

`-w <words_list_file>` default 'words.txt', a file containing the dictionary.
`-v` verbose output with performance data.
`-nr` do not randomize words (gives stable results).

## Build
Run
```
tsc
```
this will build crossword-builder into './dist' folder