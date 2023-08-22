import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const filepath = import.meta.path;
const patch = `
    import { createRequire } from 'module';
    
    // bun does not implement require, so we need to create it
    import.meta.require = createRequire(import.meta.url);
`;

const targetJsFile = join(filepath, '..', '..', 'dist', 'index.js');
const js = readFileSync(targetJsFile).toString();

writeFileSync(targetJsFile, patch + js);
