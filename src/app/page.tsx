import Image from "next/image";

export default function Home() {
  return (
    <main style={{backgroundImage: 'url("/static/image.png")', backgroundRepeat: "repeat", backgroundSize: "417px 192px"}}
          className="flex-grow p-8">
      <article className="bg-white opacity-90 rounded-xl text-center text-lg font-medium h-full flex flex-col justify-center">
        <h1 className="font-bold text-3xl p-4 text-mallow">
          Welcome!
        </h1>
        <p>
          I’m Christopher Smith, and you have found my Internet meadow.
        </p>
        <p>
          To play my microtonal synthesizer, <a href="/synth">click here.</a>
        </p>
        <p>
          For information about me, see also my <a href="https://linkedin.com/in/wmchristopher">LinkedIn</a> and <a href="https://github.com/wmchristopher">Github</a>.
        </p>
      </article>
    </main>
  );
}
