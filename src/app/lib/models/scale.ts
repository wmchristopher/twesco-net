'use client'

import * as Tone from 'tone';
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

export default class Scale {
    /**
     * Defines a scale.
     * 
     * @param name      Name of scale.
     * @param numL      How many long steps
     * @param numS      How many short steps
     * @param ratio     L : s
     */
    #edo: number;
    #scale: string[];
    #keys: Map<string, number>;
    #mode: number;

    constructor(
        public name: string,
        public numL: number,
        public numS: number,
        public ratio: [number, number],
        mode?: number
    ) {
        const numLS = numL + numS;
        this.#edo = numL * ratio[0] + numS * ratio[1];
        this.#mode = (((mode ?? 0) % numLS) + numLS) % numLS;

        // Generate scale pattern.
        this.#scale = []
        const total = numL + numS;
        for (let i = 0; i < total; i++) {
            if ((i * numS) % total < numS) {
                this.#scale.push('s')
            } else {
                this.#scale.push('L')
            }
        }

        this.#scale = this.#scale.slice(this.#mode).concat(this.#scale.slice(0, this.#mode));

        this.#keys = new Map();

        const numRow = ['2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
        const topRow = ['w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];
        const midRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
        const btmRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

        // both of these will pre-increment to 0
        let edoN = -1;
        let idx = -1;

        const [ratioL, ratioS] = ratio

        while (idx < midRow.length)
            for (let step of this.#scale) {
                if (++idx >= midRow.length) break;
                const stepSize = step === 'L' ? ratioL : ratioS
                
                this.#keys.set(midRow[idx], ++edoN);
                switch (stepSize) {
                    case 4:
                        this.#keys.set(numRow[idx], ++edoN)
                    case 3:
                        ++edoN;
                        if (idx < btmRow.length)
                            this.#keys.set(btmRow[idx], edoN);
                    case 2:
                        if (step === 's' && ratio.toString() === '3,2') {
                            ++edoN;
                            if (idx < btmRow.length)
                                this.#keys.set(btmRow[idx], edoN);
                        } else
                            this.keys.set(topRow[idx], ++edoN);
                }
            }
    }

    get edo() {
        return this.#edo;
    }
    get keys() {
        return this.#keys;
    }

    get mode() {
        return this.#mode;
    }
    set mode(n) {
        this.#mode = n % this.#edo;
    }

    play(synth: Tone.PolySynth | null, code: string, type: string) {
        /**
         * Handles synth events.
         * 
         * @param synth     Synth object to play
         * @param code       Key pressed (e.g. 'KeyQ')
         * @param type      e.g. attack, release
         */

        // validate input
        if (synth == null) return;

        const key = getKeyFromCode(code)

        const edoN = this.#keys.get(key ?? '')

        if (edoN != null) {
            // get pitch to play
            const pitch = adjustByEdoStep(pitchC, this.edo, edoN);

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
}