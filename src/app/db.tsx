import postgres from 'postgres'

const sql = postgres(
    "postgresql://neondb_owner:npg_cjiCg9XOo1Fr@ep-solitary-smoke-a53noqbh-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
    { ssl: 'require' }
);

export default sql;