import { jest } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fn = () => jest.fn() as jest.MockedFunction<(...args: any[]) => any>;

const puppeteer = {
  launch: fn().mockResolvedValue({
    newPage: fn().mockResolvedValue({
      setContent: fn().mockResolvedValue(undefined),
      pdf: fn().mockResolvedValue(Buffer.from('mock-pdf')),
    }),
    close: fn().mockResolvedValue(undefined),
  }),
};

export default puppeteer;
