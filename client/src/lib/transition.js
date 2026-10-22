// Waiting for a CSS transition to finish, with a way out when it never reports back.
const FALLBACK_SLACK_MS = 600;
const FALLBACK_DEFAULT_MS = 1200; // CSS declares no transition: there is nothing to wait for

const toMs = (value) => (value.trim().endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000) || 0;

// How long the element's own transition can take (the longest property, delay included) plus some slack, so the
// timeout below follows the CSS instead of repeating its durations.
function fallbackMs(element) {
  const style = getComputedStyle(element);
  const delays = style.transitionDelay.split(',');
  const longest = Math.max(0, ...style.transitionDuration.split(',').map((duration, i) => toMs(duration) + toMs(delays[i % delays.length])));
  return longest ? longest + FALLBACK_SLACK_MS : FALLBACK_DEFAULT_MS;
}

// Calls `done` once the element's `property` transition ends (a child's transition bubbling up does not count), or after
// the fallback if transitionend never fires (a hidden tab, reduced motion). Returns a function that cancels it.
export function whenTransitionEnds(element, property, done) {
  const stop = () => {
    element.removeEventListener('transitionend', onEnd);
    window.clearTimeout(timer);
  };
  const finish = () => {
    stop();
    done();
  };
  const onEnd = (event) => {
    if (event.target === element && event.propertyName === property) finish();
  };
  element.addEventListener('transitionend', onEnd);
  const timer = window.setTimeout(finish, fallbackMs(element));
  return stop;
}
