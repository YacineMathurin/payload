import type { CollectionConfig } from 'payload'
import { generateSecurePDF } from '../utils/pdfService'
import { RateLimiterMemory } from 'rate-limiter-flexible'

// Autorise 5 requêtes par fenêtre de 60 secondes
const pdfRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
})

export const Parcelles: CollectionConfig = {
  slug: 'parcelles',
  admin: {
    useAsTitle: 'idParcelle',
    defaultColumns: ['idParcelle', 'nom', 'commune', 'statut'],
    components: {
      edit: {
        SaveButton: '@/components/DownloadPDFButton#DownloadPDFButton',
      },
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Info Personnelle',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'nom', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'prenom', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', required: true },
                { name: 'numero', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Bloc Parcelle',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'idParcelle', type: 'text', required: true, label: 'ID Parcelle' },
                { name: 'typeParcelle', type: 'text', label: 'Type de parcelle' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'superficie', type: 'number', label: 'Superficie (m²)' },
                { name: 'commune', type: 'text' },
                { name: 'quartier', type: 'text' },
              ],
            },
            {
              name: 'historiqueProprietaires',
              type: 'textarea',
              label: 'Historique des propriétaires',
            },
            {
              name: 'statut',
              type: 'select',
              required: true,
              options: [
                { label: 'Conflit', value: 'conflit' },
                { label: 'En cours de vérification', value: 'en_cours' },
                { label: 'Aucun conflit', value: 'aucun' },
              ],
              defaultValue: 'aucun',
            },
          ],
        },
      ],
    },
  ],
  // À l'intérieur de ta collection 'parcelles'

  endpoints: [
    {
      path: '/:id/generate-pdf',
      method: 'get',
      handler: async (req) => {
        const { id } = req.routeParams
        const userId = req.user?.id || req.headers.get('x-forwarded-for') // Identifie par l'ID user ou l'IP

        try {
          // --- ÉTAPE DE SÉCURITÉ : RATE LIMITING ---
          try {
            await pdfRateLimiter.consume(userId as string)
          } catch (rejRes) {
            return new Response('Trop de requêtes. Veuillez attendre une minute.', {
              status: 429,
              headers: { 'Retry-After': '60' },
            })
          }

          // 1. Récupération du document
          const doc = (await req.payload.findByID({
            collection: 'parcelles',
            id: id as string,
          })) as any

          if (!doc) return new Response('Document non trouvé', { status: 404 })

          console.log(`Génération PDF pour la parcelle ${doc.idParcelle} demandée par ${userId}`)
          // 2. Appel du service (Traitement RAM pure)
          const { pdfBuffer } = await generateSecurePDF(doc, req.payload, req.user)

          // 3. Réponse directe
          return new Response(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="Certificat-${doc.idParcelle || id}.pdf"`,
              'Content-Length': pdfBuffer.length.toString(),
            },
          })
        } catch (err: any) {
          console.error('Erreur PDF:', err.message)
          return new Response(`Erreur: ${err.message}`, { status: 500 })
        }
      },
    },
  ],
}
