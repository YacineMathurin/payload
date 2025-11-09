'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const HistoriqueChangementRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<any>()

  console.log('=== HistoriqueChangementRowLabel Debug ===')
  console.log('data:', data)
  console.log('rowNumber:', rowNumber)

  const typeLabels = {
    plaque: '🔖 Changement de plaque',
    proprietaire: '👤 Changement de propriétaire',
    les_deux: '🔄 Changement plaque + propriétaire',
  }

  const typeLabel = typeLabels[data?.typeChangement as keyof typeof typeLabels] || 'Changement'

  // Déterminer la couleur selon le type - Rouge pour changement de plaque
  const isPlateChange = data?.typeChangement === 'plaque'
  const labelColor = isPlateChange ? '#dc2626' : '#1e293b'
  const backgroundColor = isPlateChange ? '#fee2e2' : 'transparent'

  // Formater la date
  const dateStr = data?.dateChangement
    ? new Date(data.dateChangement).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Date non définie'

  // Informations additionnelles selon le type
  let additionalInfo = ''
  if (data?.typeChangement === 'plaque' || data?.typeChangement === 'les_deux') {
    const oldPlate = data?.anciennePlaque || '?'
    const newPlate = data?.nouvellePlaque || '?'
    additionalInfo = ` (${oldPlate} → ${newPlate})`
  } else if (data?.typeChangement === 'proprietaire') {
    const newOwner = data?.nouveauProprietaire || 'Non spécifié'
    const oldOwner = data?.ancienProprietaire || 'Non spécifié'
    additionalInfo = ` (${oldOwner} → ${newOwner})`
  }

  return (
    <span
      style={{
        fontWeight: 600,
        color: labelColor,
        backgroundColor: backgroundColor,
        padding: isPlateChange ? '0.25rem 0.5rem' : '0',
        borderRadius: isPlateChange ? '0.25rem' : '0',
        display: 'inline-block',
        transition: 'all 0.2s',
      }}
    >
      {typeLabel} - {dateStr}
      <span style={{ fontWeight: 400, fontSize: '0.9em', opacity: 0.8 }}>{additionalInfo}</span>
    </span>
  )
}

export default HistoriqueChangementRowLabel
