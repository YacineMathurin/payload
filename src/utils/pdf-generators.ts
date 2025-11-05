export function generateVehiclePDF(doc: PDFKit.PDFDocument, vehicle: any) {
  const formatDate = (date: string) => {
    return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A'
  }

  const formatCurrency = (amount: number, devise: string = 'XOF') => {
    return amount ? `${amount.toLocaleString('fr-FR')} ${devise}` : 'N/A'
  }

  // En-tête officiel
  doc.fontSize(20).font('Helvetica-Bold').text("RÉPUBLIQUE DE CÔTE D'IVOIRE", { align: 'center' })

  doc.fontSize(16).text('DIRECTION DES DOUANES', { align: 'center' }).moveDown()

  doc
    .fontSize(18)
    .text("FICHE D'ENREGISTREMENT VÉHICULE", { align: 'center', underline: true })
    .moveDown()

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Date d'édition: ${formatDate(new Date().toISOString())}`, { align: 'right' })
    .moveDown(2)

  // Section: Informations générales
  addSection(doc, 'INFORMATIONS GÉNÉRALES')
  addField(doc, "Numéro d'immatriculation", vehicle.numeroImmatriculation)
  addField(doc, 'Numéro de série (VIN)', vehicle.numeroSerie)
  addField(doc, 'Type de véhicule', vehicle.typeVehicule)
  addField(doc, 'Statut', vehicle.statut)
  doc.moveDown(0.5)

  addField(doc, 'Marque', vehicle.marque)
  addField(doc, 'Modèle', vehicle.modele)
  addField(doc, 'Année', vehicle.annee)
  addField(doc, 'Couleur', vehicle.couleur)
  addField(doc, 'Carburant', vehicle.carburant || 'N/A')
  addField(doc, 'Cylindrée', vehicle.cylindree ? `${vehicle.cylindree} cm³` : 'N/A')
  addField(doc, 'Poids', vehicle.poids ? `${vehicle.poids} kg` : 'N/A')
  addField(doc, 'Numéro moteur', vehicle.numeroMoteur || 'N/A')

  // Informations d'achat
  doc.addPage()
  addSection(doc, "INFORMATIONS D'ACHAT")
  addField(doc, "Date d'achat", formatDate(vehicle.dateAchat))
  addField(doc, "Pays d'origine", vehicle.paysOrigine || 'N/A')
  addField(doc, "Prix d'achat", formatCurrency(vehicle.prixAchat, vehicle.devise))

  // ... (continuer avec les autres sections)

  // Pied de page
  doc
    .fontSize(8)
    .font('Helvetica-Oblique')
    .text('Document généré automatiquement', 50, doc.page.height - 80, { align: 'center' })
    .text("Direction des Douanes de Côte d'Ivoire", { align: 'center' })
}

export function generateVolPDF(doc: PDFKit.PDFDocument, vehicle: any) {
  const vol = vehicle.informationsVol
  const formatDate = (date: string) => {
    return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A'
  }

  // En-tête avec cadre rouge pour urgence
  doc.rect(50, 50, doc.page.width - 100, 80).fillAndStroke('#ff0000', '#990000')

  doc
    .fillColor('#ffffff')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('⚠️ DÉCLARATION DE VOL', 60, 70, { align: 'center' })

  // ... (continuer avec le reste du PDF)
}

// Fonctions utilitaires
function addSection(doc: PDFKit.PDFDocument, title: string, color: string = '#000000') {
  if (doc.y > 700) doc.addPage()

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(title)
    .fillColor('#000000')
    .moveDown(0.5)

  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .strokeColor(color)
    .lineWidth(2)
    .stroke()
    .moveDown(0.8)
}

function addField(
  doc: PDFKit.PDFDocument,
  label: string,
  value: any,
  bold: boolean = false,
  labelColor: string = '#000000',
) {
  if (doc.y > 720) doc.addPage()

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(labelColor)
    .text(`${label}: `, { continued: true })
    .font(bold ? 'Helvetica-Bold' : 'Helvetica')
    .fillColor('#000000')
    .text(value || 'N/A')
}
