import { formatDate, formatMoney } from './customerFormat'

function ascii(value) {
  return String(value ?? '').replace(/[^\x20-\x7E]/g, '-')
}

function escapePdfText(value) {
  return ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function buildPdf(displayLines) {
  const content = displayLines
    .map((line, index) => {
      const text = typeof line === 'string' ? line : line.text
      const size = typeof line === 'string' ? 10 : line.size || 10
      const y = 760 - index * 18
      return `BT /F1 ${size} Tf 48 ${y} Td (${escapePdfText(text)}) Tj ET`
    })
    .join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return pdf
}

export function createSampleInvoicePdf(invoice, profile) {
  const currency = invoice.currency || 'USD'
  const lines = [
    { text: 'BRIGHTLOOP - SAMPLE INVOICE', size: 16 },
    'This PDF is a locally generated demo sample.',
    'It was not issued or downloaded by the Brightloop backend.',
    '',
    `Invoice: ${invoice.invoiceNumber}`,
    `Status: ${invoice.status} (workflow: ${invoice.workflowState})`,
    `Issued: ${formatDate(invoice.issueDate)}`,
    `Due: ${formatDate(invoice.dueDate)}`,
    `Customer: ${profile?.fullName || 'Demo customer'}`,
    `Company: ${profile?.companyName || 'Demo company'}`,
    `Email: ${profile?.email || 'demo@brightloop.local'}`,
    '',
    'Line items',
  ]

  invoice.lineItems.forEach((item) => {
    lines.push(
      `${item.description} | Qty ${item.quantity} | Unit ${formatMoney(item.unitPrice, currency)} | Tax ${item.taxRate}% | ${formatMoney(item.total, currency)}`,
    )
  })

  lines.push(
    '',
    `Subtotal: ${formatMoney(invoice.totals.subtotal, currency)}`,
    `Discount: ${formatMoney(invoice.totals.discount, currency)}`,
    `Tax: ${formatMoney(invoice.totals.tax, currency)}`,
    `Total: ${formatMoney(invoice.totals.total, currency)}`,
    '',
    'Demo data only. No real invoice PDF was fetched.',
  )

  return new Blob([buildPdf(lines)], { type: 'application/pdf' })
}

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
