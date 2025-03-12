'use client'

import * as Tone from 'tone'

const pitchC = 220 * 2 ** (1 / 4);

function adjustByEdoStep(freq: number, edo: number, step: number) {
    return freq * (2 ** (step / edo));
}

export interface KeyData {
    char: string,
    color: string,
    n: number
}

export default class Scale {
    constructor(
        public name: string,
        public qwerty: {[key: string]: {[key: string]: number}},
        public edo: number
    ) {}

    getKey(char: string) {
        for (const [color, items] of Object.entries(this.qwerty)) {
            if (items[char] !== undefined) {
                return {char, color, n: items[char]}
            }
        }
        return {char, color: 'none', n: 0}
    }

    makePlayer(synth: Tone.Synth | null) {
        if (synth === null) {return () => null;}

        return (e: React.KeyboardEvent) => (this.getKey(e.key) !== undefined && this.getKey(e.key).color !== 'none')
            ? synth.triggerAttackRelease(adjustByEdoStep(pitchC, this.edo, this.getKey(e.key).n), "16n")
            : null;
    }
}