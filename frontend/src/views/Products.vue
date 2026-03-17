<template>
  <div class="products-page">
    <div class="search-bar">
      <van-search v-model="keyword" placeholder="搜索商品" shape="round" @search="onSearch" />
    </div>

    <div class="category-nav">
      <div class="category-scroll">
        <a class="category-item" :class="{ active: !selectedCat }" @click="selectCategory(null)">全部</a>
        <a v-for="cat in categories" :key="cat.id" class="category-item" :class="{ active: selectedCat === cat.id }" @click="selectCategory(cat.id)">{{ cat.name }}</a>
      </div>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="loadProducts">
      <van-loading v-if="loading" class="page-loading" size="28" vertical>加载中...</van-loading>
      <van-empty v-else-if="!products.length" description="暂无商品" />
      <div v-else class="product-grid">
        <div v-for="p in products" :key="p.id" class="product-card" @click="$router.push(`/products/${p.id}`)">
          <div class="product-img">
            <img v-if="p.coverImage" :src="p.coverImage" :alt="p.name" />
            <div v-else class="product-placeholder"><van-icon name="photo-o" size="36" color="#ccc" /></div>
          </div>
          <div class="product-info">
            <h4>{{ p.name }}</h4>
            <p class="product-desc">{{ p.description }}</p>
            <div class="product-bottom">
              <span class="price">¥{{ p.price }}</span>
              <span v-if="p.originalPrice" class="original-price">¥{{ p.originalPrice }}</span>
              <span class="sales">已售{{ p.sales || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </van-pull-refresh>

    <div style="height: 70px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { productApi } from '@/api';

const keyword = ref('');
const categories = ref([]);
const selectedCat = ref(null);
const products = ref([]);
const loading = ref(true);
const refreshing = ref(false);

const loadProducts = async () => {
  try {
    const params = {};
    if (selectedCat.value) params.categoryId = selectedCat.value;
    if (keyword.value) params.keyword = keyword.value;
    const res = await productApi.list(params);
    products.value = res.data?.list || [];
  } catch { products.value = []; }
  loading.value = false;
  refreshing.value = false;
};

const selectCategory = (id) => {
  selectedCat.value = id;
  loading.value = true;
  loadProducts();
};

const onSearch = () => {
  loading.value = true;
  loadProducts();
};

onMounted(async () => {
  try {
    const res = await productApi.categories();
    categories.value = res.data || [];
  } catch { /* empty */ }
  await loadProducts();
});
</script>

<style scoped>
.products-page { background: var(--jym-bg); min-height: 100vh; }
.search-bar { background: #fff; padding: 8px 0; position: sticky; top: 0; z-index: 10; }

.category-nav { background: #fff; border-bottom: 0.5px solid rgba(0,0,0,0.08); position: sticky; top: 54px; z-index: 10; }
.category-scroll { display: flex; overflow-x: auto; scrollbar-width: none; padding: 0 12px; }
.category-scroll::-webkit-scrollbar { display: none; }
.category-item { flex-shrink: 0; padding: 12px 16px; font-size: 14px; color: var(--jym-text-secondary); cursor: pointer; white-space: nowrap; position: relative; }
.category-item.active { color: var(--jym-dark); font-weight: 600; }
.category-item.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 24px; height: 2px; background: var(--jym-primary); border-radius: 1px; }

.page-loading { padding: 40px 0; text-align: center; }

.product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; }
.product-card { background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.25s; }
.product-card:active { transform: scale(0.97); }
.product-img { height: 160px; background: #f5f5f5; overflow: hidden; }
.product-img img { width: 100%; height: 100%; object-fit: cover; }
.product-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.product-info { padding: 10px 12px 14px; }
.product-info h4 { font-size: 14px; font-weight: 600; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-desc { font-size: 12px; color: var(--jym-text-secondary); margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-bottom { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
.price { font-size: 16px; font-weight: 700; color: #f5576c; }
.original-price { font-size: 12px; color: #999; text-decoration: line-through; }
.sales { font-size: 11px; color: #bbb; margin-left: auto; }
</style>
