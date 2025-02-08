import { montserrat } from '../app/layout'

export default function Home() {
  return (
    <article>
      <h1 className={`${montserrat.className} text-center`}>
        TWESCO
      </h1>
      <p className="m-auto w-max">
        This is my personal website that I will be building out over the coming weeks.
      </p>
    </article>
  );
}
