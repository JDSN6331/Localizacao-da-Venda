/**
 * Static mapping of branch names to mesoregion (regional) and analyst.
 * Source: "FILIAL - MESOREGIAO v1.xlsx"
 *
 * Branch names include the code prefix (e.g. "L01:", "300:") to match
 * the format used in the orders CSV data.
 */

export type MesoregionEntry = {
  branch: string
  mesoregion: string
  analyst: string
}

export type MesoregionAnalysis = {
  name: string
  analyst: string
  orders: number
  balcaoOrders: number
  campoOrders: number
  balcaoRevenue: number
  campoRevenue: number
  totalRevenue: number
  avgTicket: number
  campoPercent: number
  branchCount: number
}

/**
 * Raw mapping data extracted from the spreadsheet.
 * Branch names use the exact format from the CSV (code:name).
 */
export const BRANCH_MESOREGION_MAP: MesoregionEntry[] = [
  // REGIONAL - Ana Cassia Moreira Reis
  { branch: '300:Unidade Avançada Muzambinho',                mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },
  { branch: 'L27:Loja Conceição Aparecida',                   mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },
  { branch: '302:Unidade Avançada Botelhos',                   mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },
  { branch: '303:Unidade Avançada Monte Belo',                 mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },
  { branch: 'L01:Loja Matriz Guaxupé',                        mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },
  { branch: 'L01:Loja Matriz',                                mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },
  { branch: 'L04:Loja Cabo Verde',                            mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },
  { branch: 'L06:Loja Guaranésia',                            mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },
  { branch: 'L07:Loja Nova Resende',                          mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },
  { branch: 'L08:Loja São Pedro da União',                    mesoregion: 'Ana Cassia',    analyst: 'Ana Cassia Moreira Reis' },

  // REGIONAL - Leiliele Cristina Terra Santos
  { branch: '306:Unidade Avançada Campos Altos',               mesoregion: 'Leiliele',      analyst: 'Leiliele Cristina Terra Santos' },
  { branch: '310:Unidade Avançada Lambari',                    mesoregion: 'Leiliele',      analyst: 'Leiliele Cristina Terra Santos' },
  { branch: '320:Unidade Avançada Itamogi',                    mesoregion: 'Leiliele',      analyst: 'Leiliele Cristina Terra Santos' },
  { branch: 'L03:Loja Monte Santo de Minas',                  mesoregion: 'Leiliele',      analyst: 'Leiliele Cristina Terra Santos' },
  { branch: 'L05:Loja Caconde',                               mesoregion: 'Leiliele',      analyst: 'Leiliele Cristina Terra Santos' },
  { branch: 'L10:Loja Carmo do Rio Claro',                    mesoregion: 'Leiliele',      analyst: 'Leiliele Cristina Terra Santos' },
  { branch: 'L11:Loja São José do Rio Pardo',                 mesoregion: 'Leiliele',      analyst: 'Leiliele Cristina Terra Santos' },
  { branch: 'L14:Loja Alpinópolis',                           mesoregion: 'Leiliele',      analyst: 'Leiliele Cristina Terra Santos' },
  { branch: 'L19:Loja Campestre',                             mesoregion: 'Leiliele',      analyst: 'Leiliele Cristina Terra Santos' },

  // REGIONAL - Thalles da Silva Rodrigues
  { branch: '076:Loja Campos Gerais',                          mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },
  { branch: '308:Unidade Avançada Piumhi',                     mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },
  { branch: '309:Unidade Avançada Santo Antonio do Amparo',    mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },
  { branch: '311:Unidade Avançada Andradas',                   mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },
  { branch: 'L25:Loja Espirito Santo do Pinhal',              mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },
  { branch: '312:Unidade Avançada Nepomuceno',                 mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },
  { branch: 'L12:Loja Monte Carmelo',                         mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },
  { branch: 'L16:Loja Coromandel',                            mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },
  { branch: 'L22:Loja Patrocínio',                            mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },
  { branch: 'L24:Loja Ibiraci',                               mesoregion: 'Thalles',       analyst: 'Thalles da Silva Rodrigues' },

  // REGIONAL - Rafael Lasaro Moreira da Silva
  { branch: '313:Unidade Avançada Altinópolis',                mesoregion: 'Rafael',        analyst: 'Rafael Lasaro Moreira da Silva' },
  { branch: '315:Unidade Avançada São Sebastião do Paraiso',   mesoregion: 'Rafael',        analyst: 'Rafael Lasaro Moreira da Silva' },
  { branch: '317:Unidade Avançada Boa Esperança',              mesoregion: 'Rafael',        analyst: 'Rafael Lasaro Moreira da Silva' },
  { branch: '318:Unidade Avançada Machado',                    mesoregion: 'Rafael',        analyst: 'Rafael Lasaro Moreira da Silva' },
  { branch: 'L09:Loja Alfenas',                               mesoregion: 'Rafael',        analyst: 'Rafael Lasaro Moreira da Silva' },
  { branch: 'L15:Loja Rio Paranaíba',                         mesoregion: 'Rafael',        analyst: 'Rafael Lasaro Moreira da Silva' },
  { branch: 'L18:Loja Serra do Salitre',                      mesoregion: 'Rafael',        analyst: 'Rafael Lasaro Moreira da Silva' },
  { branch: 'L20:Loja Araguari',                              mesoregion: 'Rafael',        analyst: 'Rafael Lasaro Moreira da Silva' },
  { branch: 'L23:Loja Manhuaçu',                              mesoregion: 'Rafael',        analyst: 'Rafael Lasaro Moreira da Silva' },
]

// Build a lookup map for fast access
const _mesoLookup = new Map<string, MesoregionEntry>()
for (const entry of BRANCH_MESOREGION_MAP) {
  _mesoLookup.set(entry.branch.toLowerCase(), entry)
}

/**
 * Lookup helper: given a branch name from the orders data,
 * returns the mesoregion (regional) it belongs to.
 * Falls back to 'Sem Regional' if the branch is not mapped.
 */
export function getMesoregion(branchName: string): string {
  return _mesoLookup.get(branchName.toLowerCase())?.mesoregion ?? 'Sem Regional'
}

/**
 * Lookup helper: given a branch name, returns the analyst.
 */
export function getAnalyst(branchName: string): string {
  return _mesoLookup.get(branchName.toLowerCase())?.analyst ?? 'N/A'
}

/**
 * Gets the full analyst name for a short mesoregion name.
 */
export function getAnalystByMesoregion(mesoregion: string): string {
  const entry = BRANCH_MESOREGION_MAP.find((e) => e.mesoregion === mesoregion)
  return entry?.analyst ?? mesoregion
}

/**
 * Unique list of mesoregion names (short).
 */
export const MESOREGION_NAMES = [...new Set(BRANCH_MESOREGION_MAP.map((e) => e.mesoregion))]
