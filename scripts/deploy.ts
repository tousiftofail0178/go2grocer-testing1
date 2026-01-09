
import { execSync } from 'child_process';
import 'dotenv/config';

console.log('🚀 Starting Deployment Script...');

// 1. Check Environment Variables
const dbUrl = process.env.DATABASE_URL;
const netlifyDbUrl = process.env.NETLIFY_DATABASE_URL;

console.log(`Checking Env Vars:`);
console.log(`- DATABASE_URL: ${dbUrl ? 'Present' : 'Missing'}`);
console.log(`- NETLIFY_DATABASE_URL: ${netlifyDbUrl ? 'Present' : 'Missing'}`);

// 2. Ensure DATABASE_URL is set for tools that might depend on it explicitly
if (!dbUrl && netlifyDbUrl) {
    console.log('🔄 Mapping NETLIFY_DATABASE_URL to DATABASE_URL for compatibility...');
    process.env.DATABASE_URL = netlifyDbUrl;
} else if (!dbUrl && !netlifyDbUrl) {
    console.error('❌ Error: No database connection string found (DATABASE_URL or NETLIFY_DATABASE_URL).');
    process.exit(1);
}

// 3. Run Database Migrations
console.log('📦 Running Database Migrations (drizzle-kit push)...');
try {
    // Determine the path to the executable, or just rely on npx/yarn resolution
    execSync('npx drizzle-kit push --force', { stdio: 'inherit', env: process.env });
    console.log('✅ Migrations applied successfully.');
} catch (error) {
    console.error('❌ Migration Failed!');
    console.error(error);
    process.exit(1);
}

// 4. Run Next.js Build
console.log('🏗️  Running Next.js Build...');
try {
    execSync('next build', { stdio: 'inherit', env: process.env });
    console.log('✅ Build completed successfully.');
} catch (error) {
    console.error('❌ Build Failed!');
    console.error(error);
    process.exit(1);
}
