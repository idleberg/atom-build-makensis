'use babel';

import glob from 'glob';

export function provideBuilder() {

  return class MakensisProvider {
    constructor(cwd) {
      this.cwd = cwd;
    }

    getNiceName() {
      return 'NSIS';
    }

    isEligible() {
      // we're just fine
      return true;
    }

    settings() {
      return {
        name: 'makensis',
        exec: 'makensis',
        args: [ '{FILE_ACTIVE}' ],
        cwd: '{FILE_ACTIVE_PATH}',
        sh: false,
        atomCommandName: 'build-makensis:compile',
        errorMatch: [
        'Error in script "(?<file>[^"]+)" on line (?<line>\\d+) -- aborting creation process'
        ]
      }
    }
  }
}
