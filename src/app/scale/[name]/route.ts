import sql from "@/app/db";
import { notFound } from "next/navigation";

export async function GET(
    request: Request, 
    { params }: { params: Promise<{name: string}> }
) {
    /**
     * Fetches specific scale from server.
     */
    const { name } = await params;
    
    const result = await sql`SELECT * FROM scale WHERE name = ${ name ?? '' }::text`

    if (result[0] === undefined) {
        notFound();
    }
    const scale = result[0]

    return Response.json(scale)
}
