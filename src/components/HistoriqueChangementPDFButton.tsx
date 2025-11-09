'use client'

import React from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'
import { useParams } from 'next/navigation'

/**
 * Alternative utilisant useField pour récupérer le contexte
 * Cette version essaie plusieurs méthodes pour obtenir l'index
 */
export const HistoriqueChangementPDFButton: React.FC = () => {
  const [loading, setLoading] = React.useState(false)

  // Méthode 1: useDocumentInfo pour l'ID
  const documentInfo = useDocumentInfo()
  const vehicleId = documentInfo?.id

  // Méthode 2: useParams (Next.js) comme fallback
  const params = useParams()
  const vehicleIdFromParams = params?.id

  // Méthode 3: useField pour accéder au path du champ parent
  const fieldContext = useField()

  // Essayer d'extraire l'index de différentes sources
  let index: number | null = null

  // Depuis le fieldContext
  if (fieldContext?.path) {
    const pathParts = fieldContext.path.split('.')
    const lastPart = pathParts[pathParts.length - 1]
    const parsedIndex = parseInt(lastPart)
    if (!isNaN(parsedIndex)) {
      index = parsedIndex
    }
  }

  // Si on a toujours pas l'index, essayer de le trouver dans le path parent
  if (index === null && fieldContext?.path) {
    // Le path pourrait être "historiqueChangements.0.pdfButton"
    const pathParts = fieldContext.path.split('.')
    if (pathParts.length >= 2) {
      const potentialIndex = parseInt(pathParts[pathParts.length - 2])
      if (!isNaN(potentialIndex)) {
        index = potentialIndex
      }
    }
  }

  const finalVehicleId = vehicleId || vehicleIdFromParams

  // console.log('HistoriqueChangementPDFButton Debug:', {
  //   vehicleId,
  //   vehicleIdFromParams,
  //   finalVehicleId,
  //   index,
  //   fieldContext,
  //   fieldPath: fieldContext?.path,
  //   documentInfo,
  // })

  const handleGeneratePDF = async () => {
    // console.log('handleGeneratePDF called', { finalVehicleId, index })

    if (!finalVehicleId || index === null || index < 0 || isNaN(index)) {
      const errorMsg = `Impossible de générer le PDF.\nID: ${finalVehicleId}\nIndex: ${index}`
      console.error(errorMsg)
      alert(errorMsg)
      return
    }

    setLoading(true)

    try {
      const url = `/api/vehicles/generate-historique-pdf/${finalVehicleId}/${index}`
      // console.log('Fetching:', url)

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      })

      // console.log('Response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la génération'
        try {
          const error = await response.json()
          errorMessage = error.error || error.message || errorMessage
        } catch {
          errorMessage = `Erreur HTTP ${response.status}`
        }
        throw new Error(errorMessage)
      }

      // Télécharge le PDF
      const blob = await response.blob()
      // console.log('PDF blob received, size:', blob.size)

      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `changement-vehicule-${finalVehicleId}-${index + 1}.pdf`
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
      }, 100)

      // console.log('PDF download initiated successfully')
    } catch (error) {
      console.error('Erreur complète:', error)
      alert(`Erreur:\n${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || !finalVehicleId || index === null || index < 0 || isNaN(index)

  return (
    <div
      style={{
        marginTop: '1rem',
        marginBottom: '1rem',
        padding: '0.75rem',
        background: '#f1f5f9',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
      }}
    >
      <button
        type="button"
        onClick={handleGeneratePDF}
        disabled={isDisabled}
        style={{
          padding: '0.625rem 1.25rem',
          backgroundColor: isDisabled ? '#94a3b8' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = '#3b82f6'
          }
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>📄</span>
        {loading ? 'Génération en cours...' : 'Générer le PDF de ce changement'}
      </button>

      {/* Message de debug */}
      <div
        style={{
          fontSize: '0.75rem',
          color: '#64748b',
          marginTop: '0.75rem',
          padding: '0.5rem',
          background: 'white',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
        }}
      >
        {/* <div>
          <strong>Debug Info:</strong>
        </div>
        <div>• Vehicle ID: {String(finalVehicleId || 'N/A')}</div>
        <div>• Index: {String(index ?? 'N/A')}</div>
        <div>• Field Path: {fieldContext?.path || 'N/A'}</div>
        <div>• Status: {isDisabled ? '❌ Désactivé' : '✅ Prêt'}</div> */}
      </div>
    </div>
  )
}

export default HistoriqueChangementPDFButton
