import core from '@actions/core';
import action from './build/action.js'

async function run() {
  try {
    await action();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()