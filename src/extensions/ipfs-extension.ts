import { GluegunToolbox } from 'gluegun'
import { create } from 'ipfs-http-client'

import { ObjktMetadata } from '../types'
import * as path from 'path'

module.exports = (toolbox: GluegunToolbox) => {
  const { print, config, filesystem } = toolbox

  const addFile = async (filePath: string, ipfsClient) => {
    const buffer: Buffer = filesystem.read(filePath, 'buffer')
    const fileInfo = await ipfsClient.add(buffer)
    return `ipfs://${fileInfo.path}`
  }

  const addMetadata = async (metadata: ObjktMetadata, ipfsClient) => {
    const buffer = Buffer.from(JSON.stringify(metadata))
    const metadataInfo = await ipfsClient.add(buffer)
    return `ipfs://${metadataInfo.path}`
  }

  const addToIpfs = async (filePath: string, metadata: ObjktMetadata) => {
    const ipfsClient = create({ url: config.hentools.infuraURL })

    print.info(`Adding ${path.basename(filePath)} to IPFS.`)

    const spinner = print.spin()

    await addFile(filePath, ipfsClient)
      .then(uri => {
        metadata.artifactUri = uri
        metadata.formats[0].uri = uri
      })
      .then(() => spinner.succeed(`File IPFS hash:\t ${metadata.artifactUri}`))
      .catch(() => spinner.fail(`Failed to upload file to IPFS`))

    let metaUri = ''
    await addMetadata(metadata, ipfsClient)
      .then(uri => (metaUri = uri))
      .then(uri => spinner.succeed(`Metadata IPFS hash:\t ${uri}`))
      .catch(() => spinner.fail(`Failed to upload metadata to IPFS`))

    spinner.stopAndPersist()

    return metaUri
  }

  toolbox.ipfs = { addToIpfs }
}
