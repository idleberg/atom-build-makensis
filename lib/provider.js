'use babel';

import { EventEmitter } from 'events';
import { execSync } from 'child_process';
import os from 'os';

// Package settings
import meta from '../package.json';
let prefix;
if (os.platform() === 'win32') {
  prefix = '/';
} else {
  prefix = '-';
}

this.config = {
  customArguments: {
    title: 'Custom Arguments',
    description: 'Specify your preferred arguments for `makensis`, supports [replacement](https://github.com/noseglid/atom-build#replacement) placeholders',
    type: 'string',
    default: '{FILE_ACTIVE}',
    order: 0
  },
  projectEligibility: {
    title: 'Project Eligibility',
    description: 'Only activate targets when project contains files eligible for this build provider. Note that this can slow down startup time significantly!',
    type: 'boolean',
    default: false,
    order: 1
  },
  manageDependencies: {
    title: 'Manage Dependencies',
    description: 'When enabled, third-party dependencies will be installed automatically',
    type: 'boolean',
    default: true,
    order: 2
  }
};

// This package depends on build, make sure it's installed
export function activate() {
  if (atom.config.get('build-makensis.manageDependencies') && !atom.inSpecMode()) {
    this.satisfyDependencies();
  }
}

export function satisfyDependencies() {
  let k;
  let v;

  require('atom-package-deps').install(meta.name);

  const ref = meta['package-deps'];
  const results = [];

  for (k in ref) {
    if (typeof ref !== 'undefined' && ref !== null) {
      v = ref[k];
      if (atom.packages.isPackageDisabled(v)) {
        if (atom.inDevMode()) {
          console.log('Enabling package \'' + v + '\'');
        }
        results.push(atom.packages.enablePackage(v));
      } else {
        results.push(void 0);
      }
    }
  }
  return results;
}

export function provideBuilder() {
  return class MakensisProvider extends EventEmitter {
    constructor(cwd) {
      super();
      this.cwd = cwd;
      atom.config.observe('build-makensis.customArguments', () => this.emit('refresh'));
      atom.config.observe('build-makensis.projectEligibility', () => this.emit('refresh'));
    }

    getNiceName() {
      return 'NSIS';
    }

    isEligible() {
      try {
        execSync(`makensis ${prefix}VERSION`);
      } catch (error) {
        console.error(meta.name, error);
        return false;
      }

      if (atom.config.get('build-makensis.projectEligibility') === true) {
        return this.isProjectEligible(['nsi', 'nsh']);
      }

      return true;
    }

    isProjectEligible(fileTypes) {
      const globby = require('globby');
      const path = require('path');

      if (typeof fileTypes === 'string') {
        fileTypes = [fileTypes];
      }

      const projectDirs = atom.project.getPaths();
      const globPattern = [];

      for (let i = 0; i < projectDirs.length; i++) {
        fileTypes.forEach(function (fileType) {
          globPattern.push(path.join(projectDirs[i], '**/*.' + fileType));
        });
      }

      const options = {
        'cache': true
      };

      const paths = globby.sync(globPattern, options);

      if (paths.length > 0) {
        return true;
      }

      return false;
    }

    settings() {
      let customErrorMatch;
      let customWarningMatch;

      const errorMatch = [
        '(\\r?\\n)(?<message>.+)(\\r?\\n)Error in script "(?<file>[^"]+)" on line (?<line>\\d+) -- aborting creation process'
      ];
      const warningMatch = [
        '[^!]warning: (?<message>.*) \\((?<file>(\\w{1}:)?[^:]+):(?<line>\\d+)\\)'
      ];
      const comboMatch = errorMatch.concat(warningMatch);

      // User settings
      const customArguments = atom.config.get('build-makensis.customArguments').trim().split(' ');

      // Adjust errorMatch and warningMatch
      if (customArguments.indexOf(prefix + 'WX') !== -1) {
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
          keymap: 'alt-cmd-u',
          atomCommandName: 'MakeNSIS:compile-with-user-settings',
          errorMatch: customErrorMatch,
          warningMatch: customWarningMatch
        }
      ];
    }
  };
}
