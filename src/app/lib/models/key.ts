// Used to convert between key codes and chars.
const keyArray: readonly [string, string][] = [
    ['KeyA', 'a'],
    ['KeyB', 'b'],
    ['KeyC', 'c'],
    ['KeyD', 'd'],
    ['KeyE', 'e'],
    ['KeyF', 'f'],
    ['KeyG', 'g'],
    ['KeyH', 'h'],
    ['KeyI', 'i'],
    ['KeyJ', 'j'],
    ['KeyK', 'k'],
    ['KeyL', 'l'],
    ['KeyM', 'm'],
    ['KeyN', 'n'],
    ['KeyO', 'o'],
    ['KeyP', 'p'],
    ['KeyQ', 'q'],
    ['KeyR', 'r'],
    ['KeyS', 's'],
    ['KeyT', 't'],
    ['KeyU', 'u'],
    ['KeyV', 'v'],
    ['KeyW', 'w'],
    ['KeyX', 'x'],
    ['KeyY', 'y'],
    ['KeyZ', 'z'],
    ['Digit1', '1'],
    ['Digit2', '2'],
    ['Digit3', '3'],
    ['Digit4', '4'],
    ['Digit5', '5'],
    ['Digit6', '6'],
    ['Digit7', '7'],
    ['Digit8', '8'],
    ['Digit9', '9'],
    ['Digit0', '0'],
    ['Semicolon', ';'],
    ['Quote', "'"],
    ['BracketLeft', '['],
    ['BracketRight', ']'],
    ['Comma', ','],
    ['Period', '.'],
    ['Slash', '/'],
    ['Minus', '-'],
    ['Equal', '=']
  ];

// Define maps and functions to convert between codes and chars.
const codeToKey = new Map(keyArray);
const keyToCode = new Map(keyArray.map(([key, code]) => [code, key]));

export const getKeyFromCode = (code: string) => codeToKey.get(code);
export const getCodeFromKey = (key: string) => keyToCode.get(key);
