const storageKeyRenames: Record<string, string> = {
  sides_rt_active_tab: 'nexora_rt_active_tab',
  sides_apbdes_is_published: 'nexora_apbdes_is_published',
  sides_bansos_cache: 'nexora_bansos_cache',
  sidesku_pwa_dismissed: 'nexora_pwa_dismissed',
  sidesku_push_banner_dismissed: 'nexora_push_banner_dismissed',
  sidesku_smartcity_umkm_v2: 'nexora_smartcity_umkm_v3',
  sidesku_smartcity_umkm_v3: 'nexora_smartcity_umkm_v3',
  nexora_smartcity_umkm_v2: 'nexora_smartcity_umkm_v3',
  sidesku_smartcity_kos_data: 'nexora_smartcity_kos_data',
  sidesku_smartcity_loker_data: 'nexora_smartcity_loker_data',
  sidesku_smartcity_lamaran_data: 'nexora_smartcity_lamaran_data',
  sidesku_user_smartcity_location: 'nexora_user_smartcity_location',
  sidesku_agenda_events_v2: 'nexora_agenda_events_v2',
  sidesku_desa_visi: 'nexora_desa_visi',
  sidesku_desa_misi: 'nexora_desa_misi',
  sidesku_custom_boundary: 'nexora_custom_boundary',
  sidesku_dynamic_rbac_matrix: 'nexora_dynamic_rbac_matrix',
};

const migrateStorage = (storage: Storage, includeDashboardTabs = false) => {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((key): key is string => Boolean(key));

  keys.forEach((oldKey) => {
    let newKey = storageKeyRenames[oldKey];
    if (!newKey && includeDashboardTabs && oldKey.startsWith('sides_active_dashboard_tab')) {
      newKey = oldKey.replace('sides_active_dashboard_tab', 'nexora_active_dashboard_tab');
    }
    if (!newKey) return;

    const value = storage.getItem(oldKey);
    if (value !== null && storage.getItem(newKey) === null) storage.setItem(newKey, value);
    storage.removeItem(oldKey);
  });
};

export const migrateLegacyBrandStorage = () => {
  try {
    migrateStorage(window.localStorage, true);
    migrateStorage(window.sessionStorage);
  } catch {
    // Storage can be unavailable in private browsing or restricted web views.
  }
};
