'use client'

import * as Tone from 'tone'

const PITCH_C = 220 * 2 ** (1 / 4)

function adjustByEdoStep(freq: number, edo: number, step: number) {
    return freq * (2 ** (step / edo))
}

export function makeScale(synth: Tone.Synth | null, scale: object) {
    if (synth === null) return () => null
    return (e: React.KeyboardEvent) => (e.key in scale.qwerty) ? 
    synth.triggerAttackRelease(adjustByEdoStep(PITCH_C, scale.edo, scale.qwerty[e.key]), "16n")
    : null
}
