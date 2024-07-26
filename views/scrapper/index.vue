<script setup lang="ts">
import type { Product } from "~/server/services/scrapper";
import { useScraping } from "./composables/useScraping";
import RozetkaProductsDataTable from "~/views/scrapper/components/RozetkaProductsDataTable.vue";

const pending = ref(false);
const url = ref("");

const products = ref<Product[]>([]);

const dataTableConfig = ref({
  isImageVisible: false,
});

const { scrapUrl } = useScraping(products, pending);

const getFixedUrl = (url: string): string => {
  return url.endsWith("/") ? url.slice(0, -1) : url;
};
</script>

<template>
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
              @click="scrapUrl(getFixedUrl(url))"
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
              <ToggleSwitch v-model="dataTableConfig.isImageVisible" />
            </div>
          </div>
        </template>
      </Card>
    </div>
    <RozetkaProductsDataTable :products="products" :config="dataTableConfig" />
  </div>
</template>

<style src="./styles.scss" lang="scss" />
