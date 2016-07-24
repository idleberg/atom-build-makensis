'use babel';

import {exec} from 'child_process';
import os from 'os';

const self = '[build-makensis]';
const debug = atom.config.get('build-makensis.debug');
let prefix;

export function provideBuilder() {
  return class MakensisProvider {
    constructor(cwd) {
      this.cwd = cwd;
    }

    getNiceName() {
      return 'NSIS';
    }

    isEligible() {
      if (os.platform() === 'win32') {
        prefix = '/';
        return this.findMakensis('where makensis');
      } else {
        prefix = '-';
        return this.findMakensis('which makensis');
      }
    }

    findMakensis(cmd) {
      exec(cmd, function (error, stdout, stderr) {
        if (error !== null) {
          if (debug === true) console.log(self, error);
          return false;
        }
        if (debug === true) console.log(self, stdout);
      });

      return true;
    }

    settings() {
      const errorMatch = [
        '(\\r?\\n)(?<message>.+)(\\r?\\n)Error in script "(?<file>[^"]+)" on line (?<line>\\d+) -- aborting creation process'
      ];
      const warningMatch = [
        '[^!]warning: (?<message>.*) \\((?<file>(\\w{1}:)?[^:]+):(?<line>\\d+)\\)'
      ];

      return [
        {
          name: 'makensis',
          exec: 'makensis',
          args: [ '{FILE_ACTIVE}' ],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'alt-cmd-b',
          atomCommandName: 'makensis:compile',
          errorMatch: errorMatch,
          warningMatch: warningMatch
        },
        {
          name: 'makensis /WX',
          exec: 'makensis',
          args: [ prefix + 'WX', '{FILE_ACTIVE}' ],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'ctrl-alt-cmd-b',
          atomCommandName: 'makensis:compile-and-stop-at-warning',
          errorMatch: warningMatch
        }
      ];
    }
  };
}
