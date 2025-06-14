"use client"

import * as Tone from 'tone';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Scale, { KeyData, ScaleInfo } from '@/app/lib/models/scale';
import { getCodeFromKey } from '@/app/lib/models/key';
import { gcd } from '../lib/utils';

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
    const n = data.n == null ? null : Math.round((data.n % edo) * 100) / 100;
    const cents = n == null ? null : n * 1200 / edo;
    return (
        <button key={data.char} className={`key key-${data.color ?? 'none'} ${keyActive ? 'key-active' : ''}`} style={{gridColumn: "span 2"}} onClick={() => setKeyEdited(data)}>
            <div className='flex flex-row justify-between'>
                <span className={`font-ysabeauInfant ${n != null && 'font-bold'}`}>
                    {n ?? ''}
                </span>
                <span className='font-extralight'>
                    {data.char.toUpperCase()}
                </span>
            </div>
            <div className='text-xs mt-2 font-light font-ysabeauInfant'>{cents?.toFixed(1)?.concat('¢') ?? '–'}</div>
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
        <div className="font-ysabeauInfant" style={{display: 'grid', gridTemplateColumns: 'repeat(25, 1fr)'}}>
            {[numRow, topRow, midRow, btmRow].map((row, idx) => 
                // ROW
                // Standard keyboards happen to be set up so that `idx` can be both `key` and a horizontal grid offset.
                <div key={idx} style={{display: "grid", gridTemplateColumns: "subgrid", gridColumn: `${idx + 1} / -1`}}>
                    {row.map(key =>
                        // KEY
                        <KeyButton key={key} data={scale.getKey(key)} keyActive={keysActive.has(getCodeFromKey(key) ?? '')}
                                   setKeyEdited={setKeyEdited} edo={scale.edo} />
                    )}
                </div>
            )}
        </div>
    );
}


function KeyEditor ({keyData, scale, synth, setScale, resetKeys}: {keyData: KeyData | null, scale: Scale | null, synth: Tone.PolySynth | null, setScale: Dispatch<SetStateAction<Scale>>, resetKeys: () => void}) {
    const [keyN, setKeyN] = useState<string>('');
    const [keyColor, setKeyColor] = useState<string>('disabled');

    useEffect(() => setKeyN(keyData?.n?.toString() ?? ''), [keyData]);
    useEffect(() => setKeyColor(keyData?.color ?? 'disabled'), [keyData]);

    if (keyData == null || scale == null) return (<p>Select a key to edit.</p>);

    const handleChangeN = (event: ChangeEvent<HTMLInputElement>) => {
        if (keyColor === 'disabled') return;
        resetKeys();
        const n = event.target.value;
        setKeyN(n);
        let parsed = parseFloat(n);
        if (isNaN(parsed)) return;
        parsed = Math.round(parsed * 100) / 100;
        scale.setKeyPitch(keyData.char, parsed);
        setScale(scale.clone())
    }

    const handleChangeColor = (event: ChangeEvent<HTMLInputElement>) => {
        const color = event.target.value;
        if (color === 'disabled') {
            const newScale = scale.clone()
            newScale.disableKey(keyData.char);
            setScale(newScale);
            setKeyColor(color);
            return;
        }
        scale.setKeyColor(keyData.char, color);
        setKeyColor(color);
        setScale(scale.clone())
    }
    console.log(keyColor)

    return (
        <form className='text-xl'>
            <h3>
                <code>
                    {keyData.char?.toUpperCase()}
                </code>
            </h3>
            {['disabled', 'mallow', 'clover', 'stereum', 'robin'].map((s) => (
                <label key={s} className={`cursor-pointer me-4 font-semibold capitalize text-nowrap text-${s} ${keyColor === s ? 'font-bold underline' : 'font-normal'}`}>
                    <input type='radio' value={s} name='color' onChange={handleChangeColor} checked={keyColor === s} className={`opacity-0 fixed pointer-events-none`} />
                    {s}
                </label>
            ))}
            <br />
            <label>
                <span className='small-caps font-semibold'>
                    edo
                </span>-step
                <input className='text-clover font-bold bg-transparent ms-3 disabled:opacity-50' type="number" value={keyN} min={-300} max={300} onChange={handleChangeN} />
            </label>
        </form>
    )
}

