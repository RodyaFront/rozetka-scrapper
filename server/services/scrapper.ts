import puppeteer, { Browser, Page } from "puppeteer";

const PAGINATION_SELECTOR = ".pagination";
const PAGINATION_ITEM_SELECTOR = ".pagination__item:last-child";
const CATALOG_GRID_SELECTOR = ".catalog-grid__cell";
const AVAILABILITY_SELECTOR = ".goods-tile__availability";
const OLD_PRICE_SELECTOR = ".goods-tile__price--old";
const CURRENT_PRICE_SELECTOR = ".goods-tile__price";
const TITLE_SELECTOR = ".goods-tile__title";
const DISCOUNT_SELECTOR =
  ".goods-tile__label.promo-label.promo-label_type_action.ng-star-inserted";
const PRODUCT_LINK_SELECTOR = "a.product-link";
const RATING_SELECTOR = ".stars__rating";
const REVIEWS_SELECTOR = ".rating-block-content";
const IMAGE_SELECTOR = "a.product-link img";

export interface Product {
  title: string;
  discount: number | null;
  calculatedDiscount: number | string | null;
  priceOld: number | null;
  priceCurrent: number | null;
  link: string | null;
  rating: number | null;
  reviews: number | null;
  imageSrc: string | null;
}

class Scraper {
  private browser!: Browser;
  private page!: Page;
  private totalProducts: Product[] = [];

  constructor(private url: string) {}

  async initialize() {
    this.browser = await puppeteer.launch({ headless: true });
    this.page = await this.browser.newPage();
  }

  async close() {
    await this.browser.close();
  }

  buildUrl(pageNumber: number): string {
    return pageNumber === 1 ? this.url : `${this.url};page=${pageNumber}`;
  }

  async getPagesAmount(): Promise<number> {
    await this.page.goto(this.url, { waitUntil: "networkidle2" });
    return await this.page.evaluate(
      (paginationSelector, paginationItemSelector) => {
        return parseInt(
          // @ts-ignore
          document
            .querySelector(paginationSelector)
            ?.querySelector(paginationItemSelector)?.innerText ?? "1",
        );
      },
      PAGINATION_SELECTOR,
      PAGINATION_ITEM_SELECTOR,
    );
  }

  async scrapePage(pageNumber: number) {
    const url = this.buildUrl(pageNumber);
    await this.page.goto(url, { waitUntil: "networkidle2" });

    const result: Product[] = await this.page.evaluate(
      (
        catalogGridSelector,
        availabilitySelector,
        oldPriceSelector,
        currentPriceSelector,
        titleSelector,
        discountSelector,
        productLinkSelector,
        ratingSelector,
        reviewsSelector,
        imageSelector,
      ) => {
        const parseDiscountText = (text: string | null): number | null =>
          text ? Number(text.replace(/−/g, "").replace(/%/g, "")) : null;
        const calculateDiscount = (
          oldPrice: number | null,
          currentPrice: number | null,
        ): number | null => {
          if (!oldPrice || !currentPrice) return null;
          return (((oldPrice - currentPrice) / oldPrice) * 100).toFixed(
            0,
          ) as unknown as number;
        };
        const parsePrice = (price: string | null): number | null =>
          price ? parseInt(price.replace(/ /g, ""), 10) : null;
        const parseRating = (style: string | null): number | null => {
          if (!style) return null;
          const match = style.match(/calc\((\d+)%/);
          return match ? parseInt(match[1], 10) : null;
        };
        const parseReviews = (text: string | null): number | null =>
          text ? parseInt(text.trim()) : null;

        const items: Product[] = [];
        // @ts-ignore
        document.querySelectorAll(catalogGridSelector).forEach((item) => {
          const status = item
            .querySelector(availabilitySelector)
            ?.innerText.trim()
            .toLowerCase();
          if (status === "закінчився" || status === "немає в наявності") return;

          const priceOld = parsePrice(
            item.querySelector(oldPriceSelector)?.innerText,
          );
          const priceCurrent = parsePrice(
            item.querySelector(currentPriceSelector)?.innerText,
          );

          const ratingStyle = item
            .querySelector(ratingSelector)
            ?.getAttribute("style");
          const rating = parseRating(ratingStyle);

          const reviewsText = item.querySelector(reviewsSelector)?.innerText;
          const reviews = parseReviews(reviewsText);

          const imageSrc =
            item.querySelector(imageSelector)?.getAttribute("src") ?? null;

          items.push({
            title: item.querySelector(titleSelector)?.innerText ?? "",
            discount: parseDiscountText(
              item.querySelector(discountSelector)?.innerText ?? null,
            ),
            link:
              item.querySelector(productLinkSelector)?.getAttribute("href") ??
              null,
            priceOld,
            priceCurrent,
            calculatedDiscount: calculateDiscount(priceOld, priceCurrent),
            rating,
            reviews,
            imageSrc,
          });
        });

        return items;
      },
      CATALOG_GRID_SELECTOR,
      AVAILABILITY_SELECTOR,
      OLD_PRICE_SELECTOR,
      CURRENT_PRICE_SELECTOR,
      TITLE_SELECTOR,
      DISCOUNT_SELECTOR,
      PRODUCT_LINK_SELECTOR,
      RATING_SELECTOR,
      REVIEWS_SELECTOR,
      IMAGE_SELECTOR,
    );

    this.totalProducts = [...this.totalProducts, ...result];
  }

  async scrape() {
    const pagesAmount = await this.getPagesAmount();

    for (let pageNumber = 1; pageNumber <= pagesAmount; pageNumber++) {
      await this.scrapePage(pageNumber);
    }
  }

  getResults(): Product[] {
    return this.totalProducts;
  }
}

export default Scraper;
