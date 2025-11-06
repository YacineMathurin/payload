import { CollectionConfig } from 'payload'

// Collection des avis de recherche
export const AvisRecherche: CollectionConfig = {
  slug: 'avis-recherche',
  admin: {
    useAsTitle: 'numeroImmatriculation',
    defaultColumns: ['numeroImmatriculation', 'marque', 'modele', 'dateVol', 'statutRecherche'],
    group: "Ministère de l'interieur",
    description: '🔍 Véhicules recherchés',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'super-admin',
    update: ({ req: { user } }) => user?.role === 'super-admin',
    delete: ({ req: { user } }) => user?.role === 'super-admin',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'vehicule',
          type: 'text',
          // relationTo: 'vehicles',
          required: true,
          unique: true,
          label: 'Véhicule concerné',

          admin: {
            width: '40%',
            placeholder: 'Voiture, Moto...',
            readOnly: true,
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'typeVehicule',
          type: 'text',
          required: true,
          label: 'Type',
          admin: {
            width: '20%',
            placeholder: 'Voiture, Moto...',
            readOnly: true,
          },
        },
        {
          name: 'numeroImmatriculation',
          type: 'text',
          required: true,
          label: 'N° Immatriculation',
          admin: {
            width: '20%',
            placeholder: 'Ex: AB-1234-CD',
          },
        },
        {
          name: 'numeroSerie',
          type: 'text',
          label: 'Numéro de série (VIN)',
          admin: {
            width: '20%',
            placeholder: 'Ex: 1HGBH41JXMN109186',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'marque',
          type: 'text',
          required: true,
          label: 'Marque',
          admin: {
            width: '20%',
            placeholder: 'Toyota',
          },
        },
        {
          name: 'modele',
          type: 'text',
          required: true,
          label: 'Modèle',
          admin: {
            width: '20%',
            placeholder: 'Corolla',
          },
        },
        {
          name: 'couleur',
          type: 'text',
          label: 'Couleur',
          admin: {
            width: '20%',
            placeholder: 'Blanc',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'dateVol',
          type: 'date',
          required: true,
          label: 'Date du vol',
          admin: {
            width: '20%',
          },
        },
        {
          name: 'ville',
          type: 'text',
          required: true,
          label: 'Ville',
          admin: {
            width: '20%',
            placeholder: 'Abidjan',
          },
        },
        {
          name: 'lieuVol',
          type: 'text',
          required: true,
          label: 'Lieu du vol',
          admin: {
            width: '20%',
            placeholder: 'Adresse précise',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'declarant',
          type: 'text',
          required: true,
          label: 'Déclarant',
          admin: {
            width: '20%',
            placeholder: 'Nom complet',
          },
        },
        {
          name: 'telephoneDeclarant',
          type: 'text',
          required: true,
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
        placeholder: 'Description des circonstances...',
        rows: 3,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'agentEnregistrement',
          type: 'relationship',
          relationTo: 'users',
          label: 'Agent enregistrant',
          admin: {
            width: '40%',
          },
        },
        {
          name: 'statutRecherche',
          type: 'select',
          required: true,
          label: 'Statut',
          defaultValue: 'actif',
          admin: {
            width: '40%',
          },
          options: [
            { label: '🔴 Recherche active', value: 'actif' },
            { label: '✅ Véhicule retrouvé', value: 'retrouve' },
            { label: '⏸️ Recherche abandonnée', value: 'abandonne' },
          ],
        },
      ],
    },
    {
      name: 'dateRecuperation',
      type: 'date',
      label: 'Date de récupération',
      admin: {
        condition: (data) => data.statutRecherche === 'retrouve',
      },
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
            placeholder: 'Adresse',
            condition: (data) => data.statutRecherche === 'retrouve',
          },
        },
        {
          name: 'agentRecuperation',
          type: 'relationship',
          relationTo: 'users',
          label: 'Agent récupération',
          admin: {
            width: '20%',
            condition: (data) => data.statutRecherche === 'retrouve',
          },
        },
      ],
    },
    {
      name: 'circonstancesRecuperation',
      type: 'textarea',
      label: 'Circonstances de la récupération',
      admin: {
        placeholder: 'Comment le véhicule a été retrouvé...',
        rows: 3,
        condition: (data) => data.statutRecherche === 'retrouve',
      },
    },
  ],
}
