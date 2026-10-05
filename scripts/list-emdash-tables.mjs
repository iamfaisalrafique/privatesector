import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('emdash-site/data.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in emdash data.db:\n', tables.map(t => t.name).join(', '));
