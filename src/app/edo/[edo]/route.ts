import sql from "@/app/db";
import { notFound } from "next/navigation";

export async function GET(
    request: Request, 
    { params }: { params: Promise<{edo: number}> }
) {
    /**
     * Fetches specific scale from server.
     */
    const { edo } = await params;
    
    const result = await sql`SELECT * FROM scale WHERE edo = ${ edo ?? 0 }::number`

    if (result[0] === undefined) {
        return Response.json({n: edo})
    }
    const data = result[0]

    return Response.json(data)
}
