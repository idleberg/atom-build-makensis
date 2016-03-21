'use babel';

import fs from 'fs';
import glob from 'glob';
import path from 'path';

export function provideBuilder() {

  return class MakensisProvider {
    constructor(cwd) {
      this.cwd = cwd;
    }

    getNiceName() {
      return 'NSIS';
    }

    isEligible() {
      if (fs.existsSync(path.join(this.cwd, path.basename(this.cwd)))) {
        return true;
      }
      return false;
    }

    settings() {
      return {
        exec: 'makensis',
        args: [ '{FILE_ACTIVE}' ],
        cwd: '{FILE_ACTIVE_PATH}',
        sh: false,
        errorMatch: [
          'Error in script "(?<file>[^"]+)" on line (?<line>\\d+) -- aborting creation process'
        ]
      }
    }
  }
}
