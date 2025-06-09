'use client'

import * as Tone from 'tone';
import { getKeyFromCode } from './key';
import { gcd } from '../utils';

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
    char: string,
    n: number | undefined;
    color: string | undefined;
}

export interface ScaleInfo {
    name: string,
    info: string
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
    #colors: Map<string, string>;
    #numL: number;
    #numS: number;

    constructor(
        public name: string,
        public numL: number,
        public numS: number,
        public ratio: [number, number],
        mode?: number
    ) {
        this.#numL = numL;
        this.#numS = numS;
        this.#edo = numL * ratio[0] + numS * ratio[1];
        this.#mode = mode ?? 0;
        this.mode = this.#mode;
        this.#colors = new Map();

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

        const rotate = (s: Array<any>, i: number) => s.slice(i).concat(s.slice(0, i))

        const rotations = this.#scale.map(
            (_, i) => rotate(this.#scale, i)
        ).sort(
            (a, b) => a.join('').localeCompare(b.join(''), 'en')
        );

        this.#scale = rotations[this.#mode]

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
            for (const step of this.#scale) {
                if (++idx >= midRow.length) break;
                const stepSize = step === 'L' ? ratioL : ratioS
                
                this.#keys.set(midRow[idx], ++edoN);
                this.#colors.set(midRow[idx], edoN % this.#edo ? 'mallow' : 'stereum');
                switch (stepSize) {
                    case 4:
                        this.#keys.set(numRow[idx], ++edoN);
                        this.#colors.set(numRow[idx], 'robin');
                    case 3:
                        ++edoN;
                        if (idx < btmRow.length)
                            this.#keys.set(btmRow[idx], edoN);
                            this.#colors.set(btmRow[idx], 'robin');
                    case 2:
                        if (step === 's' && ratio.toString() === '3,2') {
                            ++edoN;
                            if (idx < btmRow.length) {
                                this.#keys.set(btmRow[idx], edoN);
                                this.#colors.set(btmRow[idx], 'robin')
                            }
                        } else {
                            this.#keys.set(topRow[idx], ++edoN);
                            this.#colors.set(topRow[idx], 'clover');
                        }
                }
            }
    }

    clone() {
        const clone = new Scale(this.name, this.numL, this.numS, this.ratio, this.mode);
        for (const [key, n] of this.#keys) clone.setKeyPitch(key, n);
        for (const [key, color] of this.#colors) clone.setKeyColor(key, color);
        return clone;
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
        const numLS = this.#numL + this.#numS;
        n += numLS;
        this.#mode = n % (numLS / gcd([this.#numL, this.#numS]));
    }

    setKeyPitch(key: string, n: number) {
        this.#keys.set(key, n);
    }

    disableKey(key: string) {
        this.#keys.delete(key);
        this.#colors.delete(key);
    }

    setKeyColor(key: string, color: string) {
        this.#colors.set(key, color);
    }

    getKey(key: string): KeyData {
        return {
            char: key,
            n: this.#keys.get(key),
            color: this.#colors.get(key)
        }
    }

    getPitch(code: string) {
        const key = getKeyFromCode(code)
        const edoN = this.#keys.get(key ?? '')
        if (edoN != null) return adjustByEdoStep(pitchC, this.edo, edoN);
        return null
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

        const pitch = this.getPitch(code)

        if (pitch != null) {
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