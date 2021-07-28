import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

    const { http, print } = toolbox

    const api = http.create({baseURL: 'https://api.hicdex.com'})

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

    const querySwapId = `query PriceHistory($token: bigint!) {
        hic_et_nunc_token_by_pk(id: $token) {
            swaps {
              id
            }
          }
        }`

    const fetchGraphQL = async (operationsDoc: string, operationName: string, variables: {}) => {
        const result = await api.post('/v1/graphql',{
            query: operationsDoc,
            variables: variables,
            operationName: operationName
        })

        return result
    }

    const fetchObjktRoyalties = async (objkt: number) => {
        const variables = {'token':objkt.toString()}
        const response = await fetchGraphQL(queryRoyalties, 'PriceHistory', variables)
            .then((res) => {if (res.ok) { return res.data}})
            .catch(e => print.error(e))
        return response['data']['hic_et_nunc_token_by_pk']['royalties']
    }

    const fetchObjktCreator = async (objkt: number) => {
        const variables = {'token':objkt.toString()}
        const response = await fetchGraphQL(queryCreator, 'PriceHistory', variables)
            .then((res) => {if (res.ok) { return res.data}})
            .catch(e => print.error(e))
        return response['data']['hic_et_nunc_token_by_pk']['creator']
    }

    const fetchObjktSwapId = async (objkt: number) => {
        const variables = {'token':objkt.toString()}
        const response = await fetchGraphQL(querySwapId, 'PriceHistory', variables)
            .then((res) => {if (res.ok) { return res.data}})
            .catch(e => print.error(e))
        return response['data']['hic_et_nunc_token_by_pk']['swaps']
    }

    toolbox.hicdex = { fetchObjktRoyalties, fetchObjktCreator, fetchObjktSwapId }
}