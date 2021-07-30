export type ObjktMetadata = {
  name: string
  description: string
  tags: Array<string>
  symbol: string // const
  artifactUri: string
  displayUri: string
  thumbnailUri: string // const
  creators: [string]
  formats: [
    {
      uri: string
      mimeType: string | boolean
    }
  ]
  decimals: number // const
  isBooleanAmount: boolean // const
  shouldPreferSymbol: boolean // const
}
