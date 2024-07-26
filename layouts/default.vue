<template>
  <header class="default-layout__header">Header</header>
  <div class="default-layout__content">
    <aside>Aside</aside>
    <main>
      <slot />
    </main>
  </div>
</template>

<style lang="scss">
.default-layout {
  $aside-width: 10rem;

  &__header {
    height: var(--header-height);
  }

  &__content {
    display: flex;
    height: calc(100vh - var(--header-height));

    aside {
      width: $aside-width;
    }

    main {
      width: calc(100vw - $aside-width);
    }
  }
}
</style>
