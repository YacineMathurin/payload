const htmlContent = (qrCodeDataUrl, data) => {
  const attributes = data?.attributes || {}
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const isLitige = attributes.Litige === 'Oui'

  // Using Tailwind CSS utility classes directly
  const textColorClass = isLitige ? 'text-yellow-600' : 'text-green-600'
  const borderColorClass = isLitige ? 'border-yellow-600' : 'border-green-600'

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificat d'Authentification - République du Niger</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
        }

        @page {
            size: A4;
            margin: 15mm;
        }

        @media print {
            html, body {
                height: 100%;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body class="min-h-screen flex flex-col">
    <div class="flex-1 max-w-4xl mx-auto pt-12 px-16 flex flex-col justify-between">
        <div class="mb-6">
            <div class="text-left">
                <div class="font-bold text-lg text-gray-900">RÉPUBLIQUE DU NIGER</div>
                <div class="text-gray-800">Ministère de l'Urbanisme et de l'Habitat</div>
                <div class="text-gray-800">Direction Génerale des domaines de l'Etat</div>
                <div class="text-gray-800">Direction Régionale de l'Urbanisme et du Logement</div>
            </div>
        </div>

        <div class="text-center mb-6">
            <h1 class="text-lg font-bold text-orange-600 uppercase tracking-wider">Certificat d'Authentification</h1>
            <div class="text-gray-600">Vérification de Propriété Résidentielle</div>
        </div>

        <div class="mb-6 border border-gray-200 rounded-lg p-6">
            <h2 class="text-2xl font-semibold ${textColorClass} ${borderColorClass} pb-2 mb-4">Détails de la Propriété</h2>
            <div class="grid grid-cols-3 gap-4">
                <div>
                    <span class="font-semibold text-gray-700">Lotissement:</span>
                    <div class="text-gray-800">${attributes.Lotissement || 'N/A'}</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Îlot:</span>
                    <div class="text-gray-800">${attributes.Ilot || 'N/A'}</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Parcelle:</span>
                    <div class="text-gray-800">${attributes.Parcelle || 'N/A'}</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Superficie:</span>
                    <div class="text-gray-800">${
                      attributes.Superficie ? attributes.Superficie + ' m²' : 'N/A'
                    }</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Statut Litige:</span>
                    <div class="text-gray-800">${attributes.Litige || 'N/A'}</div>
                </div>

                <div>
                    <span class="font-semibold text-gray-700">Date d'enregistrement:</span>
                    <div class="text-gray-800">${
                      attributes.createdAt
                        ? new Date(attributes.createdAt).toLocaleDateString('fr-FR')
                        : 'N/A'
                    }</div>
                </div>

                <div>
                    <span class="font-semibold text-gray-700">Nom Propriétaire:</span>
                    <div class="text-gray-800">${attributes.Nom || 'N/A'}</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Prénom Propriétaire:</span>
                    <div class="text-gray-800">${attributes.Prenom || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <h2 class="text-2xl font-semibold ${textColorClass} ${borderColorClass} pb-2 mb-4">Détails d'Authentification</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <span class="font-semibold text-gray-700">Date d'Inspection:</span>
                    <div class="text-gray-800">${currentDate}</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">Numéro d'Authentification parcelle:</span>
                    <div class="text-gray-800">${attributes.Ilot}-${attributes.Parcelle}</div>
                </div>
                <div>
                    <span class="font-semibold text-gray-700">N° d'identifiant de l'agent:</span>
                    <div class="text-gray-800">Agent-0001A</div>
                </div>
            </div>
        </div>

        <div class="my-2 text-gray-800 text-justify leading-relaxed">
            Je, en tant qu'agent certifié du Département d'Authentification des Propriétés, certifie par la présente avoir personnellement inspecté la propriété susmentionnée appartenant à <strong>${
              attributes.Prenom || ''
            } ${
              attributes.Nom || ''
            }</strong> et confirme son authenticité selon les Normes Nationales de Propriété. Cette propriété située dans le <strong>${
              attributes.Lotissement || 'lotissement'
            }</strong>, îlot <strong>${attributes.Ilot || 'N/A'}</strong>, parcelle <strong>${
              attributes.Parcelle || 'N/A'
            }</strong>, d'une surface de ${attributes.Superficie || 'N/A'} m2 <strong>${
              attributes.Litige === 'Non'
                ? 'et ne présente aucun litige'
                : 'mais présente des litiges non encore illucidés'
            }</strong>.
        </div>

        <div class="flex items-center justify-center gap-6 mt-8">
            ${
              qrCodeDataUrl
                ? `<img src="${qrCodeDataUrl}" alt="Code QR" class="w-20 h-20" />`
                : '<div class="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs">QR</div>'
            }
            <div class="text-sm text-gray-600 max-w-xs">
                Scannez ce code QR pour vérifier l'authenticité de ce certificat en ligne sur cms-pdf-creator.vercel.app
            </div>
        </div>

        <div class="grid grid-cols-2 gap-12 mt-8">
            <div class="text-center">
                <div class="border-t-2 border-gray-400 pt-2 font-semibold text-gray-700">Signature de l'Authentificateur</div>
                <div class="text-xs text-gray-600 mt-1">Agent Certifié</div>
            </div>
            <div class="text-center">
                <div class="border-t-2 border-gray-400 pt-2 font-semibold text-gray-700">Représentant Officiel</div>
                <div class="text-xs text-gray-600 mt-1">Ministère de l'Urbanisme et de l'Habitat</div>
            </div>
        </div>

        <div class="text-center text-sm text-gray-600 mt-auto">
            <div><strong>Ce document n'est pas valide s'il est altéré de quelque manière que ce soit</strong></div>
            <div class="mt-1">Département d'Authentification des Propriétés • Niamey, Niger • (+227) 20-XX-XX-XX</div>
        </div>
    </div>
</body>
</html>
`
}

export { htmlContent }
