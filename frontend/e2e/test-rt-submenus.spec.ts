import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify RT Menus: Agenda RT Background, Data Warga, Data Keluarga, and Peta Wilayah', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Login as RT
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="text"], input[name="login"], input[placeholder*="Username"]', 'rt01');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const artifactDir = 'C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890';

  // TEST 1: Agenda RT (Must have green background and white text, NOT empty outline)
  const agendaButton = page.locator('aside button:has-text("Agenda RT")');
  await expect(agendaButton).toBeVisible();
  await agendaButton.click();
  await page.waitForTimeout(800);

  // Check that Agenda RT has active background styling
  await expect(agendaButton).toHaveClass(/bg-emerald-700/);
  await expect(agendaButton).toHaveClass(/text-white/);
  await expect(page.locator('h2:has-text("Agenda Kegiatan & Jadwal Rapat RT 01")')).toBeVisible();

  await page.screenshot({ path: path.join(artifactDir, '94_RT_Agenda_Active_Green_Background.png') });

  // TEST 2: Data Warga RT
  const dataWargaButton = page.locator('aside button:has-text("Data Warga RT")');
  await expect(dataWargaButton).toBeVisible();
  await dataWargaButton.click();
  await page.waitForTimeout(800);

  await expect(dataWargaButton).toHaveClass(/bg-emerald-700/);
  await expect(page.locator('h2:has-text("Buku Induk Kependudukan & Data Warga RT 01")')).toBeVisible();
  await expect(page.locator('text=Total Warga RT 01')).toBeVisible();

  await page.screenshot({ path: path.join(artifactDir, '95_RT_Data_Warga_View.png') });

  // Open Citizen Detail Modal
  const detailCitizenBtn = page.locator('button:has-text("Detail")').first();
  if (await detailCitizenBtn.isVisible()) {
    await detailCitizenBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, '96_RT_Data_Warga_Detail_Modal.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // TEST 3: Data Keluarga
  const dataKeluargaButton = page.locator('aside button:has-text("Data Keluarga")');
  await expect(dataKeluargaButton).toBeVisible();
  await dataKeluargaButton.click();
  await page.waitForTimeout(800);

  await expect(dataKeluargaButton).toHaveClass(/bg-emerald-700/);
  await expect(page.locator('h2:has-text("Buku Register Kartu Keluarga (KK) RT 01")')).toBeVisible();
  await expect(page.locator('text=Total Kepala Keluarga')).toBeVisible();

  await page.screenshot({ path: path.join(artifactDir, '97_RT_Data_Keluarga_View.png') });

  // Open KK Family Members Modal
  const anggotaBtn = page.locator('button:has-text("Anggota")').first();
  if (await anggotaBtn.isVisible()) {
    await anggotaBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, '98_RT_Data_Keluarga_Members_Modal.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // TEST 4: Peta Wilayah RT
  const petaWilayahButton = page.locator('aside button:has-text("Peta Wilayah RT")');
  await expect(petaWilayahButton).toBeVisible();
  await petaWilayahButton.click();
  await page.waitForTimeout(800);

  await expect(petaWilayahButton).toHaveClass(/bg-emerald-700/);
  await expect(page.locator('h2:has-text("Peta Wilayah, Denah Lingkungan & Sebaran Hunian RT 01")')).toBeVisible();
  await expect(page.locator('text=Denah Tata Ruang Wilayah RT 01 Krajan')).toBeVisible();
  await expect(page.locator('text=Batas Administrasi 4 Arah')).toBeVisible();

  await page.screenshot({ path: path.join(artifactDir, '99_RT_Peta_Wilayah_View.png') });
});
