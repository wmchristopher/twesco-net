'use client'

import * as Tone from 'tone'
import { getKeyFromCode } from './key';

// Sets a baseline pitch based on C in 12-TET.
const pitchC = 220 * 2 ** (1 / 4);

function adjustByEdoStep(freq: number, edo: number, step: number) {
    /**
     * Adjust frequency by some number of steps in an EDO (equal division of the octave).
     * 
     * @param freq      Baseline frequency to adjust.
     * @param edo       How many equal steps into which to divide the octave.
     * @param step      How many steps up (positive) or down (negative) to go.
     */
    return freq * (2 ** (step / edo));
}

export interface KeyData {
    /**
     * Scale-specific key data.  Does not include whether key is active because that does not inhere in the scale.
     * 
     * @param code      The key code (e.g. 'KeyQ')
     * @param color     Sets color.  Used to distinguish scale degrees from accidentals.
     * @param n         Nth degree of EDO.  Root is zero.  Null for inequal scales.
     * @param edo       How many Equal Divisions of the Octave.  Null for inequal scales.
     */
    code: string,
    color: string,
    n: number | null,
    edo: number | null
}

export default class Scale {
    /**
     * Defines a scale.
     * 
     * @param name      Name of scale.
     * @param qwerty    JSON for keyboard layout
     * @param edo       How many EDO
     */
    constructor(
        public name: string,
        public qwerty: {[key: string]: {[key: string]: number}},
        public edo: number,
        public info: string
    ) {}

    #locateKey(code: string | undefined): string | undefined {
        /**
         * Gets location of a key within `qwerty`.  (In current implementation this means color string.)
         * 
         * @param code   Key code (e.g. 'KeyQ')
         */
        block: 
        if (code !== undefined) {
            const keyChar = getKeyFromCode(code)
            if (keyChar == null) {break block;}

            for (const [color, items] of Object.entries(this.qwerty)) {
                // Iterates through all key colors in scale to see whether this key is included.
                if (items[keyChar] !== undefined) {
                    return color;
                }
            }
        }
        return undefined;
    }

    getKey(code: string | undefined): KeyData {
        /**
         * Gets scale-specific data for a key.
         * 
         * @param code   Key code (e.g. 'KeyQ')
         */
        const color = this.#locateKey(code);

        block:
        if (code !== undefined && color !== undefined) {
            const keyChar = getKeyFromCode(code)
            if (keyChar == null) break block;

            const n = this.qwerty[color][keyChar];
            return {code, color, n, edo: this.edo}
        }
        // If key is undefined or not included in scale, return this shell value.
        return {code: code ?? '', color: 'none', n: null, edo: null}
    }

    updateKey(code: string, n: number | null) {
        /**
         * Updates key tuning value.
         * 
         * @param code   Key code (e.g. 'KeyQ')
         */
        const color = this.#locateKey(code);
        const key = getKeyFromCode(code)
        if (color == null || key == null) return this;
        this.qwerty[color][key] = n;
        return this;
    }

    play(synth: Tone.PolySynth | null, code: string, type: string) {
        /**
         * Handles synth events.
         * 
         * @param synth     Synth object to play
         * @param code      Key code (e.g. 'KeyQ')
         * @param type      e.g. attack, release
         */

        // validate input
        if (synth == null || this.getKey(code) == null || this.getKey(code).color === 'none') {return;}

        // get pitch to play
        const pitch = adjustByEdoStep(pitchC, this.edo, this.getKey(code).n ?? 0);

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