import sql from '@/app/db'

export async function GET() {
    const result = await sql`SELECT name FROM scale`
    return Response.json(result)
}
