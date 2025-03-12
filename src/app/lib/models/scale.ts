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

    play(synth: Tone.PolySynth | null, e: React.KeyboardEvent, type: string) {
        if (synth == null || this.getKey(e.key) == null || this.getKey(e.key).color === 'none') {return;}

        const pitch = adjustByEdoStep(pitchC, this.edo, this.getKey(e.key).n);

        switch (type) {
            case 'attack':
                synth.triggerAttack(pitch);
                return;
            case 'release':
                synth.triggerRelease(pitch);
                return;
        }
    }
}