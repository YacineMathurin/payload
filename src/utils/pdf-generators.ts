import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateVehiclePDF(vehicle: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([595, 842]) // A4 size
  const { width, height } = page.getSize()
  let yPosition = height - 50

  const formatDate = (date: string) => {
    return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A'
  }

  const formatCurrency = (amount: number, devise: string = 'XOF') => {
    return amount ? `${amount.toLocaleString('fr-FR')} ${devise}` : 'N/A'
  }

  const addText = (
    text: string,
    size: number,
    font: any,
    color = rgb(0, 0, 0),
    align: 'left' | 'center' | 'right' = 'left',
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    let x = 50

    if (align === 'center') {
      x = (width - textWidth) / 2
    } else if (align === 'right') {
      x = width - textWidth - 50
    }

    page.drawText(text, {
      x,
      y: yPosition,
      size,
      font,
      color,
    })
    yPosition -= size + 5
  }

  const addField = (label: string, value: any) => {
    const displayValue = value !== undefined && value !== null ? String(value) : 'N/A'
    page.drawText(`${label}: `, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(displayValue, {
      x: 200,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= 20
  }

  const addSection = (title: string) => {
    if (yPosition < 100) {
      page = pdfDoc.addPage([595, 842])
      yPosition = height - 50
    }
    yPosition -= 10
    page.drawText(title, {
      x: 50,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    })
    // Underline
    page.drawLine({
      start: { x: 50, y: yPosition - 3 },
      end: { x: 250, y: yPosition - 3 },
      thickness: 1,
      color: rgb(0.2, 0.2, 0.2),
    })
    yPosition -= 25
  }

  // Header
  addText('RÉPUBLIQUE DU NIGER', 20, helveticaBold, rgb(0, 0, 0), 'center')
  addText('DIRECTION DES DOUANES', 16, helveticaBold, rgb(0, 0, 0), 'center')
  yPosition -= 10
  addText("FICHE D'ENREGISTREMENT VÉHICULE", 18, helveticaBold, rgb(0, 0, 0), 'center')
  yPosition -= 5
  addText(
    `Date d'édition: ${formatDate(new Date().toISOString())}`,
    10,
    helveticaFont,
    rgb(0, 0, 0),
    'right',
  )
  yPosition -= 20

  // Sections
  addSection('INFORMATIONS GÉNÉRALES')
  addField("Numéro d'immatriculation", vehicle.numeroImmatriculation)
  addField('Numéro de série (VIN)', vehicle.numeroSerie)
  addField('Type de véhicule', vehicle.typeVehicule)
  addField('Statut', vehicle.statut)
  addField('Marque', vehicle.marque)
  addField('Modèle', vehicle.modele)
  addField('Année', vehicle.annee)
  addField('Couleur', vehicle.couleur)
  addField('Carburant', vehicle.carburant || 'N/A')
  addField('Cylindrée', vehicle.cylindree ? `${vehicle.cylindree} cm³` : 'N/A')
  addField('Poids', vehicle.poids ? `${vehicle.poids} kg` : 'N/A')
  addField('Numéro moteur', vehicle.numeroMoteur || 'N/A')

  addSection("INFORMATIONS D'ACHAT")
  addField("Date d'achat", formatDate(vehicle.dateAchat))
  addField("Pays d'origine", vehicle.paysOrigine || 'N/A')
  addField("Prix d'achat", formatCurrency(vehicle.prixAchat, vehicle.devise))

  // Footer on all pages
  const pages = pdfDoc.getPages()
  pages.forEach((p) => {
    p.drawText('Document généré automatiquement', {
      x: 150,
      y: 40,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    })
    p.drawText('Direction des Douanes du Niger (AES)', {
      x: 150,
      y: 25,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    })
  })

  return await pdfDoc.save()
}

export async function generateVolPDF(vehicle: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()
  let yPosition = height - 50

  // Header
  page.drawText('DÉCLARATION DE VOL', {
    x: 150,
    y: yPosition,
    size: 20,
    font: helveticaBold,
    color: rgb(0.8, 0, 0),
  })
  yPosition -= 40

  page.drawText(`Véhicule: ${vehicle.numeroImmatriculation}`, {
    x: 50,
    y: yPosition,
    size: 14,
    font: helveticaBold,
  })
  yPosition -= 30

  if (vehicle.informationsVol) {
    page.drawText(
      `Date du vol: ${new Date(vehicle.informationsVol.dateVol).toLocaleDateString('fr-FR')}`,
      {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
      },
    )
    yPosition -= 25

    page.drawText(`Lieu: ${vehicle.informationsVol.lieuVol || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaFont,
    })
    yPosition -= 25

    page.drawText(`Numéro de plainte: ${vehicle.informationsVol.numeroPlainte || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaFont,
    })
  }

  return await pdfDoc.save()
}

/**
 * Génère un PDF pour un changement spécifique de l'historique
 * @param vehicle - Les données complètes du véhicule
 * @param changement - Les données du changement spécifique
 * @param index - L'index du changement dans le tableau
 */
export async function generateHistoriqueChangementPDF(
  vehicle: any,
  changement: any,
  index: number,
): Promise<Uint8Array> {
  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const { width, height } = page.getSize()

  // Charger les polices
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Couleurs
  const primaryColor = rgb(0.2, 0.3, 0.5)
  const secondaryColor = rgb(0.4, 0.4, 0.4)
  const accentColor = rgb(0.0, 0.4, 0.8)

  let yPosition = height - 50

  // === EN-TÊTE ===
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: primaryColor,
  })

  page.drawText('RÉPUBLIQUE DU NIGER', {
    x: 50,
    y: height - 60,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  page.drawText("Ministère de l'Intérieur et de la Sécurité", {
    x: 50,
    y: height - 80,
    size: 12,
    font: font,
    color: rgb(1, 1, 1),
  })

  page.drawText('CERTIFICAT DE CHANGEMENT', {
    x: 50,
    y: height - 105,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  yPosition = height - 150

  // === TYPE DE CHANGEMENT ===
  const typeLabels: Record<string, string> = {
    plaque: "CHANGEMENT DE PLAQUE D'IMMATRICULATION",
    proprietaire: 'CHANGEMENT DE PROPRIÉTAIRE',
    les_deux: 'CHANGEMENT DE PLAQUE ET DE PROPRIÉTAIRE',
  }

  const typeLabel = typeLabels[changement.typeChangement] || 'CHANGEMENT'

  page.drawText(typeLabel, {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: accentColor,
  })

  yPosition -= 30

  // === INFORMATIONS DU VÉHICULE ===
  page.drawText('INFORMATIONS DU VÉHICULE', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })

  yPosition -= 5
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: primaryColor,
  })

  yPosition -= 20

  const vehicleInfo = [
    { label: 'Immatriculation actuelle', value: vehicle.numeroImmatriculation || 'N/A' },
    { label: 'Type de véhicule', value: vehicle.typeVehicule || 'N/A' },
    { label: 'Marque', value: vehicle.marque || 'N/A' },
    { label: 'Modèle', value: vehicle.modele || 'N/A' },
    { label: 'Numéro de série (VIN)', value: vehicle.numeroSerie || 'N/A' },
    { label: 'Couleur', value: vehicle.couleur || 'N/A' },
  ]

  for (const info of vehicleInfo) {
    page.drawText(`${info.label}:`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: secondaryColor,
    })

    page.drawText(info.value, {
      x: 220,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })

    yPosition -= 18
  }

  yPosition -= 10

  // === DÉTAILS DU CHANGEMENT ===
  page.drawText('DÉTAILS DU CHANGEMENT', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })

  yPosition -= 5
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: primaryColor,
  })

  yPosition -= 20

  // Date du changement
  const dateChangement = changement.dateChangement
    ? new Date(changement.dateChangement).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Non spécifiée'

  page.drawText('Date du changement:', {
    x: 50,
    y: yPosition,
    size: 10,
    font: fontBold,
    color: secondaryColor,
  })

  page.drawText(dateChangement, {
    x: 220,
    y: yPosition,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  })

  yPosition -= 25

  // Changement de plaque (si applicable)
  if (changement.typeChangement === 'plaque' || changement.typeChangement === 'les_deux') {
    page.drawText('CHANGEMENT DE PLAQUE', {
      x: 50,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: accentColor,
    })

    yPosition -= 20

    page.drawText('Ancienne plaque:', {
      x: 60,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: secondaryColor,
    })

    page.drawText(changement.anciennePlaque || 'N/A', {
      x: 220,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })

    yPosition -= 18

    page.drawText('Nouvelle plaque:', {
      x: 60,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: secondaryColor,
    })

    page.drawText(changement.nouvellePlaque || 'N/A', {
      x: 220,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })

    yPosition -= 25
  }

  // Changement de propriétaire (si applicable)
  if (changement.typeChangement === 'proprietaire' || changement.typeChangement === 'les_deux') {
    page.drawText('CHANGEMENT DE PROPRIÉTAIRE', {
      x: 50,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: accentColor,
    })

    yPosition -= 20

    page.drawText('Ancien propriétaire:', {
      x: 60,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: secondaryColor,
    })

    page.drawText(changement.ancienProprietaire || 'N/A', {
      x: 220,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })

    yPosition -= 18

    page.drawText('Nouveau propriétaire:', {
      x: 60,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: secondaryColor,
    })

    page.drawText(changement.nouveauProprietaire || 'N/A', {
      x: 220,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })

    yPosition -= 25
  }

  // Motif
  if (changement.motif) {
    page.drawText('Motif du changement:', {
      x: 50,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: secondaryColor,
    })

    yPosition -= 15

    // Diviser le texte en lignes si nécessaire
    const motifLines = wrapText(changement.motif, 70)
    for (const line of motifLines) {
      page.drawText(line, {
        x: 60,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0, 0, 0),
      })
      yPosition -= 14
    }

    yPosition -= 10
  }

  // === INFORMATIONS ADMINISTRATIVES ===
  yPosition -= 10

  page.drawText('INFORMATIONS ADMINISTRATIVES', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })

  yPosition -= 5
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: primaryColor,
  })

  yPosition -= 20

  const adminInfo = [
    {
      label: 'Numéro de référence',
      value: `CHG-${vehicle.numeroImmatriculation}-${String(index + 1).padStart(3, '0')}`,
    },
    {
      label: 'Agent enregistrant',
      value: changement.agentEnregistrement?.name || 'N/A',
    },
    {
      label: 'Officier de saisie',
      value: changement.officierSaisie?.name || 'N/A',
    },
    {
      label: 'Date de saisie',
      value: changement.dateSaisie
        ? new Date(changement.dateSaisie).toLocaleDateString('fr-FR')
        : 'N/A',
    },
  ]

  for (const info of adminInfo) {
    page.drawText(`${info.label}:`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: secondaryColor,
    })

    page.drawText(info.value, {
      x: 220,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })

    yPosition -= 18
  }

  // === PIED DE PAGE ===
  const footerY = 80

  page.drawLine({
    start: { x: 50, y: footerY + 30 },
    end: { x: width - 50, y: footerY + 30 },
    thickness: 0.5,
    color: secondaryColor,
  })

  page.drawText('Ce document est généré automatiquement par le système de gestion des véhicules', {
    x: 50,
    y: footerY + 10,
    size: 8,
    font: font,
    color: secondaryColor,
  })

  const dateGeneration = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  page.drawText(`Généré le: ${dateGeneration}`, {
    x: 50,
    y: footerY - 5,
    size: 8,
    font: font,
    color: secondaryColor,
  })

  // Sauvegarder et retourner le PDF
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/**
 * Fonction utilitaire pour diviser un texte long en plusieurs lignes
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) lines.push(currentLine)
  return lines
}
