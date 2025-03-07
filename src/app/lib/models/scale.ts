'use client'

import * as Tone from 'tone'

const pitchC = 220 * 2 ** (1 / 4);

function adjustByEdoStep(freq: number, edo: number, step: number) {
    return freq * (2 ** (step / edo));
}

export default class Scale {
    constructor(
        public name: string,
        public qwerty: {[key: string]: number},
        public edo: number
    ) {}

    makeScale(synth: Tone.Synth | null) {
        if (synth === null) {return () => null;}

        return (e: React.KeyboardEvent) => (e.key in this.qwerty)
            ? synth.triggerAttackRelease(adjustByEdoStep(pitchC, this.edo, this.qwerty[e.key]), "16n")
            : null;
    }
}
