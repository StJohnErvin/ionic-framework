import type { ElementHandle, Locator } from '@playwright/test';

import type { E2EPage } from './';

export const dragElementBy = async (
  el: Locator | ElementHandle<SVGElement | HTMLElement>,
  page: E2EPage,
  dragByX = 0,
  dragByY = 0,
  startXCoord?: number,
  startYCoord?: number
) => {
  const boundingBox = await el.boundingBox();

  if (!boundingBox) {
    throw new Error(
      'Cannot get a bounding box for an element that is not visible. See https://playwright.dev/docs/api/class-locator#locator-bounding-box for more information'
    );
  }

  const startX = startXCoord === undefined ? boundingBox.x + boundingBox.width / 2 : startXCoord;
  const startY = startYCoord === undefined ? boundingBox.y + boundingBox.height / 2 : startYCoord;

  const midX = startX + dragByX / 2;
  const midY = startY + dragByY / 2;

  const endX = startX + dragByX;
  const endY = startY + dragByY;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(midX, midY);
  await page.mouse.move(endX, endY);
  await page.mouse.up();
};
