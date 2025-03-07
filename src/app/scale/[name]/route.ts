import sql from "@/app/db";
import { notFound } from "next/navigation";

export async function GET(
    request: Request, 
    { params }: { params: Promise<{name: string}> }
) {
    const { name } = await params;
    

    const result = await sql`SELECT * FROM scale WHERE name = ${ name ?? '' }`
    console.log(result)

    if (result[0] === undefined) {
        notFound();
    }

    const scale = result[0]

    return Response.json(scale)
}
