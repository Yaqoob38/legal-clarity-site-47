import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TemplateConfig {
  title: string
  description: string
  fields?: string[]
}

const templates: Record<string, TemplateConfig> = {
  'Client_Care_Letter.pdf': {
    title: 'Client Care Letter',
    description: 'This letter outlines our terms of service, fee structure, and your rights as a client. Please review carefully, sign at the bottom, and upload back to us.',
    fields: ['Client Name', 'Property Address', 'Date', 'Signature']
  },
  'Terms_of_Engagement.pdf': {
    title: 'Terms of Engagement',
    description: 'These terms set out the basis on which we will provide legal services to you.',
    fields: ['Client Name', 'Case Reference', 'Date', 'Signature']
  },
  'Client_Information_Form.pdf': {
    title: 'Client Information Form',
    description: 'Please complete all sections with accurate information to help us serve you better.',
    fields: ['Full Name', 'Date of Birth', 'Address', 'Phone Number', 'Email', 'Employment Status', 'Occupation', 'National Insurance Number']
  },
  'ID_Verification_Guide.pdf': {
    title: 'ID Verification Guide',
    description: 'This guide explains the identification documents we require and how to provide them.',
  },
  'Gift_Declaration_Form.pdf': {
    title: 'Gift Declaration Form',
    description: 'If receiving financial assistance, the donor must complete this form to confirm the funds are a gift with no expectation of repayment.',
    fields: ['Donor Name', 'Donor Address', 'Recipient Name', 'Gift Amount', 'Relationship to Recipient', 'Date', 'Donor Signature']
  },
  'Draft_Contract_of_Sale.pdf': {
    title: 'Draft Contract of Sale',
    description: 'This is the draft contract for the sale/purchase of the property. Please review all terms carefully before signing.',
    fields: ['Buyer Name', 'Seller Name', 'Property Address', 'Purchase Price', 'Completion Date', 'Date', 'Buyer Signature']
  },
  'Property_Plans.pdf': {
    title: 'Property Plans',
    description: 'These plans show the boundaries and layout of the property you are purchasing. Please sign to confirm your understanding.',
    fields: ['Property Address', 'Plan Reference', 'Date', 'Signature']
  }
}

async function generatePDF(fileName: string, config: TemplateConfig): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const { width, height } = page.getSize()
  let yPosition = height - 80

  // Header
  page.drawText(config.title, {
    x: 50,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.4)
  })
  
  yPosition -= 40

  // Description
  const descriptionLines = splitTextIntoLines(config.description, 80)
  for (const line of descriptionLines) {
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0.3, 0.3, 0.3)
    })
    yPosition -= 20
  }

  yPosition -= 30

  // Form fields
  if (config.fields) {
    page.drawText('Please complete the following:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.2, 0.4)
    })
    yPosition -= 30

    for (const field of config.fields) {
      // Draw field label
      page.drawText(field + ':', {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
      
      // Draw line for input
      page.drawLine({
        start: { x: 200, y: yPosition - 2 },
        end: { x: width - 50, y: yPosition - 2 },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7)
      })
      
      yPosition -= 35

      // Add new page if needed
      if (yPosition < 100) {
        const newPage = pdfDoc.addPage([595, 842])
        yPosition = height - 80
      }
    }
  }

  // Footer
  yPosition = 60
  page.drawText('This is a placeholder template generated for demonstration purposes.', {
    x: 50,
    y: yPosition,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  })
  
  page.drawText('Please replace with actual legal documents before use.', {
    x: 50,
    y: yPosition - 15,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5)
  })

  return await pdfDoc.save()
}

function splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  
  if (currentLine) lines.push(currentLine)
  return lines
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const results = []

    for (const [fileName, config] of Object.entries(templates)) {
      try {
        // Generate PDF
        const pdfBytes = await generatePDF(fileName, config)
        
        // Upload to storage
        const { data, error } = await supabase.storage
          .from('document-templates')
          .upload(fileName, pdfBytes, {
            contentType: 'application/pdf',
            upsert: true
          })

        if (error) throw error

        results.push({
          fileName,
          status: 'success',
          path: data.path
        })
      } catch (error) {
        results.push({
          fileName,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
