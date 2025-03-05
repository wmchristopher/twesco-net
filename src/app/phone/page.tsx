'use client'

import * as Tone from 'tone'
import { useState, useEffect } from 'react'


function Key({keyChar}: { keyChar: string }) {
    return (
        <button key={keyChar} className='m-2 px-3 py-2 rounded bg-tyre text-parchment' style={{gridColumn: "span 2"}}>
            {keyChar}
        </button>
    )
}

function Qwerty() {
    const numRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=']
    const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']']
    const midRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"]
    const btmRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']

    return (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(25, max-content)'}}>
            {[numRow, topRow, midRow, btmRow].map((row, i) => (
                <div key={i} style={{display: "grid", gridTemplateColumns: "subgrid", gridColumn: `${i + 1} / -1`}}>
                    {row.map((s) => (<Key keyChar={s} />))}
                </div>
            ))}
        </div>
    )
}


export default function Phone() {
    const [synth, setSynth] = useState<Tone.Synth | null>(null)

    const initializeTone = async () => {
        await Tone.start()
        console.log('Audio is ready')
        const newSynth = new Tone.Synth().toDestination()
        setSynth(newSynth)
    }

    const play12Tet = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const keyMap: {[id: string] : string} = {
            'a': 'C4',
            'w': 'C#4',
            's': 'D4',
            'e': 'D#4',
            'd': 'E4',
            'f': 'F4',
            't': 'F#4',
            'g': 'G4',
            'y': 'G#4',
            'h': 'A4',
            'u': 'A#4',
            'j': 'B4',
            'k': 'C5',
            'o': 'C#5',
            'l': 'D5',
            'p': 'D#5',
            ';': 'E5',
            "'": 'F5'
        }
        if (synth === null) return;
        if (e.key in keyMap) {
            synth.triggerAttackRelease(keyMap[e.key], "16n")
        } 
    }

    const PITCH_C = 440

    function adjustByEdoStep(freq: number, edo: number, step: number) {
        return freq * (2 ** (step / edo))
    }

    const pajara = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const PITCH_C = 220 * 2 ** (1 / 4)
        const keyMap: {[id: string] : number} = {
            'a': 0,
            'w': 2,
            'e': 5,
            'd': 7,
            'f': 9,
            't': 11,
            'g': 13,
            'h': 16,
            'u': 18,
            'j': 20,
            'k': 22,
            'o': 24,
            'p': 27,
            ';': 29,
            "'": 31
        }
        if (synth === null) return;
        if (e.key in keyMap) {
            synth.triggerAttackRelease(adjustByEdoStep(PITCH_C, 22, keyMap[e.key]), "16n")
        } 
    }

    return (
        <>
            <main>
                <article className="m-4">
                    <h1>Twescophone</h1>
                    <p>Test text</p>
                    <button onClick={initializeTone} onKeyDown={play12Tet}>12-TET</button>
                    <br />
                    <button onClick={initializeTone} onKeyDown={pajara}>Pajara</button>
                    <Qwerty />
                </article>
            </main>
        </>
    )
}