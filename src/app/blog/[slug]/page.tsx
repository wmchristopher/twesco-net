import sql from '../../db'

export default async function Page(props: {params: Promise<{slug: string}>}) {
    const { slug } = await props.params;

    const entry = await sql`select * from blog_post where id = '${slug}'`

    return (
        <article>
            {JSON.stringify(entry)}
        </article>
    )
}