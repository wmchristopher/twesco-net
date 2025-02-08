import sql from '../../db'
import { notFound } from 'next/navigation'

function Article(props: {entry: {title: string, content: string}}) {
    let entry = props.entry
    return (
        <article>
            <h1>
                {entry.title}
            </h1>
            {entry.content}
        </article>
    )
}

export default async function Page(props: {params: Promise<{slug: string}>}) {
    const { slug } = await props.params;

    const entry = await sql`SELECT * FROM blog_post WHERE slug = ${ slug }`

    if (entry[0] === undefined) {
        notFound();
    }

    return (
        <main className="p-4">
            <Article entry={entry[0]} />
        </main>
    )
}