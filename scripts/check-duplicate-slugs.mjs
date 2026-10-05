import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('server/database.sqlite');
const duplicates = db.prepare(`
  SELECT slug, count(*) as c, group_concat(id) as ids 
  FROM news 
  GROUP BY slug 
  HAVING count(*) > 1
`).all();

console.log('Duplicate slugs in news:', duplicates);
