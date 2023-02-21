import waitForExpect from "wait-for-expect";

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function noop(): void {
  // Nothing to do here
}

export async function wait(
  callback = noop,
  { timeout = 4500, interval = 50 } = {},
): Promise<any> {
  return waitForExpect(callback, timeout, interval);
}
