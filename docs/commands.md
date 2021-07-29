# Command Reference for hentools

## setup

**NAME**  
setup

**SYNOPSIS**  
``setup [-r]``

**DESCRIPTION**  
``setup`` hentools by saving the secret key.
Generates Tz Address associated to it via the Tezos Wallet PKH method.

**OPTIONS**  
``-r`` reset the secret key by deleting the file

## mint

**NAME**  
mint

**SYNOPSIS**  
``mint [-s] folder``

**DESCRIPTION**  
``mint`` NFTs by parsing a csv file  from *folder* (file format: *automint.csv*).  
Uploads the files to IPFS, followed by interaction with hic et nunc's smart contracts.  
Direct follow-up swapping is possible.

**OPTIONS**  
``-s`` allows to swap directly after the mint process (*autoswaps.csv* can be generated via the **csv-generator**)

**EXAMPLE**  
Minting all images from ``./data`` folder and swapping them after  
``hentools mint './data' -s``

## swap
**NAME**  
swap

**SYNOPSIS**  
``swap folder``

**DESCRIPTION**  
``swap`` NFTs by parsing a csv file from *folder* (file format: *swaps.csv* / *swaps.x.csv* where x is a digit)

**OPTIONS**  
none

**EXAMPLE**  
Swapping all OBJKTs from ``./data/swaps.csv`` file  
``hentools swap './data'``

## cancel
**NAME**  
cancel

**SYNOPSIS**  
``cancel objkt1 ...``

**DESCRIPTION**  
``cancel`` swaps by pulling latest swap ID from owner and cancelling swap

**OPTIONS**  
none

**EXAMPLE**  
Cancelling OBJKTs #1234 and #1345  
``hentools cancel 1234 1345``

##hicdex
**NAME**  
hicdex

**SYNOPSIS**  
``hicdex [-c] [-s] [-r]``

**DESCRIPTION**  
pull various informations from ``hicdex.com``. Used by the tools internally.

**OPTIONS**  
``-c``  
``-s``  
``-r``  

**EXAMPLE**


// TODO: burn

// TODO: csv templates

// TODO: buy NFT


