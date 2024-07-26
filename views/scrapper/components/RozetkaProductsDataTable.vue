<script setup lang="ts">
import type { Product } from "~/server/services/scrapper";
import { ref } from "vue";
import { useSeverity } from "~/views/scrapper/composables/useSeverity";

interface Config {
  isImageVisible: boolean;
}

const { getSeverity } = useSeverity();

const columns = ref([
  { field: "title", header: "title" },
  { field: "calculatedDiscount", header: "discount" },
  { field: "priceCurrent", header: "Price" },
  { field: "rating", header: "rating" },
  { field: "reviews", header: "reviews" },
  { field: "link", header: "link" },
]);

defineProps<{
  products: Product[];
  config: Config;
}>();
</script>

<template>
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
        :sortable="true"
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
        :sortable="true"
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
        :sortable="true"
        :field="col.field"
        :header="col.header"
      >
        <template #body="{ data }">
          <template v-if="config.isImageVisible">
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
        :sortable="true"
        :field="col.field"
        :header="col.header"
        style="width: 100px"
      >
        <template #body="{ data }">
          <a
            :href="data?.link"
            target="_blank"
            class="p-2 rounded-lg bg-green-700 visited:bg-green-950 text-sm"
          >
            Visit
          </a>
        </template>
      </Column>
      <Column
        v-else-if="col.field === 'rating'"
        :sortable="true"
        :field="col.field"
        :header="col.header"
        style="width: 100px"
      />
      <Column
        v-else
        :field="col.field"
        :header="col.header"
        :sortable="true"
      ></Column>
    </template>
  </DataTable>
</template>
