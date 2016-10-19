'use babel';

import { install } from 'atom-package-deps';
import { execSync } from 'child_process';
import os from 'os';
import { EventEmitter } from 'events';

// Package settings
import meta from '../package.json';
let prefix;

this.config = {
  customArguments: {
    title: "Custom Arguments",
    description: "Specify your preferred arguments for `makensis`, supports [replacement](https://github.com/noseglid/atom-build#replacement) placeholders",
    type: "string",
    "default": "{FILE_ACTIVE}",
    order: 0
  }
};

// This package depends on build, make sure it's installed
export function activate() {
  if (!atom.inSpecMode()) {
    install(meta.name);
  }
}

export function provideBuilder() {
  return class MakensisProvider extends EventEmitter {
    constructor(cwd) {
      super();
      this.cwd = cwd;
      atom.config.observe('build-makensis.customArguments', () => this.emit('refresh'));
    }

    getNiceName() {
      return 'NSIS';
    }

    isEligible() {
      if (os.platform() === 'win32') {
        prefix = '/';
      }
      prefix = '-';

      try {
        stdout = execSync(`makensis ${prefix}VERSION`);
        if (atom.inDevMode()) atom.notifications.addInfo(meta.name, { detail: stdout, dismissable: false });
        return true;
      } catch (error) {
        if (atom.inDevMode()) atom.notifications.addError(meta.name, { detail: error, dismissable: true });
        return false;
      }
    }

    settings() {
      let customArguments, customErrorMath, customWarningMatch;

      const errorMatch = [
        '(\\r?\\n)(?<message>.+)(\\r?\\n)Error in script "(?<file>[^"]+)" on line (?<line>\\d+) -- aborting creation process'
      ];
      const warningMatch = [
        '[^!]warning: (?<message>.*) \\((?<file>(\\w{1}:)?[^:]+):(?<line>\\d+)\\)'
      ];
      const comboMatch = errorMatch.concat(warningMatch);

      // User settings
      customArguments = atom.config.get('build-makensis.customArguments').trim().split(" ");

      // Adjust errorMatch and warningMatch
      if (customArguments.indexOf(prefix + "WX") != -1) {
        customErrorMatch = comboMatch;
        customWarningMatch = null;
      } else {
        customErrorMatch = errorMatch;
        customWarningMatch = warningMatch;
      }

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
          args: [ prefix + 'WX', '{FILE_ACTIVE}' ],
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
          atomCommandName: 'MakeNSIS:compile-with-user-settings',
          errorMatch: customErrorMatch,
          warningMatch: customWarningMatch
        }
      ];
    }
  };
}
