import {exec} from 'child_process';
import log, {LogLevel} from './log';
import verbose from './verbose';

export function executeCommand(
  cmd: string,
  printCommand = verbose(),
  printStdout = verbose(),
  printStderr = verbose()
): Promise<string> {
  if (printCommand) console.log(cmd);
  const command = exec(cmd);
  const result: string[] = [];
  const stderr: string[] = [];
  if (command.stdout) {
    command.stdout.addListener('data', data => {
      if (printStdout) log(LogLevel.Debug, data);
      result.push(data);
    });
  }
  if (command.stderr) {
    command.stderr.addListener('data', data => {
      if (printStderr) log(LogLevel.Debug, data);
      stderr.push(data);
    });
  }
  return new Promise<string>((resolve, reject) => {
    command.addListener('exit', (code, signal) => {
      if (signal || code === 0) {
        if (signal) log(LogLevel.Info, `Command killed by signal ${signal}`);
        resolve(result.join(''));
      } else {
        if (!printCommand) log(LogLevel.Warn, cmd);
        log(LogLevel.Warn, stderr.join(''));
        log(LogLevel.Warn, result.join(''));

        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}
