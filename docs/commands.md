# Command Reference for hentools

## setup

NAME  
setup

SYNOPSIS  
**setup [-r]**

DESCRIPTION  
**setup** hentools by adding the secret key.
Generates Tz Address associated to it automatically.

OPTIONS  
-r reset the secret key by deleting the file

## mint

NAME  
mint

SYNOPSIS  
**mint [-s]** *folder*

DESCRIPTION  
**mint** NFTs by parsing a csv file (file format: *swaps.csv* / *swaps.x.csv* where x is a digit) from **folder**. Uploads the files to IPFS, followed by interaction with hic et nunc's smart contracts. Direct follow-up swapping is possible.

OPTIONS  
-s allows to swap directly after the mint process (*autoswaps.csv* can be generated via the **csv-generator** )


## swap

## cancel

// TODO: burn

// TODO: csv templates

hicdex
