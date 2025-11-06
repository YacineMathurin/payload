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
  addText("RÉPUBLIQUE DE CÔTE D'IVOIRE", 20, helveticaBold, rgb(0, 0, 0), 'center')
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
