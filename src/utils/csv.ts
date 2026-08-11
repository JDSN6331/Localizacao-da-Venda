import type { OrderRecord } from '@/types/dashboard'

const HEADER_MAP: Record<string, keyof OrderRecord | 'skip'> = {
  'Data de início do pedido': 'date',
  'Número do pedido': 'orderNumber',
  'Número do Pedido ERP': 'erpOrderNumber',
  'Matricula do cooperado': 'memberId',
  'Nome da conta': 'accountName',
  Filial: 'branch',
  'Código do vendedor 01': 'sellerCode',
  'Vendedor 01': 'sellerName',
  'Informação da Geolocalização': 'geoInfo',
  'Local de Venda': 'saleLocation',
  Status: 'status',
  'Valor do pedido': 'orderValue',
}

function splitCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ';' && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }

    current += char
  }

  cells.push(current)
  return cells.map((cell) => cell.trim())
}

function parseBrazilianNumber(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseBrazilianDate(value: string) {
  const [dayStr, monthStr, yearStr] = value.split('/')
  const day = Number(dayStr)
  const month = Number(monthStr)
  const year = Number(yearStr)

  const dateObj = new Date(Date.UTC(year, month - 1, day))

  const y = dateObj.getUTCFullYear()
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getUTCDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}

export function parseOrdersCsv(csvText: string) {
  const normalizedText = csvText.replace(/^\uFEFF/, '')
  const lines = normalizedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length <= 1) {
    return []
  }

  const [headerLine, ...dataLines] = lines
  const headers = splitCsvLine(headerLine)

  return dataLines.map((line) => {
    const values = splitCsvLine(line)
    const record = {
      date: '',
      orderNumber: '',
      erpOrderNumber: '',
      memberId: '',
      accountName: '',
      branch: '',
      sellerCode: '',
      sellerName: '',
      geoInfo: null,
      saleLocation: '',
      status: '',
      orderValue: 0,
    } satisfies OrderRecord

    headers.forEach((header, index) => {
      const mappedKey = HEADER_MAP[header]
      const rawValue = values[index] ?? ''

      if (!mappedKey || mappedKey === 'skip') {
        return
      }

      if (mappedKey === 'date') {
        record.date = parseBrazilianDate(rawValue)
        return
      }

      if (mappedKey === 'orderValue') {
        record.orderValue = parseBrazilianNumber(rawValue)
        return
      }

      if (mappedKey === 'geoInfo') {
        record.geoInfo = rawValue || null
        return
      }

      record[mappedKey] = rawValue
    })

    return record
  })
}
