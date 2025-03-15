import sql from '@/app/db'

export async function GET() {
    /**
     * Fetches all scales from server.
     */
    const result = await sql`SELECT name FROM scale`
    return Response.json(result)
}
