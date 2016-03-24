'use babel';

import glob from 'glob';
import os from 'os';

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

      const makensis = 'makensis';
      const cwdPath = '{FILE_ACTIVE_PATH}';

      const errorMatch = [
        '\\n(?<message>.+)\\nError in script "(?<file>[^"]+)" on line (?<line>\\d+) -- aborting creation process'
      ];

      const warningMatch = [
        '\\s\\((?<file>[^\\\\)]+):(?<line>\\d+)\\)\\n(?<message>.*)'
      ];

      let prefix;
      if (os.platform() === 'win32') {
        prefix = '/';
      } else {
        prefix = '-';
      }

      return [
        {
          name: 'makensis',
          exec: makensis,
          args: [ '{FILE_ACTIVE}' ],
          cwd: cwdPath,
          sh: false,
          keymap: 'alt-cmd-b',
          atomCommandName: 'makensis:compile',
          errorMatch: errorMatch
        },
        {
          name: 'makensis /WX',
          exec: makensis,
          args: [ prefix + 'WX', '{FILE_ACTIVE}' ],
          cwd: cwdPath,
          sh: false,
          keymap: 'ctrl-alt-cmd-b',
          atomCommandName: 'makensis:compile-and-stop-at-warning',
          errorMatch: warningMatch
        }
      ];
    }
  }
}
