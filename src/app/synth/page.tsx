"use client"

import * as Tone from 'tone';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import Scale from '@/app/lib/models/scale';
import { getCodeFromKey, getKeyFromCode } from '@/app/lib/models/key';


function KeyButton(
    {keyChar, edoN, color, keyActive, setKeyEdited, edo}: { 
        keyChar: string, 
        edoN: number | undefined,
        color: string,
        keyActive: boolean, 
        setKeyEdited: Dispatch<SetStateAction<string>>,
        edo: number
    }
) {
    /**
     * Displays button on virtual keyboard.
     * 
     * @param keyChar      scale-specific data for this key, defined by KeyData interface, q.v.
     * @param edoN         which EDOstep
     * @param color        what color the key is
     * @param keyActive    whether this key is depressed (sets class that marks it to be highlighted)
     * @param setKeyEdited displays editor fields for this key
     * @param edo          num EDO
     */
    const n = edoN == null ? null : edoN % edo;
    const cents = n == null ? null : n * 1200 / edo;
    return (
        <button key={keyChar} className={`key key-${color} ${keyActive ? 'key-active' : ''}`} style={{gridColumn: "span 2"}} onClick={() => setKeyEdited(keyChar)}>
            <div className='flex flex-row justify-between'>
                <span className={`font-ysabeauInfant ${n != null && 'font-bold'}`}>
                    {n ?? '–'}
                </span>
                <span className='font-extralight'>
                    {keyChar.toUpperCase()}
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
        setKeyEdited: Dispatch<SetStateAction<string>>
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

    function chooseColor(key: string) {
        const edoN = scale.keys?.get(key)
        if (edoN == null)           return 'none';
        if (edoN % scale.edo === 0) return 'stereum';
        if (midRow.includes(key))   return 'mallow';
        if (topRow.includes(key))   return 'clover';
                                    return 'robin';
    }

    return (
        // KEYBOARD
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(25, max-content)'}}>
            {[numRow, topRow, midRow, btmRow].map((row, idx) => 
                // ROW
                // Standard keyboards happen to be set up so that `idx` can be both `key` and a horizontal grid offset.
                <div key={idx} style={{display: "grid", gridTemplateColumns: "subgrid", gridColumn: `${idx + 1} / -1`}}>
                    {row.map((key, jdx) =>
                        // KEY
                        <KeyButton key={key} keyChar={key} keyActive={keysActive.has(getCodeFromKey(key) ?? '')}
                                   setKeyEdited={setKeyEdited} color={chooseColor(key)} edoN={scale.keys?.get(key)} edo={scale.edo} />
                    )}
                </div>
            )}
        </div>
    );
}


function KeyEditor ({keyData, scale, setScale, synth}: {keyData: KeyData | null, scale: Scale | null, setScale: Dispatch<SetStateAction<Scale | null>>, synth: Tone.PolySynth | null}) {
    if (keyData == null) return (<></>);

    const [keyN, setKeyN] = useState<number | string>(keyData.n ?? '');
    const [keyColor, setKeyColor] = useState<string>(keyData.color ?? 'mallow');

    const handleChangeN = (event: ChangeEvent<HTMLInputElement>) => {
        synth?.releaseAll();
        const n = event.target.valueAsNumber ?? '';
        setScale(scale?.updateKeyPitch(keyData.code, n) ?? null);
        setKeyN(n);
    }

    const handleChangeColor = (event: ChangeEvent<HTMLSelectElement>) => {
        const color = event.target.value;
        setScale(scale?.updateKeyColor(keyData.code, color) || null);
        setKeyColor(color);
    }

    return (
        <form>
            <h3>
                {getKeyFromCode(keyData.code)?.toUpperCase()}
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
        const newRatio = [
            parseInt(event.target.value[0]),
            parseInt(event.target.value.slice(-1))
        ] as [number, number];

        setScale(new Scale('myScale', scale.numL, scale.numS, newRatio, scale.mode));
    }
    const ratios = [[3,1],[2,1],[3,2]];

    const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
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
                <div className="flex flex-row">
                    <section className="m-2 p-3 bg-white/90 border-4 border-mallow/60 rounded-xl rounded-br-none flex-grow">
                        <h2 className="hidden">
                            Keyboard
                        </h2>
                        <input type="number" value={scale.numL} min={1} max={10} onChange={handleScaleChange('L')}></input>
                        <input type="number" value={scale.numS} min={1} max={10} onChange={handleScaleChange('s')}></input>
                        <select
                            className="bg-transparent"
                            value={scale.ratio.toString()}
                            onChange={handleRatioChange}
                        >
                            {ratios.map((r) => (<option key={r.toString()} value={r.toString()}>{r.toString().replace(',', ':')}</option>))}
                        </select>
                        <input type="number" value={scale.mode}onChange={handleModeChange}></input>
                        <br />
                        <Qwerty scale={scale} keysActive={keysActive} setKeyEdited={setKeyEdited}/>
                    </section>
                    <section className={`m-2 p-3 bg-white/90 border-4 border-clover/60 rounded-xl rounded-bl-none flex-grow ${scale == null ? 'hidden' : ''}`}>
                        <h2 className="font-bold text-2xl text-clover">
                            Editor
                        </h2>
                        <KeyEditor keyData={keyEdited} scale={scale} setScale={setScale} synth={synth} />
                    </section>
                </div>
                <section className={`m-2 p-3 bg-white/90 border-4 border-stereum/60 rounded-xl ${scale == null ? 'hidden' : ''}`}>
                    <h2 className="font-bold text-2xl text-stereum">
                        Scale Information
                    </h2>
                    <p>
                        Scale Info
                    </p>
                    <code>
                        {JSON.stringify(scale)}
                    </code>
                </section>
            </article>
        </main>
    );
}