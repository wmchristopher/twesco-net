"use client"

import * as Tone from 'tone';
import { ChangeEvent, useEffect, useState } from 'react';
import Scale, { KeyData } from '@/app/lib/models/scale';


function Key({keyData, keyActive}: { keyData: KeyData, keyActive: boolean}) {
    return (
        <button key={keyData.char} className={`key key-${keyData.color} ${keyActive ? 'key-active' : ''}`} style={{gridColumn: "span 2"}}>
            <div>{keyData.char.toUpperCase()}</div>
            <div className='text-sm'>{keyData.color !== 'none' ? keyData.n : '–'}</div>
        </button>
    )
}

function Qwerty({scale, keysActive}: {scale: Scale | null, keysActive: Set<string>}) {
    if (scale === null) {return (<></>)}
    const numRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
    const topRow = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];
    const midRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
    const btmRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

    return (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(25, max-content)'}}>
            {[numRow, topRow, midRow, btmRow].map((row, i) => (
                <div key={i} style={{display: "grid", gridTemplateColumns: "subgrid", gridColumn: `${i + 1} / -1`}}>
                    {row.map((s) => (<Key key={s} keyData={scale.getKey(s)} keyActive={keysActive.has(s)} />))}
                </div>
            ))}
        </div>
    );
}


export default function Phone() {
    const [synth, setSynth] = useState<Tone.PolySynth | null>(null);

    const [scale, setScale] = useState<Scale | null>(null);
    const [scaleName, setScaleName] = useState<string>("");
    const [scales, setScales] = useState<Array<string>>([]);
    const [keysActive, setKeysActive] = useState<Set<string>>(new Set([]))

    const initializeTone = async () => {
        await Tone.start();
        const newSynth = new Tone.PolySynth().toDestination();
        setSynth(newSynth);
    }

    const handleSelectScale = (e: ChangeEvent<HTMLSelectElement>) => {
        const thisScaleName = e.target.value;
        if (synth == null) initializeTone();
        fetch(`/scale/${thisScaleName}`)
        .then((r: Response) => r.json())
        .then((rJson) => {
            setScale(new Scale(rJson.name, rJson.qwerty, rJson.edo));
            setScaleName(thisScaleName);
            e.target.blur();
        });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) {return;}
        setKeysActive(ka => new Set(ka).add(e.key))
        scale?.play(synth, e, 'attack');
    }

    const handleKeyUp = (e: KeyboardEvent) => {
        setKeysActive(ka => (ka.delete(e.key), new Set(keysActive)));
        scale?.play(synth, e, 'release');
    }

    useEffect(() => {
        fetch('/scale/')
        .then((r: Response) => r.json())
        .then((rJson) => {
            setScales(rJson.map((s: Scale) => s.name))
        });
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, [scale, synth])

    return (
        <>
            <main>
                <article className="m-4">
                    <h1>Twescophone</h1>
                    <select
                        value={scaleName}
                        onChange={handleSelectScale}
                    >
                        <option disabled></option>
                        {scales.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                    <br />
                    <Qwerty scale={scale} keysActive={keysActive}/>
                </article>
            </main>
        </>
    );
}