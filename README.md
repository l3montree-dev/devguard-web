<!--
 Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
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

  <picture>
    <source srcset="public/logo_inverse_horizontal.svg"  media="(prefers-color-scheme: dark)">
    <img src="public/logo_horizontal.svg" alt="DevGuard by L3montree Logo" width="240" height="80">
  </picture>

  <h3 align="center">DevGuard - Develop Secure Software - Frontend</h3>

  <p align="center">
    Manage your CVEs seamlessly, Integrate your Vulnerability Scanners, Documentation made easy, Compliance to security Frameworks
    <br />
    <br />
    <a href="https://github.com/l3montree-dev/devguard-web/issues">Report Bug</a>
    ·
    <a href="https://github.com/l3montree-dev/devguard-web/issues">Request Feature</a>
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
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="##code-of-conduct">Code of Conduct</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

DevGuard is a vulnerability management that fits perfectly into any IT environment and ensures mitigation of vulnerabilities and complete documentation of the handling processes. It aims to be compliant to various security frameworks, like ISO 27001 or German BSI Grundschutz.
With DevGuard you can easily go through the vulnerability management process: 

1. Consolidation of vulnerabilities
2. Enhancing the data
3. Risk Assessment
4. Selection of the mitigation type
5. Sharing of the vulnerability information to responsible parties
6. Reporting

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Demo

We are using DevGuard to scan and manage the risks of DevGuard itself—essentially eating our own dogfood. The project can be found here:

[DEMO](https://main.devguard.org/l3montree-cybersecurity/projects/devguard)

We believe VEX information should be shared via a link due to its dynamic nature, as what is risk-free today may be affected by a CVE tomorrow. We've integrated the DevGuard risk scoring into the metrics, with detailed documentation on its calculation to follow soon. SBOM and VEX data are always up to date at these links: 

|Project|SBOM|VeX|
|---|---|---|
|[Devguard Golang API](https://github.com/l3montree-dev/devguard)|[SBOM](https://main.devguard.org/l3montree-cybersecurity/projects/devguard/assets/devguard/sbom.json?scanType=container-scanning)|[VeX](https://main.devguard.org/l3montree-cybersecurity/projects/devguard/assets/devguard/vex.json?scanType=container-scanning)|
|[Devguard Web-Frontend](https://github.com/l3montree-dev/devguard-web)|[SBOM](https://main.devguard.org/l3montree-cybersecurity/projects/devguard/assets/devguard-web/sbom.json?scanType=container-scanning)|[VeX](https://main.devguard.org/l3montree-cybersecurity/projects/devguard/assets/devguard-web/vex.json?scanType=container-scanning)|


### Built With

DevGuard is divided into two projects: A frontend (DevGuard Web) and a backend (DevGuard Backend). 

**Frontend (this project):**
* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]

**Backend:**
* [![Go][go.dev]][go-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

1. Clone the repo
   ```sh
   git clone https://github.com/l3montree-dev/devguard-web.git
   ```
2. Copy .env.example to .env
   ```sh
   cp .env.example .env
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Start the development server
   ```sh
   npm run dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap MVP

- [x] Consolidation of vulnerabilities
- [X] Enhancing the data
- [x] Risk Assessment
- [x] Selection of the mitigation type
- [ ] Sharing of the vulnerability information to responsible parties
- [ ] Reporting
- [ ] Multi-language Support
    - [ ] German
    - [ ] English

See the [open issues](https://github.com/l3montree-dev/devguard-web/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Please read our contribution guide if you would like to report a bug, ask a question, or help us with coding.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- Code of Conduct -->
## Code of Conduct

Help us keep DevGuard open and inclusive. Please read and follow our Code of Conduct.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the AGPL-3.0-or-later License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[go.dev]: https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white
[go-url]: https://go.dev


## Build using kaniko
```bash
docker run --rm -v $(pwd):/workspace gcr.io/kaniko-project/executor:latest --dockerfile=/workspace/Dockerfile --context=/workspace --tarPath=/workspace/image.tar --no-push
```
