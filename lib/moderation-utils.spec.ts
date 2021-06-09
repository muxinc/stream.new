import { getThumbnailUrls } from './moderation-utils';

test('gets 3 urls that are within the duration range', async () => {
  const duration = 30;
  const files = getThumbnailUrls({ playbackId: '123', duration });
  expect(files.length).toEqual(5);
  const urls = files.map((file) => new URL(file));
  urls.forEach((url) => {
    const time = +(url.searchParams.get('time') as string);
    expect(time).toBeGreaterThan(0);
    expect(time).toBeLessThan(duration);
  });

  const [url1, url2, url3, url4, url5] = urls;
  expect(+(url1.searchParams.get('time') as string)).toBeLessThan(+(url2.searchParams.get('time') as string));
  expect(+(url2.searchParams.get('time') as string)).toBeLessThan(+(url3.searchParams.get('time') as string));
  expect(+(url3.searchParams.get('time') as string)).toBeLessThan(+(url4.searchParams.get('time') as string));
  expect(+(url4.searchParams.get('time') as string)).toBeLessThan(+(url5.searchParams.get('time') as string));
});
