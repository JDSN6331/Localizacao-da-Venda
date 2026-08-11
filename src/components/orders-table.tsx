import { useState, useMemo } from 'react'
import { FileSpreadsheet, Search } from 'lucide-react'
import * as XLSX from 'xlsx'

import type { OrderRecord } from '@/types/dashboard'
import { formatCurrency, formatFullDate } from '@/utils/format'

type OrdersTableProps = {
  records: OrderRecord[]
}

export function OrdersTable({ records }: OrdersTableProps) {
  const [search, setSearch] = useState('')

  // Filtragem local
  const filteredRecords = useMemo(() => {
    const term = search.toLowerCase().trim()
    
    // Filtra apenas pelo número do pedido (ou pedido ERP)
    const filtered = term
      ? records.filter((r) => {
          return (
            r.orderNumber.toLowerCase().includes(term) ||
            r.erpOrderNumber.toLowerCase().includes(term)
          )
        })
      : records

    // Ordena por data decrescente (mais recentes primeiro)
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.orderNumber.localeCompare(a.orderNumber))
  }, [records, search])

  // Mostrar até 30 registros
  const visibleRecords = useMemo(() => {
    return filteredRecords.slice(0, 30)
  }, [filteredRecords])

  // Função de exportação para Excel (XLSX)
  const handleExportXlsx = () => {
    const dataToExport = filteredRecords.map((row) => ({
      'Data de início do pedido': formatFullDate(row.date),
      'Número do pedido': row.orderNumber,
      'Número do Pedido ERP': row.erpOrderNumber,
      'Matricula do cooperado': row.memberId,
      'Nome da conta': row.accountName,
      'Filial': row.branch,
      'Código do vendedor 01': row.sellerCode,
      'Vendedor 01': row.sellerName,
      'Informação da Geolocalização': row.geoInfo ? JSON.stringify(row.geoInfo) : '',
      'Local de Venda': row.saleLocation,
      'Status': row.status,
      'Valor do pedido': row.orderValue
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)

    // Ajustar a largura das colunas
    const columnWidths = [
      { wch: 12 }, // Data
      { wch: 12 }, // Pedido
      { wch: 15 }, // Pedido ERP
      { wch: 18 }, // Matrícula
      { wch: 35 }, // Cliente
      { wch: 25 }, // Filial
      { wch: 18 }, // Cód Vendedor
      { wch: 30 }, // Vendedor
      { wch: 25 }, // Geo
      { wch: 15 }, // Local
      { wch: 12 }, // Status
      { wch: 15 }  // Valor
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos')

    XLSX.writeFile(workbook, `agrodash_pedidos_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="overflow-hidden rounded-3xl glass-card">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-sans text-lg font-bold text-slate-800">Tabela analítica (Apenas os 30 primeiros)</h3>
          <p className="text-xs text-slate-400">
            Apenas os primeiros 30 registros são exibidos na lista. Para extrair todos os {filteredRecords.length} registros localizados, utilize a exportação para XLSX.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Caixa de busca textual */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pedido..."
              className="w-full max-w-xs rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs outline-none transition focus:border-[#133c24] focus:ring-1 focus:ring-[#133c24]/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Botão de Exportar Excel */}
          <button
            onClick={handleExportXlsx}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-[#2E7D32] shadow-sm transition-all duration-200 hover:border-[#2E7D32] hover:bg-[#2E7D32] hover:text-white whitespace-nowrap"
            type="button"
            title="Exportar dados para Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4 transition-colors duration-200" />
            Exportar Excel
          </button>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wider text-slate-600 font-bold border border-slate-200">
            {records.length} pedidos totais
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto px-6 pb-6">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm text-slate-600">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-3 pr-4">Data</th>
              <th className="pb-3 pr-4">Pedido</th>
              <th className="pb-3 pr-4">Cliente</th>
              <th className="pb-3 pr-4">Filial</th>
              <th className="pb-3 pr-4">Vendedor</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Local</th>
              <th className="pb-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium">
            {visibleRecords.map((record) => (
              <tr key={`${record.orderNumber}-${record.erpOrderNumber}`} className="hover:bg-slate-50/50 transition">
                <td className="py-3 pr-4 text-slate-500 font-semibold">{formatFullDate(record.date)}</td>
                <td className="py-3 pr-4 text-slate-800 font-bold">{record.orderNumber}</td>
                <td className="py-3 pr-4 text-slate-600 font-semibold">{record.accountName}</td>
                <td className="py-3 pr-4 text-slate-600">{record.branch}</td>
                <td className="py-3 pr-4 text-slate-600">{record.sellerName}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
                    record.status === 'Integrado'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
                    record.saleLocation === 'Filial'
                      ? 'bg-[#133c24]/10 text-[#133c24]'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {record.saleLocation}
                  </span>
                </td>
                <td className="py-3 text-right font-bold text-slate-800">{formatCurrency(record.orderValue)}</td>
              </tr>
            ))}
            {visibleRecords.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                  Nenhum pedido localizado para a busca informada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
