'use babel';

import os from 'os';
import glob from 'glob';

function isEligable(cwd) {
  if (glob.sync('*.@(nsi|nsh)', {cwd}).length >= 1) {
    return true;
  }
  return false;
}

function settings(path) {
  return {
    exec: 'makensis',
    args: [ "{FILE_ACTIVE}" ],
    cwd: "{PROJECT_PATH}",
    sh: false
  };
}

export function provideBuilder() {
  return {
    niceName: 'NSIS',
    isEligable,
    settings
  };
}
