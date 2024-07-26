<script setup lang="ts">
import type { Product } from "~/server/services/scrapper";

const pending = ref(false);
const url = ref("");
const isImageVisible = ref(false);

const columns = ref([
  {
    field: "title",
    header: "title",
  },
  {
    field: "calculatedDiscount",
    header: "discount",
  },
  {
    field: "priceCurrent",
    header: "Price",
  },
  {
    field: "rating",
    header: "rating",
  },
  {
    field: "reviews",
    header: "reviews",
  },
  {
    field: "link",
    header: "link",
  },
]);

const products = ref<Product[]>([]);

const getFixedUrl = (url: string): string => {
  if (url[url.length - 1] === "/") {
    return url.slice(0, -1);
  }
  return url;
};

const scrapUrl = async () => {
  pending.value = true;
  const { data, error } = await useFetch<{ products: Product[] }>(
    "/api/scrape",
    {
      method: "POST",
      body: {
        url: getFixedUrl(url.value),
      },
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
  // products.value = [
  //   {
  //     title: "Маршрутизатор TP-LINK Archer A64",
  //     discount: null,
  //     link: "https://rozetka.com.ua/ua/tp-link-archer-a64/p323263657/",
  //     priceOld: 1599,
  //     priceCurrent: 1399,
  //     calculatedDiscount: "13",
  //     rating: 94,
  //     reviews: 644,
  //     imageSrc:
  //       "https://content2.rozetka.com.ua/goods/images/big_tile/372360252.jpg",
  //   },
  // ];
};

const getSeverity = (percent: number | null) => {
  if (!percent) return null;

  if (percent >= 0 && percent <= 30) return "success";

  if (percent > 30 && percent <= 70) return "warn";

  if (percent > 70) return "danger";

  return null;
};
</script>

<template>
  <!-- TODO -->
  <!-- Фильтрация цены от и до -->
  <div class="scrap-page">
    <div class="scrap-form">
      <Card style="width: 25rem; overflow: hidden">
        <template #title>
          <div class="text-base">Scrapper form</div>
        </template>
        <template #subtitle>
          <div class="text-base">Fill the form to scrap page</div>
        </template>
        <template #content>
          <InputText
            v-model="url"
            placeholder="Enter Rozetka URL"
            :disabled="pending"
          />
        </template>
        <template #footer>
          <div>
            <Button
              type="button"
              label="Process data"
              icon="pi pi-search"
              :loading="pending"
              @click="scrapUrl"
            />
          </div>
        </template>
      </Card>
      <Card class="w-[280px]">
        <template #title>
          <div class="text-base">Table settings</div>
        </template>
        <template #content>
          <div class="flex flex-col gap-y-2">
            <div class="flex items-center justify-between gap-x-2">
              <div class="text-sm opacity-70">Show image preview</div>
              <ToggleSwitch v-model="isImageVisible" />
            </div>
          </div>
        </template>
      </Card>
    </div>
    <DataTable
      v-if="products && products?.length"
      :value="products || []"
      paginator
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      tableStyle="min-width: 50rem"
      sort-mode="multiple"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      :multi-sort-meta="[
        {
          field: 'reviews',
          order: -1,
        },
        {
          field: 'calculatedDiscount',
          order: -1,
        },
      ]"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
    >
      <template #paginatorstart>
        <Button type="button" icon="pi pi-refresh" text />
      </template>
      <template #paginatorend>
        <Button type="button" icon="pi pi-download" text />
      </template>
      <template v-for="col of columns" :key="col.field">
        <Column
          v-if="col.field === 'priceCurrent'"
          sortable=""
          :field="col.field"
          :header="col.header"
          style="width: 100px"
        >
          <template #body="{ data }">
            <div class="price">
              <span>
                {{ data.priceCurrent }}
              </span>
              <small v-if="data.priceOld">
                {{ data.priceOld }}
              </small>
            </div>
          </template>
        </Column>
        <Column
          v-else-if="col.field === 'calculatedDiscount'"
          sortable=""
          :field="col.field"
          :header="col.header"
          style="width: 100px"
        >
          <template #body="{ data }">
            <Tag
              v-if="data.calculatedDiscount"
              :value="data.calculatedDiscount + '%'"
              :severity="getSeverity(data.calculatedDiscount)"
            />
          </template>
        </Column>
        <Column
          v-else-if="col.field === 'title'"
          sortable=""
          :field="col.field"
          :header="col.header"
        >
          <template #body="{ data }">
            <template v-if="isImageVisible">
              <div
                style="
                  width: 400px;
                  overflow: auto;
                  white-space: nowrap;
                  scrollbar-width: none;
                "
                class="flex gap-4 items-center"
              >
                <Image
                  :src="data.imageSrc"
                  alt="Image"
                  width="90"
                  class="rounded-lg overflow-auto"
                  preview
                />
                <div class="max-w-[200px] whitespace-pre-wrap">
                  {{ data?.title }}
                </div>
              </div>
            </template>
            <div
              v-else
              style="
                width: 400px;
                overflow: auto;
                white-space: nowrap;
                scrollbar-width: none;
              "
            >
              {{ data?.title }}
            </div>
          </template>
        </Column>
        <Column
          v-else-if="col.field === 'link'"
          sortable=""
          :field="col.field"
          :header="col.header"
          style="width: 100px"
        >
          <template #body="{ data }">
            <a :href="data?.link" target="_blank"> Visit </a>
          </template>
        </Column>
        <Column
          v-else-if="col.field === 'rating'"
          sortable=""
          :field="col.field"
          :header="col.header"
          style="width: 100px"
        />
        <Column
          v-else
          :field="col.field"
          :header="col.header"
          sortable=""
        ></Column>
      </template>
    </DataTable>
  </div>
</template>

<style lang="scss">
.scrap-page {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  .p-datatable {
    margin-top: 1rem;
    width: 1080px;
    border-radius: var(--base-border-radius);
    overflow: hidden;
  }
  .price {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    small {
      text-decoration: line-through;
      opacity: 0.5;
    }
  }
}
.scrap-form {
  display: flex;
  justify-content: center;
  gap: 0.5rem;

  input {
    width: 100%;
  }

  button {
    width: 100%;
  }
}
</style>
