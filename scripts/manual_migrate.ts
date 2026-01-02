
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars BEFORE importing db
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') }); // Fallback

import { sql } from 'drizzle-orm';
import * as fs from 'fs';

async function main() {
    // Dynamic import to avoid hoisting issues
    const { db } = await import('../src/db');

    console.log('Running manual migration...');
    const migrationPath = path.join(process.cwd(), 'migrations', '006_add_procurement_fields.sql');

    if (!fs.existsSync(migrationPath)) {
        console.error('Migration file not found:', migrationPath);
        process.exit(1);
    }

    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

    try {
        const statements = migrationSql.split(';').filter(s => s.trim().length > 0);

        for (const statement of statements) {
            console.log('Executing:', statement.substring(0, 50).replace(/\n/g, ' ') + '...');
            await db.execute(sql.raw(statement));
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
