import type { CollectionConfig } from 'payload'
import { generateSecurePDF } from '../utils/pdfService'

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
  endpoints: [
    {
      path: '/:id/generate-pdf',
      method: 'get',
      handler: async (req) => {
        const { id } = req.routeParams

        try {
          // Correction 1 : Cast en 'any' pour accéder à doc.id et doc.Parcelle
          const doc = (await req.payload.findByID({
            collection: 'parcelles',
            id: id as string,
          })) as any

          if (!doc) {
            return new Response('Document non trouvé', { status: 404 })
          }

          // Appel de votre service (qui utilise Puppeteer)
          const pdfBuffer = await generateSecurePDF(doc)

          // Correction 2 : Conversion explicite pour la Response
          return new Response(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="Certificat-${doc.idParcelle || 'parcelle'}.pdf"`,
              'Content-Length': pdfBuffer.length.toString(),
            },
          })
        } catch (err: any) {
          console.error(err)
          return new Response(`Erreur: ${err.message}`, { status: 500 })
        }
      },
    },
  ],
}
