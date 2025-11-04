// collections/Vehicles.ts
import { CollectionConfig } from 'payload'

export const Vehicles: CollectionConfig = {
  slug: 'vehicles',
  labels: {
    singular: 'Véhicule',
    plural: 'Véhicules',
  },
  admin: {
    useAsTitle: 'plateNumber',
    defaultColumns: ['plateNumber', 'brand', 'model', 'year', 'underSearch'],
    description: 'Gérer les véhicules enregistrés et suivre leur statut de recherche',
    group: 'Gestion de Flotte',
    listSearchableFields: ['plateNumber', 'brand', 'model'],
  },
  fields: [
    // Vehicle Identification
    {
      type: 'row',
      fields: [
        {
          name: 'plateNumber',
          type: 'text',
          required: true,
          unique: true,
          label: "Numéro de Plaque d'Immatriculation",
          admin: {
            placeholder: 'AA-123-BB',
            width: '50%',
            description: 'Identifiant unique du véhicule',
          },
          validate: (value) => {
            if (!value) return "La plaque d'immatriculation est requise"
            // Optional: Add regex validation for specific plate format
            if (!/^[A-Z]{2}-\d{3}-[A-Z]{2}$/i.test(value)) {
              return 'Veuillez utiliser le format : AA-123-BB'
            }
            return true
          },
        },
        {
          name: 'underSearch',
          type: 'radio',
          label: '🚨 Statut de Recherche Police',
          required: true,
          defaultValue: 'normal',
          options: [
            {
              label: '✓ Normal - Aucune alerte',
              value: 'normal',
            },
            {
              label: '⚠️ SOUS RECHERCHE POLICE',
              value: 'wanted',
            },
          ],
          admin: {
            width: '50%',
            layout: 'horizontal',
            description: 'Marquez le véhicule comme recherché par la police',
            style: {
              fontWeight: 'bold',
            },
          },
        },
      ],
    },

    // Vehicle Details
    {
      type: 'collapsible',
      label: '🚗 Informations du Véhicule',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'brand',
              type: 'text',
              required: true,
              label: 'Marque / Constructeur',
              admin: {
                placeholder: 'Toyota, Ford, BMW...',
                width: '50%',
              },
            },
            {
              name: 'model',
              type: 'text',
              required: true,
              label: 'Modèle',
              admin: {
                placeholder: 'Corolla, F-150, X5...',
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'year',
              type: 'number',
              required: true,
              label: 'Année de Fabrication',
              admin: {
                placeholder: '2021',
                width: '33%',
                step: 1,
              },
              validate: (value) => {
                const currentYear = new Date().getFullYear()
                if (value < 1900 || value > currentYear + 1) {
                  return `L'année doit être entre 1900 et ${currentYear + 1}`
                }
                return true
              },
            },
            {
              name: 'color',
              type: 'select',
              label: 'Couleur Principale',
              admin: {
                width: '33%',
              },
              options: [
                { label: 'Blanc', value: 'white' },
                { label: 'Noir', value: 'black' },
                { label: 'Argent', value: 'silver' },
                { label: 'Gris', value: 'gray' },
                { label: 'Rouge', value: 'red' },
                { label: 'Bleu', value: 'blue' },
                { label: 'Vert', value: 'green' },
                { label: 'Jaune', value: 'yellow' },
                { label: 'Orange', value: 'orange' },
                { label: 'Marron', value: 'brown' },
                { label: 'Autre', value: 'other' },
              ],
            },
            {
              name: 'vin',
              type: 'text',
              label: 'Numéro VIN',
              admin: {
                placeholder: 'VIN à 17 caractères',
                width: '34%',
                description: "Numéro d'identification du véhicule",
              },
              validate: (value) => {
                if (value && value.length !== 17) {
                  return 'Le VIN doit contenir exactement 17 caractères'
                }
                return true
              },
            },
          ],
        },
      ],
    },

    // Owner Information
    {
      type: 'collapsible',
      label: '👤 Informations du Propriétaire',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'owner',
          type: 'relationship',
          relationTo: 'people',
          required: true,
          label: 'Propriétaire Enregistré',
          admin: {
            description: 'Propriétaire principal de ce véhicule',
          },
        },
        {
          name: 'registrationDate',
          type: 'date',
          label: "Date d'Enregistrement",
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'd MMM yyyy',
            },
            description: "Date d'enregistrement du véhicule dans le système",
          },
        },
      ],
    },

    // Search Details (Conditional)
    {
      name: 'searchDetails',
      type: 'group',
      label: '🚨 Détails de la Recherche / Incident',
      admin: {
        condition: (data) => data.underSearch === 'wanted',
        description: 'Informations concernant la recherche de ce véhicule',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'declaredBy',
              type: 'relationship',
              relationTo: 'users',
              label: 'Déclaré Par (Officier)',
              required: true,
              admin: {
                width: '50%',
                description: 'Officier ayant initié la recherche',
                readOnly: true,
              },
            },
            {
              name: 'declarationDate',
              type: 'date',
              label: 'Date de Déclaration',
              required: true,
              admin: {
                width: '50%',
                readOnly: true,
                date: {
                  pickerAppearance: 'dayAndTime',
                  displayFormat: 'd MMM yyyy HH:mm',
                },
                description: 'Renseignée automatiquement',
              },
            },
          ],
        },
        {
          name: 'priority',
          type: 'radio',
          label: 'Niveau de Priorité',
          required: true,
          defaultValue: 'medium',
          options: [
            { label: '🔴 HAUTE - Action Immédiate Requise', value: 'high' },
            { label: '🟡 MOYENNE - Surveillance Rapprochée', value: 'medium' },
            { label: '🟢 BASSE - Contrôle de Routine', value: 'low' },
          ],
          admin: {
            layout: 'vertical',
            description: "Niveau d'urgence pour cette recherche",
          },
        },
        {
          name: 'category',
          type: 'select',
          label: 'Catégorie de Recherche',
          required: true,
          options: [
            { label: '🚗 Véhicule Volé', value: 'stolen' },
            { label: '⚖️ Implication Criminelle', value: 'crime' },
            { label: '🚦 Infraction Routière', value: 'traffic' },
            { label: '💰 Amendes Impayées', value: 'fines' },
            { label: '🔍 Inspection Requise', value: 'inspection' },
            { label: '📋 Autre', value: 'other' },
          ],
        },
        {
          name: 'reason',
          type: 'textarea',
          label: 'Raison Détaillée / Description',
          required: true,
          admin: {
            placeholder:
              "Fournissez une description détaillée de la raison de cette recherche, incluant les numéros d'incident, lieux, ou autres informations pertinentes...",
            rows: 5,
            description: 'Soyez aussi précis que possible pour la sécurité des officiers',
          },
          validate: (value) => {
            if (value && value.length < 20) {
              return 'Veuillez fournir une description plus détaillée (minimum 20 caractères)'
            }
            return true
          },
        },
        {
          name: 'lastSeenLocation',
          type: 'text',
          label: 'Dernière Localisation Connue',
          admin: {
            placeholder: 'Adresse, intersection, ou description du secteur',
          },
        },
        {
          name: 'stolenLocation',
          type: 'text',
          label: 'Lieu du Vol / Incident',
          required: true,
          admin: {
            placeholder: 'Adresse exacte ou secteur où le véhicule a été volé',
            description: "Indiquez le lieu précis du vol ou de l'incident",
            condition: (data, siblingData) => {
              return siblingData?.category === 'stolen' || siblingData?.category === 'crime'
            },
          },
        },
        {
          name: 'stolenDate',
          type: 'date',
          label: 'Date et Heure du Vol / Incident',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
              displayFormat: 'd MMM yyyy HH:mm',
            },
            description: "Moment estimé du vol ou de l'incident",
            condition: (data, siblingData) => {
              return siblingData?.category === 'stolen' || siblingData?.category === 'crime'
            },
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Notes Additionnelles / Mises à Jour',
          admin: {
            placeholder:
              'Toute information supplémentaire ou mise à jour concernant cette affaire...',
            rows: 3,
          },
        },
      ],
    },

    // System Metadata
    {
      type: 'collapsible',
      label: '⚙️ Informations Système',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          label: "Statut d'Immatriculation",
          defaultValue: 'active',
          options: [
            { label: '✓ Actif', value: 'active' },
            { label: '⊗ Suspendu', value: 'suspended' },
            { label: '✕ Radié', value: 'deregistered' },
          ],
          admin: {
            description: "Statut d'immatriculation actuel dans le système",
          },
        },
        {
          name: 'internalNotes',
          type: 'textarea',
          label: 'Notes Internes',
          admin: {
            placeholder: 'Notes à usage interne uniquement...',
            rows: 3,
            description: 'Ces notes sont visibles uniquement par le personnel autorisé',
          },
        },
      ],
    },
  ],

  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // Auto-populate search details when marking vehicle as under search
        if (data.underSearch === 'wanted' && req.user) {
          if (!data.searchDetails) {
            data.searchDetails = {}
          }

          // ALWAYS set the current user as declaring officer
          data.searchDetails.declaredBy = req.user.id

          // Set declaration date if not already set (only on first declaration)
          if (!data.searchDetails.declarationDate) {
            data.searchDetails.declarationDate = new Date().toISOString()
          }
        }

        // Clear search details if underSearch is set to normal
        if (data.underSearch === 'normal' && data.searchDetails) {
          data.searchDetails = undefined
        }

        // Normalize plate number format
        if (data.plateNumber) {
          data.plateNumber = data.plateNumber.toUpperCase().trim()
        }

        // Set registration date on creation
        if (operation === 'create' && !data.registrationDate) {
          data.registrationDate = new Date().toISOString()
        }

        return data
      },
    ],
    beforeValidate: [
      ({ req, data }) => {
        // Ensure declaredBy is set before validation
        if (data.underSearch === 'wanted' && req.user) {
          if (!data.searchDetails) {
            data.searchDetails = {}
          }
          data.searchDetails.declaredBy = req.user.id
        }
        return data
      },
    ],
  },

  // Add timestamps
  timestamps: true,

  // Access control (customize based on your needs)
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => {
      // Only admins can delete vehicles
      return user?.role === 'super-admin'
    },
  },
}
