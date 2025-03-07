"use client"

import * as Tone from 'tone'
import { ChangeEvent, useEffect, useState } from 'react'
import { makeScale } from '@/app/lib/models/scale'


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
                    {row.map((s) => (<Key key={s} keyChar={s} />))}
                </div>
            ))}
        </div>
    )
}


export default function Phone() {
    const [synth, setSynth] = useState<Tone.Synth | null>(null)

    const [scale, setScale] = useState<object | null>(null);
    const [scaleName, setScaleName] = useState<string>("")
    const [scales, setScales] = useState<Array<string>>([])

    const initializeTone = async () => {
        await Tone.start()
        const newSynth = new Tone.Synth().toDestination()
        setSynth(newSynth)
    }

    const handleSelectScale = (e: ChangeEvent<HTMLSelectElement>) => {
        const thisScaleName = e.target.value
        if (synth === null) initializeTone();
        fetch(`/scale/${thisScaleName}`)
        .then((r: Response) => r.json())
        .then((rJson) => {
            setScale(rJson);
            setScaleName(thisScaleName)
        })
    }

    useEffect(() => {
        fetch('/scale/')
        .then((r: Response) => r.json())
        .then((rJson) => {
            setScales(rJson.map((s: any) => s.name))
        })
    }, [])

    return (
        <>
            <main>
                <article className="m-4">
                    <h1>Twescophone</h1>
                    <select
                        value={scaleName}
                        onChange={handleSelectScale}
                        onKeyDown={makeScale(synth, scale)}
                    >
                        <option disabled></option>
                        {scales.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                    <br />
                    <Qwerty />
                </article>
            </main>
        </>
    )
}