import { CollectionConfig } from 'payload'
import {
  generateVehiclePDF,
  generateVolPDF,
  generateHistoriqueChangementPDF,
} from '../utils/pdf-generators'

// Collection principale des véhicules avec UI améliorée
export const Vehicles: CollectionConfig = {
  slug: 'vehicles',
  admin: {
    useAsTitle: 'numeroImmatriculation',
    defaultColumns: ['numeroImmatriculation', 'typeVehicule', 'marque', 'modele', 'statut'],
    group: "Ministère de l'interieur",
    description: '🚗 Gestion complète du registre des véhicules',
    components: {
      edit: {
        SaveButton: '@/components/VehicleEditActions',
      },
    },
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req: { user } }) => user?.role === 'super-admin',
  },
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        if (req.user) {
          if (operation === 'create') {
            data.agentEnregistrement = req.user.id
          }
          data.dernierAgentModification = req.user.id
          data.dateDerniereModification = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // When a vehicle is marked as stolen
        if (
          doc.statut === 'vole' &&
          doc.informationsVol &&
          (!previousDoc || previousDoc.statut !== 'vole')
        ) {
          const existingAvis = await req.payload.find({
            collection: 'avis-recherche' as any,
            where: {
              numeroImmatriculation: { equals: doc.numeroImmatriculation },
            },
            limit: 1,
          })

          if (existingAvis.docs.length === 0) {
            await req.payload.create({
              collection: 'avis-recherche' as any,
              data: {
                vehicule: doc.id,
                numeroImmatriculation: doc.numeroImmatriculation,
                typeVehicule: doc.typeVehicule,
                marque: doc.marque,
                modele: doc.modele,
                couleur: doc.couleur,
                numeroSerie: doc.numeroSerie,
                dateVol: doc.informationsVol.dateVol,
                lieuVol: doc.informationsVol.lieuVol,
                ville: doc.informationsVol.ville,
                declarant: doc.informationsVol.declarant,
                telephoneDeclarant: doc.informationsVol.telephoneDeclarant,
                emailDeclarant: doc.informationsVol.emailDeclarant,
                circonstances: doc.informationsVol.circonstances,
                agentEnregistrement: req.user?.id,
                officierSaisie: doc.informationsVol.officierSaisie,
                statutRecherche: 'actif',
              },
            })
          } else {
            const existingDoc = existingAvis.docs[0]
            if (existingDoc.statutRecherche !== 'actif') {
              await req.payload.update({
                collection: 'avis-recherche' as any,
                id: existingDoc.id,
                data: {
                  vehicule: doc.id,
                  typeVehicule: doc.typeVehicule,
                  marque: doc.marque,
                  modele: doc.modele,
                  couleur: doc.couleur,
                  numeroSerie: doc.numeroSerie,
                  dateVol: doc.informationsVol.dateVol,
                  lieuVol: doc.informationsVol.lieuVol,
                  ville: doc.informationsVol.ville,
                  declarant: doc.informationsVol.declarant,
                  telephoneDeclarant: doc.informationsVol.telephoneDeclarant,
                  emailDeclarant: doc.informationsVol.emailDeclarant,
                  circonstances: doc.informationsVol.circonstances,
                  agentEnregistrement: req.user?.id,
                  officierSaisie: doc.informationsVol.officierSaisie,
                  statutRecherche: 'actif',
                },
              })
            }
          }
        }

        // When vehicle is recovered
        if (doc.informationsRecuperation && !previousDoc?.informationsRecuperation) {
          const avisRecherche = await req.payload.find({
            collection: 'avis-recherche' as any,
            where: {
              numeroImmatriculation: { equals: doc.numeroImmatriculation },
              statutRecherche: { equals: 'actif' },
            },
          })

          if (avisRecherche.docs.length > 0) {
            await req.payload.update({
              collection: 'avis-recherche' as any,
              id: avisRecherche.docs[0].id,
              data: {
                statutRecherche: 'retrouve',
                dateRecuperation: doc.informationsRecuperation.dateRecuperation,
                lieuRecuperation: doc.informationsRecuperation.lieuRecuperation,
                agentRecuperation: doc.informationsRecuperation.agentRecuperation,
                circonstancesRecuperation: doc.informationsRecuperation.circonstancesRecuperation,
              },
            })
          }
        }
      },
    ],
  },
  endpoints: [
    {
      path: '/generate-pdf/:id',
      method: 'get',
      handler: async (req) => {
        try {
          const vehicleId = req.routeParams?.id as string

          if (!vehicleId) {
            return new Response(JSON.stringify({ error: 'ID manquant' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const vehicle = await req.payload.findByID({
            collection: 'vehicles',
            id: vehicleId,
            depth: 2,
          })

          if (!vehicle) {
            return new Response(JSON.stringify({ error: 'Véhicule non trouvé' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const pdfBytes = (await generateVehiclePDF(vehicle)) as any

          return new Response(pdfBytes, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="fiche-vehicule-${vehicle.numeroImmatriculation}.pdf"`,
            },
          })
        } catch (error) {
          console.error('Erreur génération PDF:', error)
          return new Response(
            JSON.stringify({
              error: 'Erreur lors de la génération du PDF',
              details: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
    {
      path: '/generate-vol-pdf/:id',
      method: 'get',
      handler: async (req) => {
        try {
          const vehicleId = req.routeParams?.id as string

          if (!vehicleId) {
            return new Response(JSON.stringify({ error: 'ID manquant' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const vehicle = await req.payload.findByID({
            collection: 'vehicles',
            id: vehicleId,
            depth: 2,
          })

          if (!vehicle || vehicle.statut !== 'vole' || !vehicle.informationsVol) {
            return new Response(JSON.stringify({ error: 'Données de vol manquantes' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const pdfBytes = (await generateVolPDF(vehicle)) as any

          return new Response(pdfBytes, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="declaration-vol-${vehicle.numeroImmatriculation}.pdf"`,
            },
          })
        } catch (error) {
          console.error('Erreur:', error)
          return new Response(JSON.stringify({ error: 'Erreur génération PDF' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
    // NOUVEAU: Endpoint pour générer PDF d'un changement spécifique
    {
      path: '/generate-historique-pdf/:id/:index',
      method: 'get',
      handler: async (req) => {
        try {
          const vehicleId = req.routeParams?.id as string
          const changeIndex = parseInt(req.routeParams?.index as string)
          console.log({ vehicleId, changeIndex })

          if (!vehicleId || isNaN(changeIndex)) {
            return new Response(JSON.stringify({ error: 'Paramètres invalides' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const vehicle = await req.payload.findByID({
            collection: 'vehicles',
            id: vehicleId,
            depth: 2,
          })

          if (
            !vehicle ||
            !vehicle.historiqueChangements ||
            !vehicle.historiqueChangements[changeIndex]
          ) {
            return new Response(JSON.stringify({ error: 'Changement non trouvé' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const changement = vehicle.historiqueChangements[changeIndex]
          const pdfBytes = (await generateHistoriqueChangementPDF(
            vehicle,
            changement,
            changeIndex,
          )) as any

          const filename = `changement-${changement.typeChangement}-${vehicle.numeroImmatriculation}-${changeIndex + 1}.pdf`

          return new Response(pdfBytes, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`,
            },
          })
        } catch (error) {
          console.error('Erreur génération PDF historique:', error)
          return new Response(
            JSON.stringify({
              error: 'Erreur lors de la génération du PDF',
              details: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  ],
  fields: [
    // === SECTION: INFORMATIONS GÉNÉRALES ===
    {
      type: 'row',
      fields: [
        {
          name: 'typeVehicule',
          type: 'select',
          label: 'Type de véhicule',
          admin: {
            width: '20%',
            placeholder: 'Sélectionnez le type',
          },
          options: [
            { label: '🚗 Voiture', value: 'voiture' },
            { label: '🏍️ Moto', value: 'moto' },
            { label: '🛺 Tricycle', value: 'tricycle' },
            { label: '🚚 Camion', value: 'camion' },
            { label: '🚜 Engin agricole', value: 'engin_agricole' },
            { label: '🔧 Autre', value: 'autre' },
          ],
        },
        {
          name: 'statut',
          type: 'select',
          label: 'Statut du véhicule',
          defaultValue: 'actif',
          admin: {
            width: '20%',
            placeholder: 'Statut actuel',
          },
          options: [
            { label: '✅ Actif', value: 'actif' },
            { label: '🚨 Volé', value: 'vole' },
            { label: '🔍 Retrouvé', value: 'retrouve' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'numeroImmatriculation',
          type: 'text',
          unique: true,
          label: "Numéro d'immatriculation",
          admin: {
            width: '20%',
            placeholder: 'Ex: AB-1234-CD',
          },
        },
        {
          name: 'numeroSerie',
          type: 'text',
          unique: true,
          label: 'Numéro de série (VIN/Châssis)',
          admin: {
            width: '20%',
            placeholder: 'Ex: 1HGBH41JXMN109186',
          },
        },
        {
          name: 'marque',
          type: 'text',
          label: 'Marque',
          admin: {
            width: '20%',
            placeholder: 'Ex: Toyota, Honda...',
          },
        },
        {
          name: 'modele',
          type: 'text',
          label: 'Modèle',
          admin: {
            width: '20%',
            placeholder: 'Ex: Corolla, Civic...',
          },
        },
        {
          name: 'annee',
          type: 'number',
          label: 'Année de fabrication',
          admin: {
            width: '20%',
            placeholder: '2020',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'couleur',
          type: 'text',
          label: 'Couleur',
          admin: {
            width: '20%',
            placeholder: 'Blanc, Noir, Gris...',
          },
        },
        {
          name: 'numeroMoteur',
          type: 'text',
          label: 'Numéro de moteur',
          admin: {
            width: '20%',
            placeholder: 'Ex: 4G63-123456',
          },
        },
        {
          name: 'carburant',
          type: 'select',
          label: 'Type de carburant',
          admin: {
            width: '20%',
            placeholder: 'Sélectionnez',
          },
          options: [
            { label: '⛽ Essence', value: 'essence' },
            { label: '🛢️ Diesel', value: 'diesel' },
            { label: '🔋 Électrique', value: 'electrique' },
            { label: '🔋⛽ Hybride', value: 'hybride' },
            { label: '🌱 GPL', value: 'gpl' },
            { label: 'Autre', value: 'autre' },
          ],
        },
        {
          name: 'cylindree',
          type: 'number',
          label: 'Cylindrée (cm³)',
          admin: {
            width: '20%',
            placeholder: '1600',
            description: '🔧 Capacité du moteur',
          },
        },
        {
          name: 'poids',
          type: 'number',
          label: 'Poids (kg)',
          admin: {
            width: '20%',
            placeholder: '1200',
            description: '⚖️ Poids à vide',
          },
        },
      ],
    },

    // === SECTION: INFORMATIONS D'ACHAT (Collapsible) ===
    {
      type: 'collapsible',
      label: "💰 Informations d'achat",
      admin: {
        description: 'Détails financiers et origine du véhicule',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'dateAchat',
              type: 'date',
              label: "Date d'achat",
              admin: {
                width: '20%',
                placeholder: 'Sélectionnez la date',
              },
            },
            {
              name: 'paysOrigine',
              type: 'text',
              label: "Pays d'origine",
              admin: {
                width: '20%',
                placeholder: 'Ex: France, Japon, USA...',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'prixAchat',
              type: 'number',
              label: "Prix d'achat",
              admin: {
                width: '20%',
                placeholder: '5000000',
                description: '💵 Montant total',
              },
            },
            {
              name: 'devise',
              type: 'select',
              label: 'Devise',
              defaultValue: 'XOF',
              admin: {
                width: '20%',
              },
              options: [
                { label: 'Franc CFA (XOF)', value: 'XOF' },
                { label: 'Euro (EUR)', value: 'EUR' },
                { label: 'Dollar US (USD)', value: 'USD' },
                { label: 'Autre', value: 'autre' },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'vendeur',
              type: 'text',
              label: 'Nom du vendeur',
              admin: {
                width: '20%',
                placeholder: 'Nom complet ou raison sociale',
              },
            },
            {
              name: 'numeroFacture',
              type: 'text',
              label: 'Numéro de facture',
              admin: {
                width: '20%',
                placeholder: 'Ex: INV-2024-001',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'droitsDouane',
              type: 'number',
              label: 'Droits de douane',
              admin: {
                width: '20%',
                placeholder: '500000',
                description: '📊 Montant payé',
              },
            },
            {
              name: 'taxes',
              type: 'number',
              label: 'Taxes',
              admin: {
                width: '20%',
                placeholder: '300000',
              },
            },
            {
              name: 'fraisImmatriculation',
              type: 'number',
              label: "Frais d'immatriculation",
              admin: {
                width: '20%',
                placeholder: '50000',
              },
            },
          ],
        },
        {
          name: 'documentImportation',
          type: 'upload',
          relationTo: 'media',
          label: "📎 Document d'importation",
          admin: {
            description: 'Facture, certificat douanier, etc.',
          },
        },
      ],
    },

    // === SECTION: PROPRIÉTAIRE ACTUEL (Collapsible) ===
    {
      type: 'collapsible',
      label: '👤 Propriétaire actuel',
      admin: {
        description: 'Informations sur le propriétaire enregistré',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'typeProprietaire',
              type: 'select',
              label: 'Type',
              admin: {
                width: '20%',
              },
              options: [
                { label: '👤 Personne physique', value: 'physique' },
                { label: '🏢 Personne morale (entreprise)', value: 'morale' },
              ],
            },
            {
              name: 'dateAcquisition',
              type: 'date',
              label: "Date d'acquisition",
              admin: {
                width: '20%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'nom',
              type: 'text',
              label: 'Nom complet / Raison sociale',
              admin: {
                width: '20%',
                placeholder: 'Ex: Kouassi Jean-Pierre ou SARL TransAfrique',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ville',
              type: 'text',
              label: 'Ville',
              admin: {
                width: '20%',
                placeholder: 'Ex: Abidjan, Bouaké...',
              },
            },
            {
              name: 'numeroIdentite',
              type: 'text',
              label: 'N° CNI / Passeport / RC',
              admin: {
                width: '20%',
                placeholder: 'Ex: CI-123456789',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'adresse',
              type: 'textarea',
              label: 'Adresse complète',
              admin: {
                placeholder: 'Rue, quartier, commune...',
                width: '40%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'telephone',
              type: 'text',
              label: 'Téléphone',
              admin: {
                width: '20%',
                placeholder: '+225 XX XX XX XX XX',
              },
            },
            {
              name: 'email',
              type: 'email',
              label: 'Email',
              admin: {
                width: '20%',
                placeholder: 'exemple@email.com',
              },
            },
          ],
        },
        {
          name: 'documentProprietaire',
          type: 'upload',
          relationTo: 'media',
          label: "📎 Document d'identité",
          admin: {
            description: 'CNI, Passeport ou Registre du Commerce',
          },
        },
      ],
    },

    // === SECTION: HISTORIQUE DES CHANGEMENTS (Collapsible) ===
    {
      name: 'historiqueChangements',
      type: 'array',
      label: '📜 Historique',
      admin: {
        description: 'Changements de plaques et de propriétaires',
        initCollapsed: true,
        isSortable: false,
        components: {
          RowLabel: '@/components/HistoriqueChangementRowLabel', // Pour afficher un label personnalisé
        },
      },
      hooks: {
        beforeChange: [
          async ({ req, operation, data, value }) => {
            if (req.user && value && Array.isArray(value)) {
              return value.map((item: any) => {
                if (!item.officierSaisie) {
                  return {
                    ...item,
                    officierSaisie: req.user?.id,
                    dateSaisie: new Date().toISOString(),
                  }
                }
                return item
              })
            }
            return value
          },
        ],
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'typeChangement',
              type: 'select',
              label: 'Type',
              admin: {
                width: '20%',
              },
              options: [
                { label: '🔖 Changement de plaque', value: 'plaque' },
                { label: '👤 Changement de propriétaire', value: 'proprietaire' },
                { label: '🔄 Les deux', value: 'les_deux' },
              ],
            },
            {
              name: 'dateChangement',
              type: 'date',
              label: 'Date',
              admin: {
                width: '20%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'anciennePlaque',
              type: 'text',
              label: 'Ancienne plaque',
              admin: {
                width: '20%',
                placeholder: 'Ex: AA-1111-BB',
                condition: (data, siblingData) =>
                  siblingData.typeChangement === 'plaque' ||
                  siblingData.typeChangement === 'les_deux',
              },
            },
            {
              name: 'nouvellePlaque',
              type: 'text',
              label: 'Nouvelle plaque',
              admin: {
                width: '20%',
                placeholder: 'Ex: CC-2222-DD',
                condition: (data, siblingData) =>
                  siblingData.typeChangement === 'plaque' ||
                  siblingData.typeChangement === 'les_deux',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ancienProprietaire',
              type: 'text',
              label: 'Ancien propriétaire',
              admin: {
                width: '20%',
                placeholder: 'Nom complet',
                condition: (data, siblingData) =>
                  siblingData.typeChangement === 'proprietaire' ||
                  siblingData.typeChangement === 'les_deux',
              },
            },
            {
              name: 'nouveauProprietaire',
              type: 'text',
              label: 'Nouveau propriétaire',
              admin: {
                width: '20%',
                placeholder: 'Nom complet',
                condition: (data, siblingData) =>
                  siblingData.typeChangement === 'proprietaire' ||
                  siblingData.typeChangement === 'les_deux',
              },
            },
          ],
        },
        {
          name: 'motif',
          type: 'textarea',
          label: 'Motif du changement',
          admin: {
            placeholder: 'Décrivez la raison du changement...',
            rows: 2,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'documentChangement',
              type: 'upload',
              relationTo: 'media',
              label: '📎 Document justificatif',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'agentEnregistrement',
              type: 'relationship',
              relationTo: 'users',
              label: 'Agent enregistrant',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'officierSaisie',
              type: 'relationship',
              relationTo: 'users',
              label: '👮 Officier de saisie',
              admin: {
                width: '20%',
                readOnly: true,
                description: 'Rempli automatiquement',
              },
            },
            {
              name: 'dateSaisie',
              type: 'date',
              label: '📅 Date de saisie',
              admin: {
                width: '20%',
                readOnly: true,
                description: 'Rempli automatiquement',
              },
            },
          ],
        },
        // NOUVEAU: Champ UI pour le bouton PDF
        {
          name: 'pdfButton',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/HistoriqueChangementPDFButton',
            },
          },
        },
      ],
    },

    // === SECTION: INFRACTIONS (Collapsible) ===
    {
      name: 'infractions',
      type: 'array',
      label: '⚠️ Infractions',
      admin: {
        description: 'Infractions commises avec ce véhicule',
        initCollapsed: true,
      },
      hooks: {
        beforeChange: [
          async ({ req, operation, data, value }) => {
            if (req.user && value && Array.isArray(value)) {
              return value.map((item: any) => {
                if (!item.officierSaisie) {
                  return {
                    ...item,
                    officierSaisie: req?.user?.id,
                    dateSaisie: new Date().toISOString(),
                  }
                }
                return item
              })
            }
            return value
          },
        ],
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'dateInfraction',
              type: 'date',
              label: 'Date',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'heureInfraction',
              type: 'text',
              label: 'Heure',
              admin: {
                width: '20%',
                placeholder: '14:30',
              },
            },
            {
              name: 'ville',
              type: 'text',
              label: 'Ville',
              admin: {
                width: '20%',
                placeholder: 'Abidjan',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'lieuInfraction',
              type: 'text',
              label: 'Lieu précis',
              admin: {
                width: '20%',
                placeholder: 'Ex: Boulevard Latrille, Cocody',
              },
            },
            {
              name: 'typeInfraction',
              type: 'select',
              label: 'Type',
              admin: {
                width: '20%',
              },
              options: [
                { label: '📱 Téléphone au volant', value: 'telephone_volant' },
                { label: '🔒 Conduite sans ceinture', value: 'sans_ceinture' },
                { label: '🪖 Conduite sans casque', value: 'sans_casque' },
                { label: '🚀 Excès de vitesse', value: 'exces_vitesse' },
                { label: '🅿️ Stationnement interdit', value: 'stationnement' },
                { label: '🪪 Conduite sans permis', value: 'sans_permis' },
                { label: "🍺 État d'ivresse", value: 'ivresse' },
                { label: '🚦 Non respect feu rouge', value: 'feu_rouge' },
                { label: '🛃 Problème douanier', value: 'douane' },
                { label: '📦 Contrebande', value: 'contrebande' },
                { label: 'Autre', value: 'autre' },
              ],
            },
          ],
        },
        {
          name: 'descriptionInfraction',
          type: 'textarea',
          label: 'Description',
          admin: {
            placeholder: "Décrivez les circonstances de l'infraction...",
            rows: 3,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'conducteur',
              type: 'text',
              label: 'Conducteur',
              admin: {
                width: '20%',
                placeholder: 'Nom complet',
              },
            },
            {
              name: 'numeroPermis',
              type: 'text',
              label: 'N° Permis',
              admin: {
                width: '20%',
                placeholder: 'Ex: PC-123456',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'montantAmende',
              type: 'number',
              label: 'Montant amende',
              admin: {
                width: '20%',
                placeholder: '25000',
              },
            },
            {
              name: 'amendePayee',
              type: 'checkbox',
              label: '✅ Payée',
              defaultValue: false,
              admin: {
                width: '20%',
              },
            },
            {
              name: 'numeroPV',
              type: 'text',
              label: 'N° PV',
              admin: {
                width: '20%',
                placeholder: 'PV-2024-001',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'agentVerbalisant',
              type: 'relationship',
              relationTo: 'users',
              label: 'Agent verbalisant',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'documentInfraction',
              type: 'upload',
              relationTo: 'media',
              label: '📎 Document (PV, photo)',
              admin: {
                width: '80%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'officierSaisie',
              type: 'relationship',
              relationTo: 'users',
              label: '👮 Officier de saisie',
              admin: {
                width: '20%',
                readOnly: true,
                description: 'Rempli automatiquement',
              },
            },
            {
              name: 'dateSaisie',
              type: 'date',
              label: '📅 Date de saisie',
              admin: {
                width: '20%',
                readOnly: true,
                description: 'Rempli automatiquement',
              },
            },
          ],
        },
      ],
    },

    // === SECTION: INFORMATIONS DE VOL (Conditional) ===
    {
      name: 'informationsVol',
      type: 'group',
      label: '🚨 Informations sur le vol',
      admin: {
        condition: (data) => data.statut === 'vole',
        description: 'Détails du vol déclaré',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'dateVol',
              type: 'date',
              label: 'Date du vol',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'heureVol',
              type: 'text',
              label: 'Heure',
              admin: {
                width: '20%',
                placeholder: '02:30',
              },
            },
            {
              name: 'ville',
              type: 'text',
              label: 'Ville',
              admin: {
                width: '20%',
                placeholder: 'Abidjan',
              },
            },
          ],
        },
        {
          name: 'lieuVol',
          type: 'text',
          label: 'Lieu précis du vol',
          admin: {
            placeholder: 'Adresse exacte où le véhicule a été volé',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'declarant',
              type: 'text',
              label: 'Déclarant',
              admin: {
                width: '20%',
                placeholder: 'Nom complet',
              },
            },
            {
              name: 'telephoneDeclarant',
              type: 'text',
              label: 'Téléphone',
              admin: {
                width: '20%',
                placeholder: '+225 XX XX XX XX XX',
              },
            },
            {
              name: 'emailDeclarant',
              type: 'email',
              label: 'Email',
              admin: {
                width: '20%',
                placeholder: 'exemple@email.com',
              },
            },
          ],
        },
        {
          name: 'circonstances',
          type: 'textarea',
          label: 'Circonstances du vol',
          admin: {
            placeholder: "Décrivez en détail comment le vol s'est produit...",
            rows: 4,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'numeroPlainte',
              type: 'text',
              label: 'N° Plainte',
              admin: {
                width: '20%',
                placeholder: 'Ex: PL-2024-001',
              },
            },
            {
              name: 'documentVol',
              type: 'upload',
              relationTo: 'media',
              label: '📎 Récépissé de plainte',
              admin: {
                width: '20%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'officierSaisie',
              type: 'relationship',
              relationTo: 'users',
              label: '👮 Officier de saisie',
              admin: {
                width: '20%',
                readOnly: true,
                description: 'Rempli automatiquement',
              },
            },
            {
              name: 'dateSaisie',
              type: 'date',
              label: '📅 Date de saisie',
              admin: {
                width: '20%',
                readOnly: true,
                description: 'Rempli automatiquement',
              },
            },
          ],
        },
      ],
    },

    // === SECTION: INFORMATIONS DE RÉCUPÉRATION (Conditional) ===
    {
      name: 'informationsRecuperation',
      type: 'group',
      label: '🔍 Informations sur la récupération',
      admin: {
        condition: (data) => data.statut === 'retrouve',
        description: 'Détails de la récupération du véhicule',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'dateRecuperation',
              type: 'date',
              label: 'Date',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'heureRecuperation',
              type: 'text',
              label: 'Heure',
              admin: {
                width: '20%',
                placeholder: '15:45',
              },
            },
            {
              name: 'etatVehicule',
              type: 'select',
              label: 'État',
              admin: {
                width: '20%',
              },
              options: [
                { label: '✅ Bon état', value: 'bon' },
                { label: '⚠️ Endommagé', value: 'endommage' },
                { label: '❌ Très endommagé', value: 'tres_endommage' },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'lieuRecuperation',
              type: 'text',
              label: 'Lieu de récupération',
              admin: {
                width: '20%',
                placeholder: 'Adresse exacte',
              },
            },
            {
              name: 'recuperePar',
              type: 'text',
              label: 'Récupéré par',
              admin: {
                width: '20%',
                placeholder: 'Nom complet',
              },
            },
          ],
        },
        {
          name: 'circonstancesRecuperation',
          type: 'textarea',
          label: 'Circonstances',
          admin: {
            placeholder: 'Comment le véhicule a-t-il été retrouvé ?',
            rows: 4,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'agentRecuperation',
              type: 'relationship',
              relationTo: 'users',
              label: 'Agent enregistrant',
              admin: {
                width: '20%',
              },
            },
            {
              name: 'documentRecuperation',
              type: 'upload',
              relationTo: 'media',
              label: '📎 Document',
              admin: {
                width: '20%',
              },
            },
          ],
        },
      ],
    },

    {
      name: 'notes',
      type: 'textarea',
      label: '📝 Notes additionnelles',
      admin: {
        placeholder: 'Ajoutez des remarques particulières sur ce véhicule...',
        rows: 5,
      },
    },
  ],
  versions: {
    maxPerDoc: 50,
  },
}
