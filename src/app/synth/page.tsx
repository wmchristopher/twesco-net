"use client"

import * as Tone from 'tone';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import Scale, { KeyData } from '@/app/lib/models/scale';
import { getCodeFromKey, getKeyFromCode } from '@/app/lib/models/key';


function KeyButton(
    {data, keyActive, setKeyEdited, edo}: { 
        data: KeyData
        keyActive: boolean, 
        setKeyEdited: Dispatch<SetStateAction<KeyData | null>>,
        edo: number
    }
) {
    /**
     * Displays button on virtual keyboard.
     * 
     * @param data         see KeyData
     * @param keyActive    whether this key is depressed (sets class that marks it to be highlighted)
     * @param setKeyEdited displays editor fields for this key
     * @param edo          num EDO
     */
    const n = data.n == null ? null : data.n % edo;
    const cents = n == null ? null : n * 1200 / edo;
    return (
        <button key={data.char} className={`key key-${data.color ?? 'none'} ${keyActive ? 'key-active' : ''}`} style={{gridColumn: "span 2"}} onClick={() => setKeyEdited(data)}>
            <div className='flex flex-row justify-between'>
                <span className={`font-ysabeauInfant ${n != null && 'font-bold'}`}>
                    {n ?? '–'}
                </span>
                <span className='font-extralight'>
                    {data.char.toUpperCase()}
                </span>
            </div>
            <div className='text-xs mt-3 font-light font-ysabeauInfant'>{cents?.toFixed(2)?.concat('¢') ?? '–'}</div>
        </button>
    )
}

function Qwerty(
    {scale, keysActive, setKeyEdited}: {
        scale: Scale, 
        keysActive: Set<string>,
        setKeyEdited: Dispatch<SetStateAction<KeyData | null>>
    }
) {
    /**
     * Displays keyboard when scale is initialized.
     * 
     * @param scale         the scale object
     * @param keysActive    set of active (depressed) key codes
     * @param setKeyEdited  function that sets a key to be edited
     */

    if (scale == null) {return (<></>)}

    // Set rows of keys.  
    // This uses the `key` value (q) instead of the `code` (KeyQ) since it is shorter and easier to work with.
    // It also makes writing scale JSONs easier: {"q": 1} instead of {"KeyQ": 1}
    const numRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
    const topRow = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];
    const midRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
    const btmRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

    return (
        // KEYBOARD
        <div className="font-ysabeauInfant" style={{display: 'grid', gridTemplateColumns: 'repeat(25, max-content)'}}>
            {[numRow, topRow, midRow, btmRow].map((row, idx) => 
                // ROW
                // Standard keyboards happen to be set up so that `idx` can be both `key` and a horizontal grid offset.
                <div key={idx} style={{display: "grid", gridTemplateColumns: "subgrid", gridColumn: `${idx + 1} / -1`}}>
                    {row.map((key, jdx) =>
                        // KEY
                        <KeyButton key={key} data={scale.getKey(key)} keyActive={keysActive.has(getCodeFromKey(key) ?? '')}
                                   setKeyEdited={setKeyEdited} edo={scale.edo} />
                    )}
                </div>
            )}
        </div>
    );
}


