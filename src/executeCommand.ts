import {exec} from 'child_process';
import verbose from './verbose';

export function executeCommand(
  cmd: string,
  printCommand = false,
  printStdout = false,
  printStderr = false
): Promise<string> {
  if (printCommand || verbose()) console.log(cmd);
  const command = exec(cmd);
  const result: string[] = [];
  const stderr: string[] = [];
  if (command.stdout) {
    command.stdout.addListener('data', data => {
      if (printStdout || verbose()) process.stdout.write(data);
      result.push(data);
    });
  }
  if (command.stderr) {
    if (printStderr || verbose()) command.stderr.pipe(process.stdout);
    else command.stderr.addListener('data', data => stderr.push(data));
  }
  return new Promise<string>((resolve, reject) => {
    command.addListener('exit', code => {
      if (code === 0) {
        resolve(result.join(''));
      } else {
        if (!printCommand) console.log(cmd);
        console.warn(stderr.join(''));
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}
