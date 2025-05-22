import sql from "@/app/db";
import { notFound } from "next/navigation";

export async function GET(
    request: Request, 
    { params }: { params: Promise<{l: string, s: string}> }
) {
    /**
     * Fetches specific scale from server.
     */

    const { l, s } = await params;
    
    const result = await sql`SELECT * FROM scale WHERE l = ${ l ?? '' } AND s = ${ s ?? ''};`

    if (result[0] === undefined) {
        notFound();
    }
    const scale = result[0]

    return Response.json(scale)
}