function getHarmony(
    freqs: number[],
    maxDenom: number = 20,
    maxError: number = 20
) {
    if (freqs.length < 2) return []
    freqs = freqs.sort()
    const base = freqs[0]
    const targetRatios = freqs.slice(1).map(f => f / base)
    const result = new Map();

    for (let denom = 1; denom <= maxDenom; denom++) {
        let pushRatio = true;
        const integers = [denom];
        const errors = [0]
        for (const r of targetRatios) {
            const num = Math.round(denom * r);
            const ratio = num / denom;
            const approxCents = 1200 * Math.log2(ratio)
            const error = 1200 * Math.log2(r) - approxCents
            if (Math.abs(error) > maxError) {
                pushRatio = false;
                break;
            }
            integers.push(num);
            errors.push(error)
        }
        const thisGcd = gcd(integers)
        const integerJson = JSON.stringify(integers.map(n => n / thisGcd))
        if (pushRatio && !result.has(integerJson)) result.set(integerJson, errors);
    }
    return result;
}


function HarmonyMeter({error, integer}: {error: number, integer: number}) {
    return ( 
        <div className='grid grid-cols-subgrid col-span-full items-center'>
            <span className='text-end me-2'>{error < 0 ? `${error.toFixed(2)} ¢` : ''}</span>
            <meter title="cents flat" min="0" max="20" high={10} value={-error} style={{transform:"scaleX(-1)"}}>
            </meter>
            <label className='justify-self-center'>
                {integer}
            </label>
            <meter title="cents sharp" min="0" max="20" high={10} value={error}>
            </meter>
            <span className='ms-2'>{error > 0 ? `+${error.toFixed(2)} ¢` : ''}</span>
        </div>
    )
}


