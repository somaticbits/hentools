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
``mint [-s] [-t] desiredObjktId folder``

**DESCRIPTION**  
``mint`` NFTs by parsing a csv file  from *folder* (file format: *automint.csv*).  
Uploads the files to IPFS, followed by interaction with hic et nunc's smart contracts.  
Direct follow-up swapping is possible.

**OPTIONS**  
``-s`` allows to swap directly after the mint process 
``-t`` allows to mint a certain desired OBJKT ID, works only if the OBJKT ID is not already minted

**EXAMPLE**  
Minting all images from ``./data`` folder and swapping them after  
``hentools mint './data' -s``

Minting OBJKT ID 1000 from ``./data`` folder and swapping them after  
``hentools mint './data' -t 1000 -s``

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
``cancel`` swaps by pulling latest swap ID from owner and cancelling it

**OPTIONS**  
none

**EXAMPLE**  
Cancelling OBJKTs #1234 and #1345  
``hentools cancel 1234 1345``

## buy
**NAME**
buy

**SYNOPSIS**  
``buy objkt1 ...``

**DESCRIPTION**  
``buy`` objkt directly from creator. Batch buying is possible. Currently only one edition per NFT.   
The buying process needs a confirmation before being activated (yes or No).

**OPTIONS**  
none

**EXAMPLE**  
Buying OBJKT #1234 and #19283  
``hentools buy 1234 19283``

## hicdex
**NAME**  
hicdex

**SYNOPSIS**  
``hicdex [-c] [-s] [-r] [-p] [-a] objktId``

**DESCRIPTION**  
Pull various informations from ``hicdex.com``. Used by the tools internally.

**OPTIONS**  
``-c``  get the creator of the OBJKT  
``-s``  get the latest Swap ID from the OBJKT from the wallet registered with hentools  
``-r``  get the royalties from the OBJKT  
``-p``  get the price of the OBJKT  
``-a``  get the amount of the OBJKT owned  

**EXAMPLE**  
Get the creator of OBJKT #715554  
``hentools hicdex -c 715554``

Get the latest Swap ID from OBJKT #715554   
``hentools hicdex -s 715554``

Get the royalties from OBJKT #715554  
``hentools hicdex -r 715554``

Get the price from OBJKT #715554  
``hentools hicdex -p 715554``

Get the amount of OBJKT #715554 owned  
``hentools hicdex -a 715554``

## transfer
**NAME**  
transfer

**SYNOPSIS**  
``hicdex transfer [-t] address objktId``

**DESCRIPTION**  
Used for transferring NFTs to another account

**OPTIONS**  
``-t``  target address  

**EXAMPLE**  
Send OBJKT #715554 to burn address  
``hentools transfer 715554 -t 'tz1burnburnburnburnburnburnburjAYjjX'``

Send OBJKTs #715554 #715555 #715556 to burn address  
``hentools transfer 715554 715555 715556 -t 'tz1burnburnburnburnburnburnburjAYjjX'``

