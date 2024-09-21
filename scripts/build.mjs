import { execSync } from 'node:child_process';
import { rmSync, readdirSync, writeFileSync, readFileSync, realpathSync, cpSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import * as semver from 'semver';

const DIST_DIR = 'package';

// Start clean
rmSync(DIST_DIR, { force: true, recursive: true });

// Generate ESM version + .d.mts
execSync(normalize('./node_modules/.bin/tsc'), { stdio: 'inherit' });

// Generate CJS version
execSync(normalize('./node_modules/.bin/babel') + ' package --out-dir package --out-file-extension .cjs', { stdio: 'inherit' });

// Convert .d.mts to .d.cts (experimental)
const files = readdirSync('package', { recursive: true, withFileTypes: true });
for (const file of files) {
	if (file.isFile() && extname(file.name) === '.mts') {
		const source = join(file.parentPath ?? file.path, file.name);
		const target = source.slice(0, -4) + '.cts';
		writeFileSync(
			target,
			readFileSync(source, 'utf8')
				.replace(/(import|require)\((["'].+?)\.mjs(["'])\)/g, `$1($2.cjs$3)`)
				.replace(/((?:import|export)\s+(?:type\s)?(?:\{[^}]*?\}|\w+|\*\s+as\s+\w+)\s+from\s+)?(["'].+?)\.mjs(["'];?)/g, '$1$2.cjs$3')
		);
	}
	else if (file.isFile() && extname(file.name) === '.cjs') {
		const filename = join(file.parentPath ?? file.path, file.name);
		writeFileSync(
			filename,
			readFileSync(filename, 'utf8')
				.replace(/(require)\((["'].+?)\.mjs(["'])\)/g, `$1($2.cjs$3)`)
		);
	}
}

// Copy common files
['LICENSE', 'README.md'].forEach(x => cpSync(x, DIST_DIR + '/' + x));

// Create package.json
if (realpathSync(DIST_DIR) !== process.cwd()) {
	const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
	delete packageJson.private;
	delete packageJson.scripts;
	delete packageJson.devDependencies;

	const ciTag = process.env.CI_TAG; // eg. "v1.0.0"
	if (ciTag) {
		const parsed = semver.coerce(ciTag);
		if (parsed) {
			packageJson.version = parsed.version;
		}
	}
	writeFileSync(DIST_DIR + '/package.json', JSON.stringify(packageJson, null, 2));
}
