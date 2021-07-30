import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const { http, print } = toolbox

  const api = http.create({ baseURL: 'https://api.hicdex.com' })

  const queryRoyalties = `query PriceHistory($token: bigint!) {
        hic_et_nunc_token_by_pk(id: $token) {
            royalties
        }
    }`

  const queryCreator = `query PriceHistory($token: bigint!) {
        hic_et_nunc_token_by_pk(id: $token) {
            creator {
                address
                name
            }
        }
    }`

  const querySwapIdPrice = `query PriceHistory($token: bigint!, $holder_id: String_comparison_exp!) {
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

  const fetchGraphQL = async (
    operationsDoc: string,
    operationName: string,
    variables: {}
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
    const response = await fetchGraphQL(
      queryRoyalties,
      'PriceHistory',
      variables
    )
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
    const response = await fetchGraphQL(queryCreator, 'PriceHistory', variables)
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
      'PriceHistory',
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

  toolbox.hicdex = {
    fetchObjktRoyalties,
    fetchObjktCreator,
    fetchLatestSwapFromCreator
  }
}
