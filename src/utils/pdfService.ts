import jwt from 'jsonwebtoken'
import QRCode from 'qrcode'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { htmlContent } from './cert-parcels.mjs'

export const generateSecurePDF = async (data: any) => {
  // 1. Signer les données (Sécurité)
  const token = jwt.sign(
    { id: data.id, parcelle: data.Parcelle, ilot: data.Ilot },
    process.env.PAYLOAD_SECRET || 'votre_secret',
    { expiresIn: '20y' },
  )

  // 2. Générer le QR Code pointant vers votre page de vérification
  const verifyUrl = `https://votre-site.com/verify?token=${token}`
  const qrCodeUrl = await QRCode.toDataURL(verifyUrl)

  // 3. Préparer le HTML final
  const finalHtml = htmlContent(qrCodeUrl, data)

  let browser

  // Vérifie si on tourne sur Windows (développement)
  const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL

  if (isLocal) {
    // En LOCAL : On utilise le Chrome installé sur votre PC
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      // Chemin typique de Chrome sur Windows.
      // Vérifiez si ce chemin est correct pour vous ou utilisez 'puppeteer' (sans -core)
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    })
  } else {
    // En PRODUCTION (Vercel) : On utilise l'exécutable léger de @sparticuz
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  const page = await browser.newPage()
  await page.setContent(finalHtml, { waitUntil: 'networkidle0' })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  })

  await browser.close()
  return pdfBuffer
}
