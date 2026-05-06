import jwt from 'jsonwebtoken'
import QRCode from 'qrcode'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import crypto from 'crypto' // Natif dans Node.js
import { htmlContent } from './cert-parcels.mjs'

export const generateSecurePDF = async (data: any, payload: any, user: any) => {
  let browser
  const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL

  // 1. Lancement du navigateur
  browser = await puppeteer.launch({
    args: isLocal ? ['--no-sandbox'] : chromium.args,
    executablePath: isLocal
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : await chromium.executablePath(),
    headless: true,
  })

  console.log('Navigateur lancé pour la génération PDF')
  try {
    const page = await browser.newPage()

    // --- PHASE 1 : Génération à blanc pour le Hash ---
    // On génère une première version sans QR code pour avoir le buffer final
    // Ou plus simple : on génère le PDF avec un QR code temporaire
    await page.setContent(htmlContent('', data), { waitUntil: 'networkidle0' })
    const tempBuffer = await page.pdf({ format: 'A4', printBackground: true })

    console.log('PDF temporaire généré')
    // 2. Calcul du Hash SHA-256 (L'empreinte ADN)
    const documentHash = crypto.createHash('sha256').update(tempBuffer).digest('hex')

    // 3. Création du JWT sécurisé incluant le Hash
    const token = jwt.sign(
      {
        id: data.id,
        hash: documentHash, // Crucial pour la vérification d'intégrité
        agent: user?.id,
      },
      process.env.PAYLOAD_SECRET || 'votre_secret',
      { expiresIn: '20y' },
    )

    console.log('JWT sécurisé généré avec le hash du document', token)

    // 4. Génération du QR Code final avec le Token
    const verifyUrl = `https://votre-site.com/verify?t=${token}`
    const qrCodeUrl = await QRCode.toDataURL(verifyUrl)

    // --- PHASE 2 : Rendu final avec le vrai QR Code ---
    await page.setContent(htmlContent(qrCodeUrl, data), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })

    // Petite astuce : attendez que le QR code soit réellement injecté dans le DOM
    await page.waitForSelector('img', { timeout: 5000 }).catch(() => null)

    const finalPdfBuffer = await page.pdf({ format: 'A4', printBackground: true })

    console.log('PDF finalPdfBuffer généré avec le QR code intégré')
    // 5. Enregistrement automatique dans l'Audit Log
    await payload.create({
      collection: 'audit-logs',
      data: {
        agent: user?.id,
        action: `Génération Certificat - Parcelle ${data.Parcelle}`,
        targetId: data.id,
        documentHash: documentHash, // On stocke le hash pour comparaison future
        timestamp: new Date().toISOString(),
      },
    })

    console.log('PDF final généré')
    return { pdfBuffer: finalPdfBuffer }
  } finally {
    if (browser) await browser.close()
  }
}
