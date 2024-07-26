import puppeteer from "puppeteer";
import Scraper from "./scrapper";
import type { Product } from "./scrapper";

jest.mock("puppeteer");

const mockedPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;
const mockedBrowser = {
  newPage: jest.fn(),
  close: jest.fn(),
};
const mockedPage = {
  goto: jest.fn(),
  evaluate: jest.fn(),
};

mockedPuppeteer.launch.mockResolvedValue(mockedBrowser as any);
mockedBrowser.newPage.mockResolvedValue(mockedPage as any);

describe("Scraper", () => {
  let scraper: Scraper;

  beforeEach(() => {
    scraper = new Scraper("https://example.com");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("initialize should launch browser and open a new page", async () => {
    await scraper.initialize();

    expect(mockedPuppeteer.launch).toHaveBeenCalled();
    expect(mockedBrowser.newPage).toHaveBeenCalled();
  });

  test("close should close the browser", async () => {
    await scraper.initialize();
    await scraper.close();

    expect(mockedBrowser.close).toHaveBeenCalled();
  });

  test("buildUrl should return correct URL for page 1", () => {
    const url = scraper.buildUrl(1);
    expect(url).toBe("https://example.com");
  });

  test("buildUrl should return correct URL for other pages", () => {
    const url = scraper.buildUrl(2);
    expect(url).toBe("https://example.com;page=2");
  });

  test("getPagesAmount should return the number of pages", async () => {
    await scraper.initialize();
    mockedPage.goto.mockResolvedValueOnce(undefined);
    mockedPage.evaluate.mockResolvedValueOnce(5);

    const pagesAmount = await scraper.getPagesAmount();

    expect(mockedPage.goto).toHaveBeenCalledWith("https://example.com", {
      waitUntil: "networkidle2",
    });
    expect(pagesAmount).toBe(5);
  });

  test("scrapePage should scrape products from a page", async () => {
    const products: Product[] = [
      {
        title: "Product 1",
        discount: null,
        calculatedDiscount: null,
        priceOld: null,
        priceCurrent: null,
        link: "https://example.com/product1",
        rating: null,
        reviews: null,
        imageSrc: "https://example.com/image1.jpg",
      },
    ];

    await scraper.initialize();
    mockedPage.goto.mockResolvedValueOnce(undefined);
    mockedPage.evaluate.mockResolvedValueOnce(products);

    await scraper.scrapePage(1);

    expect(mockedPage.goto).toHaveBeenCalledWith("https://example.com", {
      waitUntil: "networkidle2",
    });
    expect(scraper.getResults()).toEqual(products);
  });

  test("scrape should scrape all pages", async () => {
    const products: Product[] = [
      {
        title: "Product 1",
        discount: null,
        calculatedDiscount: null,
        priceOld: null,
        priceCurrent: null,
        link: "https://example.com/product1",
        rating: null,
        reviews: null,
        imageSrc: "https://example.com/image1.jpg",
      },
    ];

    await scraper.initialize();

    mockedPage.goto.mockResolvedValue(undefined);
    mockedPage.evaluate
      .mockResolvedValueOnce(2) // getPagesAmount
      .mockResolvedValue(products);

    await scraper.scrape();

    // First - .goto called when getPagesAmount(), than .goto called each one on page
    // Result = 1 + mockPage.evaluate.mockResolvedValueOnce(2) = 3
    expect(mockedPage.goto).toHaveBeenCalledTimes(3);
    expect(scraper.getResults()).toEqual([...products, ...products]);
  });
});
