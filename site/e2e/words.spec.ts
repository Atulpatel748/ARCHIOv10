import { test, expect, ROUTES } from './fixtures';

// The owner's rule: no word is ever cut across two lines (e.g. "COMMERCIAL-LY" on a wide desktop).
const WIDTHS = [320, 375, 768, 1024, 1280, 1536, 1920];

for (const width of WIDTHS) {
  test(`no word is split across lines at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const split: string[] = [];
    for (const route of [...ROUTES, '/no-such-page']) {
      await page.goto(route);
      await page.waitForLoadState('load');
      const words = await page.evaluate(() => {
        const found: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const parent = (node as Text).parentElement;
          if (!parent || parent.closest('script,style,.visually-hidden,[aria-hidden="true"]')) continue;
          // A compound may break after its hyphen ("sales-/driven"), as in print; each part must stay whole
          const re = /[^\s-]{2,}-?/g;
          let m: RegExpExecArray | null;
          while ((m = re.exec((node as Text).data))) {
            const range = document.createRange();
            range.setStart(node, m.index);
            range.setEnd(node, m.index + m[0].length);
            const lines = new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top)));
            if (lines.size > 1) found.push(m[0]);
          }
        }
        return found;
      });
      split.push(...words.map((w) => `${route}: ${w}`));
    }
    expect(split).toEqual([]);
  });
}
