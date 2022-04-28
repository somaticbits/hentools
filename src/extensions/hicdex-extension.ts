import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const { http, print } = toolbox

  // const api = http.create({ baseURL: 'https://api.hicdex.com' })
  const api = http.create({ baseURL: 'https://api.teia.rocks/' })

  const queryRoyalties = `query Royalties($token: bigint!) {
        hic_et_nunc_token_by_pk(id: $token) {
            royalties
        }
    }`

  const queryCreator = `query Creator($token: bigint!) {
        hic_et_nunc_token_by_pk(id: $token) {
            creator {
                address
                name
            }
        }
    }`

  const querySwapIdPrice = `query SwapIdPrice($token: bigint!, $holder_id: String_comparison_exp!) {
        hic_et_nunc_token_by_pk(id: $token) {
            token_holders(where: {holder_id: $holder_id}) {
                token {
                    swaps {
                        id
                        price
                    }
                }
            }
        }
    }`

  const queryObjktAmount = `query ObjktAmount($token: bigint!, $holder_id: String_comparison_exp!) {
        hic_et_nunc_token_by_pk(id: $token) {
          id
          token_holders(where: {holder_id: $holder_id}) {
            quantity
          }
        }
      }
      `

  const fetchGraphQL = async (
    operationsDoc: string,
    operationName: string,
    variables: Record<string, unknown>
  ) => {
    const result = await api.post('/v1/graphql', {
      query: operationsDoc,
      variables: variables,
      operationName: operationName
    })
    return result
  }

  const fetchObjktRoyalties = async (objkt: number) => {
    const variables = { token: objkt.toString() }
    const response = await fetchGraphQL(queryRoyalties, 'Royalties', variables)
      .then(res => {
        if (res.ok) {
          return res.data
        }
      })
      .catch(e => print.error(e))
    return response['data']['hic_et_nunc_token_by_pk']['royalties']
  }

  const fetchObjktCreator = async (objkt: number) => {
    const variables = { token: objkt.toString() }
    const response = await fetchGraphQL(queryCreator, 'Creator', variables)
      .then(res => {
        if (res.ok) {
          return res.data
        }
      })
      .catch(e => print.error(e))
    return response['data']['hic_et_nunc_token_by_pk']['creator']
  }

  const fetchLatestSwapFromCreator = async (objkt: number) => {
    const variables = {
      token: objkt.toString(),
      holder_id: { _eq: (await fetchObjktCreator(objkt))['address'] }
    }
    const response = await fetchGraphQL(
      querySwapIdPrice,
      'SwapIdPrice',
      variables
    )
      .then(res => {
        if (res.ok) {
          return res.data
        }
      })
      .catch(e => print.error(e))
    const latestSwaps =
      response['data']['hic_et_nunc_token_by_pk']['token_holders'][0]['token'][
        'swaps'
      ]
    return latestSwaps[latestSwaps.length - 1]
  }

  const fetchObjktAmount = async (objkt: number, creator: string) => {
    const variables = {
      token: objkt.toString(),
      holder_id: { _eq: creator }
    }
    const response = await fetchGraphQL(
      queryObjktAmount,
      'ObjktAmount',
      variables
    )
      .then(res => {
        if (res.ok) {
          return res.data
        }
      })
      .catch(e => print.error(e))
    return response['data']['hic_et_nunc_token_by_pk']['token_holders'][0][
      'quantity'
    ]
  }

  toolbox.hicdex = {
    fetchObjktRoyalties,
    fetchObjktCreator,
    fetchLatestSwapFromCreator,
    fetchObjktAmount
  }
}
