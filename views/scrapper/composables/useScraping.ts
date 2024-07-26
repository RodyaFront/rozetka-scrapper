import type { Product } from "~/server/services/scrapper";
import type { Ref } from "vue";

export function useScraping(products: Ref<Product[]>, pending: Ref<boolean>) {
  const scrapUrl = async (url: string) => {
    pending.value = true;
    const { data, error } = await useFetch<{ products: Product[] }>(
      "/api/scrape",
      {
        method: "POST",
        body: { url },
      },
    );

    pending.value = false;
    setTimeout(() => {
      pending.value = false;
    }, 1500);

    if (error.value) {
      console.error(error.value);
    }

    products.value = data.value?.products || [];
  };

  return { scrapUrl };
}
