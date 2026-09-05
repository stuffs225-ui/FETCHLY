import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Renders a DOM element (the hidden A4 quotation template) to a PDF blob.
 *
 * We rasterize the actual rendered DOM via html2canvas rather than drawing
 * text with jsPDF directly, because jsPDF has no Arabic text shaping
 * (letters wouldn't join, and RTL order would break). The browser already
 * shapes Arabic correctly when it paints the DOM, so capturing that paint
 * as an image guarantees correct Arabic typography in the output PDF.
 */
export async function elementToPdfBlob(el: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    windowWidth: el.scrollWidth,
    // Fail fast on a blocked/slow external resource (e.g. a font request)
    // rather than stalling PDF generation for the browser's full network
    // timeout.
    imageTimeout: 4000,
  })

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidthMm = pageWidth
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width
  const imgData = canvas.toDataURL('image/png')

  let heightLeft = imgHeightMm
  let position = 0
  pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeightMm
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm)
    heightLeft -= pageHeight
  }

  return pdf.output('blob')
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function openBlobInNewTab(blob: Blob) {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
