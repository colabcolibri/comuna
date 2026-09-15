export function createMinIntervalGate(minMs: number) {
  let last = 0;
  return async function waitForSlot() {
    const wait = minMs - (Date.now() - last);
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    last = Date.now();
  };
}
