import { defineEventHandler, readBody } from "h3";
import Scraper, { Product } from "../services/scrapper";

interface ScrapeRequestBody {
  url: string;
}

export interface ScrapeResponse {
  products: Product[];
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ScrapeRequestBody>(event);

  if (!body.url) {
    return { error: "URL is required" };
  }

  const scraper = new Scraper(body.url);
  await scraper.initialize();
  await scraper.scrape();
  const results = scraper.getResults();
  await scraper.close();

  return { products: results };
});
