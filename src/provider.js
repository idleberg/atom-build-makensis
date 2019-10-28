'use babel';

import meta from '../package.json';
import { configSchema, getConfig } from './config';
import { EventEmitter } from 'events';
import { platform } from 'os';
import { satisfyDependencies, which } from './util';
import { spawnSync } from 'child_process';

const prefix = (platform() === 'win32') ? '/' : '-';

export { configSchema as config };

export function provideBuilder() {
  return class MakensisProvider extends EventEmitter {
    constructor(cwd) {
      super();
      this.cwd = cwd;
      atom.config.observe(`${meta.name}.customArguments`, () => this.emit('refresh'));
    }

    getNiceName() {
      return 'NSIS';
    }

    isEligible() {
      if (getConfig('alwaysEligible') === true) {
        return true;
      }

      const whichCmd = spawnSync(which(), ['makensis']);

      return (whichCmd.stdout && whichCmd.stdout.toString().length) ? true : false;
    }

    settings() {
      const errorMatch = [
        '(\\r?\\n)(?<message>.+)(\\r?\\n)Error in script "(?<file>[^"]+)" on line (?<line>\\d+) -- aborting creation process'
      ];
      const warningMatch = [
        '[^!]warning: (?<message>.*) \\((?<file>(\\w{1}:)?[^:]+):(?<line>\\d+)\\)'
      ];
      const comboMatch = errorMatch.concat(warningMatch);

      // User settings
      const customArguments = getConfig('customArguments');

      // Adjust errorMatch and warningMatch
      const customErrorMatch = (customArguments.includes(`${prefix}WX`)) ? comboMatch : errorMatch;
      const customWarningMatch = (customArguments.includes(`${prefix}WX`)) ? null : warningMatch;

      return [
        {
          name: 'makensis',
          exec: 'makensis',
          args: [ '{FILE_ACTIVE}' ],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'alt-cmd-b',
          atomCommandName: 'MakeNSIS:compile',
          errorMatch: errorMatch,
          warningMatch: warningMatch
        },
        {
          name: 'makensis (strict)',
          exec: 'makensis',
          args: [ `${prefix}WX`, '{FILE_ACTIVE}' ],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'ctrl-alt-cmd-b',
          atomCommandName: 'MakeNSIS:compile-and-stop-at-warning',
          errorMatch: comboMatch
        },
        {
          name: 'makensis (user)',
          exec: 'makensis',
          args: customArguments,
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          keymap: 'alt-cmd-u',
          atomCommandName: 'MakeNSIS:compile-with-user-settings',
          errorMatch: customErrorMatch,
          warningMatch: customWarningMatch
        }
      ];
    }
  };
}

// This package depends on build, make sure it's installed
export async function activate() {
  if (getConfig('manageDependencies') === true) {
    satisfyDependencies();
  }
}
