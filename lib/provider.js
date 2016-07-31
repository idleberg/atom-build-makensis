'use babel';

import {exec} from 'child_process';
import os from 'os';

// Package settings
import meta from '../package.json';
const debug = atom.config.get(`${meta.name}.debug`);
const notEligible = `**${meta.name}**: \`makensis\` is not in your PATH`;
let prefix;

// This package depends on build, make sure it's installed
export default {
  activate() {
    require('atom-package-deps').install(meta.name);
  },
};

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
        return this.findMakensis('where');
      } else {
        prefix = '-';
        return this.findMakensis('which');
      }
    }

    findMakensis(cmd) {
      exec(cmd + ' makensis', function (error, stdout, stderr) {
        if (error !== null) {
          // No makensis installed
          if (debug === true) atom.notifications.addError(notEligible, { detail: error, dismissable: true });
          return false;
        }
        if (debug === true) atom.notifications.addInfo(`**${meta.name}**`, { detail: stdout, dismissable: false });
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
