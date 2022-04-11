<div id="top"></div>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/somaticbits/hentools">
    <img src="hentools.png" alt="Logo" width="553" height="56">
  </a>

<h3 align="center">hentools</h3>

  <p align="center">
    This repository contains the CLI tool used for operating directly on the smart contracts of the hicetnunc marketplace.
    <br />
    <a href="https://github.com/somaticbits/hentools/issues">Report Bug</a>
    ·
    <a href="https://github.com/somaticbits/hentools/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

The CLI tool is part of a bigger project of generative art called serialCore. It can be used to call the mint, swap, cancel and burn operations using the smart contracts directly instead of using the marketplace. It is not specific to the serialCore project, and can be used on any NFTs. Only conditions is that these tokens need to be either static images or videos.

The main framework used to create the CLI is [Gluegun](https://github.com/infinitered/gluegun). It allows the creation of a command line tool based on Node.js (Typescript / Javascript).

<p align="right">(<a href="#top">back to top</a>)</p>



### Built With

* [Taquito](https://tezostaquito.io/)
* [Gluegun](https://github.com/infinitered/gluegun)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

[Node.js 12.0+](https://nodejs.org/en/) and a [Tezos Wallet](https://templewallet.com/) is needed. Some art in the form of static images and/or videos would also be useful.

### Installation

1. Get a Tezos account (optional if you already have one)
2. Clone the repo and jump into the cloned folder
   ```sh
   git clone https://github.com/somaticbits/hentools.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Link the executable
   ```sh
   yarn link
   ```
4. Enter the secret key of your Tezos account before launching hentools
   ```sh
   hentools setup tz1...
   ```
5. (optional) In case the secret key is wrong or you want to remove it, you can reset it
   ```sh
   hentools setup -r
   ```

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

The main usage of this tool is the minting of NFTs on the hicetnunc marketplace.  

The best way to use it is to copy the `data` folder from the example folder. Add your assets into the folder (images or videos). And finally fill up the `automint.csv` file with the corresponding information (remove the example row first).

If you want to swap right after the minting operation, fill up the `swap_qty,xtz` fields.

Once this is done, you can batch mint your NFTs:  
`hentools mint './data'`

For the swapping procedure right after the minting, just add the `-s` option:  
`hentools mint './data' -s`

_For more examples, please refer to the [Documentation](https://github.com/somaticbits/hentools/blob/master/docs/commands.md)_

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Your Name - [@somaticbits](https://twitter.com/somaticbits) - david@somaticbits.com

Project Link: [https://github.com/somaticbits/hentools](https://github.com/somaticbits/hentools)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/somaticbits/hentools.svg?style=for-the-badge
[contributors-url]: https://github.com/somaticbits/hentools/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/somaticbits/hentools.svg?style=for-the-badge
[forks-url]: https://github.com/somaticbits/hentools/network/members
[stars-shield]: https://img.shields.io/github/stars/somaticbits/hentools.svg?style=for-the-badge
[stars-url]: https://github.com/somaticbits/hentools/stargazers
[issues-shield]: https://img.shields.io/github/issues/somaticbits/hentools.svg?style=for-the-badge
[issues-url]: https://github.com/somaticbits/hentools/issues
[license-shield]: https://img.shields.io/github/license/somaticbits/hentools.svg?style=for-the-badge
[license-url]: https://github.com/somaticbits/hentools/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
