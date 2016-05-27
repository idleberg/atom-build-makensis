'use babel';

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
        '(\\r?\\n)(?<message>.+)(\\r?\\n)Error in script "(?<file>[^"]+)" on line (?<line>\\d+) -- aborting creation process'
      ];
      const warningMatch = [
        '\\S*[^!]warning: (?<message>.*) \\((?<file>[^:]+):(?<line>\\d+)\\)'
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
          errorMatch: errorMatch,
          warningMatch: warningMatch
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
  };
}
