import fs from 'fs';
import appRootPath from 'app-root-path';

const pkg = JSON.parse(fs.readFileSync(appRootPath.resolve('package.json'), 'utf-8'));

export default {
    ...pkg,
    binName: Object.keys(pkg.bin)[0]
};
