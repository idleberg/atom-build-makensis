'use babel';

import { EventEmitter } from 'events';
import { install } from 'atom-package-deps';
import { platform } from 'os';
import { spawn } from 'child_process';

import meta from '../package.json';

const prefix = (platform() === 'win32') ? '/' : '-';

// Package settings
export const config = {
  customArguments: {
    title: 'Custom Arguments',
    description: 'Specify your preferred arguments for `makensis`, supports [replacement](https://github.com/noseglid/atom-build#replacement) placeholders',
    type: 'string',
    default: '{FILE_ACTIVE}',
    order: 0
  },
  manageDependencies: {
    title: 'Manage Dependencies',
    description: 'When enabled, third-party dependencies will be installed automatically',
    type: 'boolean',
    default: true,
    order: 1
  },
  alwaysEligible: {
    title: 'Always Eligible',
    description: 'The build provider will be available in your project, even when not eligible',
    type: 'boolean',
    default: false,
    order: 2
  }
};

export function satisfyDependencies() {
  install(meta.name);

  const packageDeps = meta['package-deps'];

  packageDeps.forEach( packageDep => {
    if (packageDep) {
      if (atom.packages.isPackageDisabled(packageDep)) {
        if (atom.inDevMode()) console.log(`Enabling package '${packageDep}\'`);
        atom.packages.enablePackage(packageDep);
      }
    }
  });
}

function spawnPromise(cmd, args) {
  return new Promise(function (resolve, reject) {
    const child = spawn(cmd, args);
    let stdOut;
    let stdErr;

    child.stdout.on('data', function (line) {
      stdOut += line.toString().trim();
    });

    child.stderr.on('data', function (line) {
      stdErr += line.toString().trim();
    });

    child.on('close', function (code) {
      if (code === 0) {
        resolve(stdOut);
      }

      reject(stdErr);
    });
  });
}

export function which() {
  return (platform() === 'win32') ? 'where' : 'which';
}

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

    async isEligible() {
      if (atom.config.get(`${meta.name}.alwaysEligible`) === true) {
        return true;
      }

      const whichCmd = await spawnPromise(which(), ['makensis']);

      if (whichCmd.stdout && whichCmd.stdout.toString()) {
        return true;
      }

      return false;
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
      const customArguments = atom.config.get(`${meta.name}.customArguments`).trim().split(' ');

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
export function activate() {
  if (atom.config.get(`${meta.name}.manageDependencies`) === true) {
    satisfyDependencies();
  }
}