function KeyEditor ({keyData, scale, setScale, synth}: {keyData: KeyData | null, scale: Scale | null, setScale: Dispatch<SetStateAction<Scale>>, synth: Tone.PolySynth | null}) {
    if (keyData == null || scale == null) return (<></>);

    const [keyN, setKeyN] = useState<number | string>(keyData.n ?? '');
    const [keyColor, setKeyColor] = useState<string>(keyData.color ?? 'mallow');

    const handleChangeN = (event: ChangeEvent<HTMLInputElement>) => {
        synth?.releaseAll();
        const n = event.target.valueAsNumber ?? '';
        scale.setKeyPitch(keyData.char, n);
        setKeyN(n);
    }

    const handleChangeColor = (event: ChangeEvent<HTMLSelectElement>) => {
        const color = event.target.value;
        scale.setKeyColor(keyData.char, color);
        setKeyColor(color);
    }

    return (
        <form>
            <h3>
                {keyData.char?.toUpperCase()}
            </h3>
            <code>
                {JSON.stringify(keyData)}
            </code>
            <label>N\EDO</label>
            <input type="number" value={keyN || 0} onChange={handleChangeN}></input>
            <label>Color</label>
            <select value={keyColor} onChange={handleChangeColor}>
                {['mallow', 'clover', 'stereum', 'robin'].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
        </form>
    )
}


export default function Phone() {

    // Synth object that will be initialized and played.
    const [synth, setSynth] = useState<Tone.PolySynth | null>(null);

    // Scale object as defined by L and s fields.
    const [scale, setScale] = useState<Scale>(new Scale('Diatonic', 5, 2, [2, 1], 6));

    // Set of active (depressed) keys.
    const [keysActive, setKeysActive] = useState<Set<string>>(new Set([]))

    // Key that is being edited.
    const [keyEdited, setKeyEdited] = useState<KeyData | null>(null)

    const initializeTone = async () => {
        // Sets up the synthesizer with default settings.
        // Must be triggered by user action.
        await Tone.start();

        const newSynth = new Tone.PolySynth(
            Tone.MonoSynth, 
            {
                envelope: {attack: 0.01, decay: 0.3, release: 0.1, sustain: 0.7},
                filterEnvelope: {attack: 0.01, decay: 0.3, release: 0.1, sustain: 0.7, baseFrequency: 'C3'},
                volume: -10
            }
        ).toDestination();
        setSynth(newSynth);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        // User presses key down.  User may hold key to hold note.
        if (synth == null) initializeTone();

        if (e.repeat || scale == null) return;  // Do nothing if this is a "repeat" keydown, i.e. a held note.

        setKeysActive(ka => new Set(ka).add(e.code))  // Highlight key.

        scale.play(synth, e.code, 'attack');         // Play note.
    }

    const handleKeyUp = (e: KeyboardEvent) => {
        if (scale == null) return;

        setKeysActive(ka => (ka.delete(e.code), new Set(ka))); // Un-highlight key.
        scale.play(synth, e.code, 'release');                 // Release note.
    }

    const handleScaleChange = (type: string) => (event: ChangeEvent<HTMLInputElement>) => {
        synth?.releaseAll();
        let newVal = parseInt(event.target.value);
        if (Number.isNaN(newVal)) return;

        newVal = Math.max(1, newVal);
        newVal = Math.min(newVal, 10)

        switch (type) {
            case 'L':
                setScale(new Scale('myScale', newVal, scale.numS, scale.ratio, scale.mode));
                return;
            case 's':
                setScale(new Scale('myScale', scale.numL, newVal, scale.ratio, scale.mode));
        }
    }

    const handleRatioChange = (event: ChangeEvent<HTMLSelectElement>) => {
        synth?.releaseAll();
        const newRatio = [
            parseInt(event.target.value[0]),
            parseInt(event.target.value.slice(-1))
        ] as [number, number];

        setScale(new Scale('myScale', scale.numL, scale.numS, newRatio, scale.mode));
    }
    const ratios = [[4,1],[3,1],[2,1],[4,2],[3,2],[4,3]];

    const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        synth?.releaseAll();
        const newMode = parseInt(event.target.value);
        if (Number.isNaN(newMode)) return;
        setScale(prev => new Scale(prev.name, prev.numL, prev.numS, prev.ratio, newMode));
    }

    // useEffect(() => {
    //     // Fetch preset scales from API.
    //     fetch('/edo/')
    //     .then((r: Response) => r.json())
    //     .then((rJson) => {
    //         setEdos(rJson.map((e: any) => e.edo))
    //     });
    // }, []);

    useEffect(() => {
        // Add window-scope event listeners for key events.
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, [scale, synth, handleKeyDown, handleKeyUp])

    return (
        <main style={{backgroundImage: 'url("/static/image.png")', backgroundRepeat: "repeat", backgroundSize: "417px 192px"}}
              className="flex-grow p-8">
            <article>
                <h1 className="hidden">
                    Microtonal Synthesizer
                </h1>
                <section className="m-2 p-3 bg-white/90 border-4 border-mallow/60 rounded-xl flex-grow">
                    <header className="font-ysabeauInfant font-semibold text-lg text-mallow flex flex-row items-baseline">
                        <h2 className="font-bold text-2xl text-mallow me-3">
                            Diatonic
                        </h2>
                        <input name="l" type="number" className="text-right bg-transparent" value={scale.numL} min={1} max={10} onChange={handleScaleChange('L')}></input>
                        <label htmlFor="l" className="font-normal">
                            L
                        </label>

                        <input name="s" type="number" className="text-right ms-2 bg-transparent" value={scale.numS} min={1} max={10} onChange={handleScaleChange('s')}></input>
                        <label htmlFor="s" className="font-normal">
                            s
                        </label>

                        <label htmlFor="ratio" className="ms-8 font-normal">
                            Ratio
                        </label>
                        <select
                            name="ratio"
                            className="bg-transparent"
                            value={scale.ratio.toString()}
                            onChange={handleRatioChange}
                        >
                            {ratios.map((r) => (<option key={r.toString()} value={r.toString()}>{r.toString().replace(',', ':')}</option>))}
                        </select>

                        <label htmlFor="mode" className="ms-8 me-2 font-normal">
                            Mode
                        </label>
                        <input name="mode" type="number" className="bg-transparent" value={scale.mode} min={-2} max={99} onChange={handleModeChange}></input>
                        <span className="ms-8 font-normal">
                            EDO: {scale.edo}
                        </span>
                    </header>
                    <br />
                    <Qwerty scale={scale} keysActive={keysActive} setKeyEdited={setKeyEdited}/>
                </section>
                <div className="flex flex-row flex-wrap">
                    <section className={`m-2 p-3 bg-white/90 border-4 border-stereum/60 rounded-xl ${scale == null ? 'hidden' : ''}`}>
                        <h2 className="font-bold text-2xl text-stereum">
                            Scale Information
                        </h2>
                        <p>
                            The diatonic scale is…
                        </p>
                    </section>
                    <section className={`m-2 p-3 bg-white/90 border-4 border-clover/60 rounded-xl flex-grow ${scale == null ? 'hidden' : ''}`}>
                        <h2 className="font-bold text-2xl text-clover">
                            Editor
                        </h2>
                        <KeyEditor keyData={keyEdited} scale={scale} setScale={setScale} synth={synth} />
                    </section>
                    <section className={`m-2 p-3 bg-white/90 border-4 border-robin/60 rounded-xl flex-grow ${scale == null ? 'hidden' : ''}`}>
                        <h2 className="font-bold text-2xl text-robin">
                            Harmony
                        </h2>
                    </section>
                </div>
            </article>
        </main>
    );
}