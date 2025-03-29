"use client"

import * as Tone from 'tone';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import Scale, { KeyData } from '@/app/lib/models/scale';
import { getCodeFromKey, getKeyFromCode } from '@/app/lib/models/key';


function KeyButton({keyData, keyActive, setKeyEdited}: { keyData: KeyData, keyActive: boolean, setKeyEdited: Dispatch<SetStateAction<KeyData | null>> }) {
    /**
     * Displays button on virtual keyboard.
     * 
     * @param keyData      scale-specific data for this key, defined by KeyData interface, q.v.
     * @param keyActive    whether this key is depressed (sets class that marks it to be highlighted)
     */

    // Displays the scale degree index if the note is defined according to an EDO.
    const displayN = (
        keyData.color !== 'none' 
        && keyData.n != null 
        && keyData.edo != null
    ) 
    ? keyData.n % keyData.edo 
    : '–'

    return (
        <button key={keyData.code} className={`key key-${keyData.color} ${keyActive ? 'key-active' : ''}`} style={{gridColumn: "span 2"}} onClick={() => setKeyEdited(keyData)}>
            <div>{getKeyFromCode(keyData.code)?.toUpperCase()}</div>
            <div className='text-sm'>{displayN}</div>
        </button>
    )
}

function Qwerty({scale, keysActive, setKeyEdited}: {scale: Scale | null, keysActive: Set<string>, setKeyEdited: Dispatch<SetStateAction<KeyData | null>>}) {
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
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(25, max-content)'}}>
            {[numRow, topRow, midRow, btmRow].map((row, idx) => 
                // ROW
                // Standard keyboards happen to be set up so that `idx` can be both `key` and a horizontal grid offset.
                <div key={idx} style={{display: "grid", gridTemplateColumns: "subgrid", gridColumn: `${idx + 1} / -1`}}>
                    {row.map(key =>
                        // KEY
                        <KeyButton key={key} keyData={scale.getKey(getCodeFromKey(key))} keyActive={keysActive.has(getCodeFromKey(key) ?? '')} setKeyEdited={setKeyEdited} />
                    )}
                </div>
            )}
        </div>
    );
}


function KeyEditor ({keyData, scale, setScale}: {keyData: KeyData | null, scale: Scale | null, setScale: Dispatch<SetStateAction<Scale | null>>}) {
    if (keyData == null) return (<></>);

    const [keyN, setKeyN] = useState<number | string>(keyData.n ?? '')

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const n = event.target.valueAsNumber || '';
        setScale(scale?.updateKey(keyData.code, n) ?? null);
        setKeyN(n);
    }

    return (
        <form>
            <h3>
                {getKeyFromCode(keyData.code)?.toUpperCase()}
            </h3>
            <input type="number" value={keyN} onChange={handleChange}></input>
        </form>
    )
}


export default function Phone() {

    // Synth object that will be initialized and played.
    const [synth, setSynth] = useState<Tone.PolySynth | null>(null);

    // Scale object that may be selected from menu or customized by user.
    const [scale, setScale] = useState<Scale | null>(null);

    // Scale selected in the menu.
    const [scaleName, setScaleName] = useState<string>("");

    // Preset scales selectable by user.
    const [scales, setScales] = useState<Array<string>>([]);

    // Set of active (depressed) keys.
    const [keysActive, setKeysActive] = useState<Set<string>>(new Set([]))

    // Key that is being edited.
    const [keyEdited, setKeyEdited] = useState<KeyData | null>(null)

    const initializeTone = async () => {
        // Sets up the synthesizer with default settings.
        // Must be triggered by user action.
        await Tone.start();
        const newSynth = new Tone.PolySynth().toDestination();
        setSynth(newSynth);
    }

    const handleSelectScale = (e: ChangeEvent<HTMLSelectElement>) => {
        // User chooses preset scale.
        const thisScaleName = e.target.value;
        if (synth == null) initializeTone();
        fetch(`/scale/${thisScaleName}`)
        .then((r: Response) => r.json())
        .then((rJson) => {
            setScale(new Scale(rJson.name, rJson.qwerty, rJson.edo, rJson.info));
            setScaleName(thisScaleName);
            e.target.blur();
        });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        // User presses key down.  User may hold key to hold note.

        if (e.repeat) {return;}  // Do nothing if this is a "repeat" keydown, i.e. a held note.

        setKeysActive(ka => new Set(ka).add(e.code))  // Highlight key.
        scale?.play(synth, e.code, 'attack');         // Play note.
    }

    const handleKeyUp = (e: KeyboardEvent) => {
        setKeysActive(ka => (ka.delete(e.code), new Set(ka))); // Un-highlight key.
        scale?.play(synth, e.code, 'release');                 // Release note.
    }

    useEffect(() => {
        // Fetch preset scales from API.
        fetch('/scale/')
        .then((r: Response) => r.json())
        .then((rJson) => {
            setScales(rJson.map((s: Scale) => s.name))
        });
    }, []);

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
                        <select
                            className="font-bold text-2xl font-cormorant text-mallow bg-transparent"
                            value={scaleName}
                            onChange={handleSelectScale}
                        >
                            <option disabled={scale != null}>Select a scale&hellip;</option>
                            {scales.map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                        <br />
                        <Qwerty scale={scale} keysActive={keysActive} setKeyEdited={setKeyEdited}/>
                    </section>
                    <section className={`m-2 p-3 bg-white/90 border-4 border-clover/60 rounded-xl rounded-bl-none flex-grow ${scale == null ? 'hidden' : ''}`}>
                        <h2 className="font-bold text-2xl text-clover">
                            Editor
                        </h2>
                        <KeyEditor keyData={keyEdited} scale={scale} setScale={setScale} />
                    </section>
                </div>
                <section className={`m-2 p-3 bg-white/90 border-4 border-stereum/60 rounded-xl ${scale == null ? 'hidden' : ''}`}>
                    <h2 className="font-bold text-2xl text-stereum">
                        Scale Information
                    </h2>
                    <p>
                        {scale?.info}
                    </p>
                    <code>
                        {JSON.stringify(scale)}
                    </code>
                </section>
            </article>
        </main>
    );
}