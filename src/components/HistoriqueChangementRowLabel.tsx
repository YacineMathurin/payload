'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

/**
 * Composant bouton pour générer le PDF d'un changement spécifique
 * Utilisé dans chaque élément du tableau historiqueChangements
 */
export const HistoriqueChangementPDFButton: React.FC = () => {
  const [loading, setLoading] = React.useState(false)

  // Récupère les données du formulaire via le hook Payload
  const formFields = useFormFields(([fields]) => fields)

  // Récupère l'ID du véhicule et l'index du changement actuel
  const vehicleId = formFields?.id?.value
  const path = formFields?.path?.value as string | undefined

  // Extrait l'index du chemin
  const index = path ? parseInt(path.split('.')[1]) : null

  const handleGeneratePDF = async () => {
    if (!vehicleId || index === null) {
      alert('Impossible de générer le PDF. Données manquantes.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/vehicles/generate-historique-pdf/${vehicleId}/${index}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la génération')
      }

      // Télécharge le PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `changement-${vehicleId}-${index + 1}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={handleGeneratePDF}
        disabled={loading || !vehicleId || index === null}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: loading ? '#94a3b8' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>📄</span>
        {loading ? 'Génération en cours...' : 'Générer le PDF de ce changement'}
      </button>
    </div>
  )
}

export default HistoriqueChangementPDFButton
