const fs = require('fs');
const path = require('path');

const rootDir = 'src';
// Regex to match: from "package@version"
// We use a global regex to replace all occurrences in a file.
const pattern = /from (["'])(.*?)@\d+\.\d+\.\d+\1/g;

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walk(filepath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            try {
                let content = fs.readFileSync(filepath, 'utf8');
                let newContent = content.replace(pattern, (match, quote, pkg) => {
                    return `from ${quote}${pkg}${quote}`;
                });

                if (content !== newContent) {
                    console.log(`Fixing ${filepath}`);
                    fs.writeFileSync(filepath, newContent, 'utf8');
                }
            } catch (e) {
                console.error(`Error processing ${filepath}:`, e);
            }
        }
    });
}

console.log('Starting fix...');
walk(rootDir);
console.log('Done.');