export default function Phone() {

    // Synth object that will be initialized and played.
    const [synth, setSynth] = useState<Tone.PolySynth | null>(null);

    // Scale object as defined by L and s fields.
    const [scale, setScale] = useState<Scale>(new Scale('Diatonic', 5, 2, [2, 1]));
    const [scaleInfo, setScaleInfo] = useState<ScaleInfo|null>(null);

    // Set of active (depressed) keys.
    const [keysActive, setKeysActive] = useState<Set<string>>(new Set([]))

    // Set of active frequencies.
    const [freqsActive, setFreqsActive] = useState<Set<number>>(new Set([]))

    // Key that is being edited.
    const [keyEdited, setKeyEdited] = useState<KeyData | null>(null)

    const helpRef = useRef<HTMLDialogElement>(null);

    const openHelp = () => helpRef.current?.showModal();
    const closeHelp = () => helpRef.current?.close();

    // User input values
    const [numL, setNumL] = useState<string>(scale.numL.toString());
    const [numS, setNumS] = useState<string>(scale.numS.toString());
    const [mode, setMode] = useState<string>(scale.mode.toString());

    function resetKeys() {
        synth?.releaseAll();
        setKeysActive(new Set());
        setFreqsActive(new Set());
    }

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

    const handleScaleChange = (type: string) => (event: ChangeEvent<HTMLInputElement>) => {
        resetKeys();
        const userVal = event.target.value;
        const newVal = parseInt(userVal);

        function boundVal(n: number) {
            n = Math.max(1, n);
            n = Math.min(n, 10);
            return n
        }
        const boundedVal = boundVal(newVal);
        let setVal, newScale;

        switch (type) {
            case 'L':
                setVal = setNumL;
                newScale = new Scale('myScale', boundedVal, scale.numS, scale.ratio, scale.mode);
                break;
            case 's':
            default:
                setVal = setNumS;
                newScale = new Scale('myScale', scale.numL, boundedVal, scale.ratio, scale.mode);
        }
        setVal(userVal);
        if (Number.isNaN(newVal)) return;
        if (boundedVal !== newVal) setVal(boundedVal.toString());
        setScale(newScale);
        setMode(newScale.mode.toString());
    }

    const handleRatioChange = (event: ChangeEvent<HTMLSelectElement>) => {
        resetKeys();
        const newRatio = [
            parseInt(event.target.value[0]),
            parseInt(event.target.value.slice(-1))
        ] as [number, number];

        setScale(new Scale('myScale', scale.numL, scale.numS, newRatio, scale.mode));
    }
    const ratios = [[4,1],[3,1],[2,1],[4,2],[3,2],[4,3]];

    const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        resetKeys();
        const userVal = event.target.value;
        const newMode = parseInt(userVal);

        setMode(userVal);
        if (Number.isNaN(newMode)) return;
        const newScale = new Scale(scale.name, scale.numL, scale.numS, scale.ratio, newMode)
        setMode(newScale.mode.toString());
        setScale(newScale);
    }

    useEffect(() => {
        // Add window-scope event listeners for key events.

        const handleKeyDown = (e: KeyboardEvent) => {
            // User presses key down.  User may hold key to hold note.
            if (synth == null) initializeTone();
    
            if (e.repeat || scale == null) return;  // Do nothing if this is a "repeat" keydown, i.e. a held note.
    
            setKeysActive(ka => new Set(ka).add(e.code))  // Highlight key.
            const freq = scale.getPitch(e.code)
            if (freq != null) setFreqsActive(fa => new Set(fa).add(freq))
    
            scale.play(synth, e.code, 'attack');         // Play note.
        }
    
        const handleKeyUp = (e: KeyboardEvent) => {
            if (scale == null) return;
    
            setKeysActive(ka => (ka.delete(e.code), new Set(ka))); // Un-highlight key.
            const freq = scale.getPitch(e.code)
            if (freq != null) setFreqsActive(fa => (fa.delete(freq), new Set(fa)))
            scale.play(synth, e.code, 'release');                 // Release note.
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, [scale, synth])

    useEffect(() => {
        if (!scale) return;
        fetch(`/scale/${scale.numL}/${scale.numS}`)
            .then(res => {
                if (!res.ok) return null;
                return res.json();
            })
            .then(setScaleInfo)
    }, [scale])

    return (
        <main style={{backgroundImage: 'url("/static/image.png")', backgroundRepeat: "repeat", backgroundSize: "417px 192px"}}
              className="flex-grow p-4">
            <article>
                <h1 className="hidden">
                    Microtonal Synthesizer
                </h1>
                <div className="grid grid-cols-1 xl:grid-cols-[auto_minmax(30ch,50ch)] gap-3">
                    <div className="flex-grow basis-[fit-content]">
                        <section className="shadow-section-medium p-3 bg-white/90 border-4 border-mallow/60 rounded-xl min-w-[900px]">
                            <header className="font-ysabeauInfant text-xl text-mallow flex flex-row items-baseline">
                                <h2 className="font-bold text-2xl text-mallow me-auto">
                                    {scaleInfo?.name ?? 'Scale'}
                                </h2>
                                <a href="#" className="font-semibold italic mr-6 hover:text-opacity-65" onClick={openHelp}>
                                    Explain &#x261e;
                                </a>
                                <input name="l" type="number" className="text-end bg-transparent font-bold" value={numL} min={1} max={10} onChange={handleScaleChange('L')}></input>
                                <label htmlFor="l">
                                    L
                                </label>

                                <input name="s" type="number" className="text-end ms-2 bg-transparent font-bold" value={numS} min={1} max={10} onChange={handleScaleChange('s')}></input>
                                <label htmlFor="s">
                                    s
                                </label>

                                <label htmlFor="ratio" className="ms-10 me-2">
                                    Ratio
                                </label>
                                <select
                                    name="ratio"
                                    className="bg-transparent font-bold"
                                    value={scale.ratio.toString()}
                                    onChange={handleRatioChange}
                                >
                                    {ratios.map((r) => (<option key={r.toString()} value={r.toString()}>{r.toString().replace(',', ':')}</option>))}
                                </select>

                                <label htmlFor="mode" className="ms-8 me-2">
                                    Mode
                                </label>
                                <input name="mode" type="number" className="bg-transparent font-bold" value={mode} min={-2} max={99} onChange={handleModeChange}></input>
                                <span className="ms-8 me-2">
                                    EDO: {scale.edo}
                                </span>
                            </header>
                            <Qwerty scale={scale} keysActive={keysActive} setKeyEdited={setKeyEdited}/>
                        </section>
                        <div className="grid grid-cols-2 gap-3 h-[300px] max-h-[300px]">
                            <section className={`shadow-section-medium p-3 bg-white/90 border-4 border-clover/60 rounded-xl ${scale == null ? 'hidden' : ''}`}>
                                <h2 className="font-bold text-2xl text-clover">
                                    Editor
                                </h2>
                                <KeyEditor keyData={keyEdited} scale={scale} synth={synth} setScale={setScale} resetKeys={resetKeys}/>
                            </section>
                            <section className={`shadow-section-medium overflow-y-auto p-3 bg-white/90 border-4 border-robin/60 rounded-xl flex flex-col ${scale == null ? 'hidden' : ''}`}>
                                <h2 className="font-bold text-2xl text-robin shrink-0">
                                    Harmony
                                </h2>
                                <div className="overflow-y-auto flex-1 font-ysabeauInfant grid grid-cols-[1fr_auto_auto_auto_1fr] content-start justify-center items-start">
                                    {[...getHarmony([...freqsActive])].map((r, idx) => (
                                        <div key={idx} className="grid grid-cols-subgrid col-span-full">
                                            {JSON.parse(r[0]).map((i: number, jdx: number) => (
                                                <HarmonyMeter key={jdx} error={r[1][jdx]} integer={i} />
                                            ))}
                                            <hr className="col-span-full border-clover" />
                                        </div>
                                    ))}
                                </div>
                            </section>

                        </div>
                    </div>
                    <section className={`shadow-section-medium p-3 bg-white/90 border-4 border-stereum/60 rounded-xl flex-grow basis-[50ch] max-h-[90vh] text-black/80 overflow-auto scale-info text-justify ${scale == null ? 'hidden' : ''}`}>
                        <h2 className="font-bold text-2xl text-stereum">
                            Scale Information
                        </h2>
                        <div style={{columns:"65ch auto", columnGap:"3rem"}} dangerouslySetInnerHTML={{__html: scaleInfo?.info ?? 'No info for this scale.'}}>
                        </div>
                    </section>
                </div>
                <dialog ref={helpRef} className="px-8 py-6 rounded max-w-prose shadow-section-high">
                    <button className='float-end font-semibold italic mb-3 text-mallow hover:text-opacity-65' onClick={closeHelp}>Close</button>
                    <section className='clear-both'>
                        <p>
                            This musical keyboard is built for <b>moment&nbsp;of&nbsp;symmetry</b> scales (<span className='small-caps font-semibold'>mos</span>),
                            which are formed by two step sizes: one large (L) and one small (s).
                        </p>
                        <p>
                            For example, the diatonic scale is <i className="font-ysabeauInfant">5L&nbsp;2s</i>—five large and two small steps.
                        </p>
                    </section>
                    <section>
                        <p>
                            <b>L</b> and <b>s</b> set how many steps of each size are in the scale.
                        </p>
                        <p>
                            <b>Ratio</b> sets the ratio between the step sizes.
                        </p>
                        <p>
                            <b>Mode</b> shifts the starting note of the scale.
                        </p>
                        <p>
                            <b>EDO</b> (<i>equal divisions of the octave</i>) derives from the step counts and ratio.
                        </p>
                        <p>With the default <i className="font-ysabeauInfant">2:1 5L&nbsp;2s</i>:
                        <br></br>
                        <span className="font-ysabeauInfant text-nowrap">(5 &times; 2) + (2 &times; 1) = 12</span>
                        <br></br>
                        &hellip;so the octave must divide into 12.
                        </p>
                    </section>
                    <section>
                        <p>
                            Each active key of the keyboard displays three values. 
                        </p>
                        <p>
                            The number in bold is <b> <span className="small-caps font-extrabold">edo</span>-steps</b> above the root note
                            (<i>e.g.</i>, in 12-<span className="small-caps font-semibold">edo</span>, how many 12ths of an octave, or semitones).
                        </p>
                        <p>
                            The glyph on the right indicates the key on a <span className="small-caps font-semibold">qwerty</span> keyboard to which this note is mapped.
                        </p>
                        <p>
                            The decimal value on the bottom gives the cents above the root note.  One cent is one 1,200th of an octave.
                        </p>
                    </section>
                    <section>
                        <p>
                            The selected <span className="small-caps font-semibold">mos</span> is set along the row of keys starting
                            with <span className="small-caps font-semibold">edo</span>-step&nbsp;<i className="font-ysabeauInfant">0</i>, key&nbsp;<i>A</i>.
                        </p>
                        <p>
                            The root note and octaves are marked in orange; other scale degrees are purple.
                        </p>
                        <p>
                            Chromatic notes are green and azure.
                        </p>
                        <p>
                            Vertically aligned keys are set so that the higher key on the keyboard plays the higher pitch.
                        </p>
                    </section>
                </dialog>
            </article>
        </main>
    );
}