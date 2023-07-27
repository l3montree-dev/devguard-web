// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

export default function OrgRegisterForm() {
  return (
    <form className="mt-8">
      <div className="space-y-12">
        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-white">
            Required Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            General and required information about your organization.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="organisation-name"
                className="block text-sm font-medium leading-6 text-white"
              >
                Organization name *
              </label>
              <div className="mt-2">
                <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500">
                  <input
                    required
                    type="text"
                    name="organization"
                    id="organization"
                    autoComplete="organization"
                    className="flex-1 border-0 bg-transparent py-1.5 pl-2.5 text-white focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="My cool organization..."
                  />
                </div>
              </div>
            </div>
          </div>
          <fieldset>
            <div className="mt-6 space-y-6">
              <div className="relative flex gap-x-3">
                <div className="flex h-6 items-center">
                  <input
                    id="permission"
                    name="permission"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
                  />
                </div>
                <div className="text-sm leading-6">
                  <label
                    htmlFor="permission"
                    className="font-medium text-white"
                  >
                    Permission *
                  </label>
                  <p className="text-gray-400">
                    I am authorized to create an organization account on behalf
                    of my organization. For legal entities, I have a right of
                    representation.
                  </p>
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="">
          <h2 className="text-base font-semibold leading-7 text-white">
            Optional Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Help us to improve FlawFix.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="tel"
                className="block text-sm font-medium leading-6 text-white"
              >
                Contact phone number
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="tel"
                  id="tel"
                  autoComplete="tel"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                  placeholder="+49 123 456 789"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="number-of-employees"
                className="block text-sm font-medium leading-6 text-white"
              >
                Number of employees
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="number-of-employees"
                  id="number-of-employees"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="country"
                className="block text-sm font-medium leading-6 text-white"
              >
                Country
              </label>
              <div className="mt-2">
                <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 [&_*]:text-black"
                >
                  <option>Germany</option>
                  <option>Afghanistan</option>
                  <option>Åland Islands</option>
                  <option>Albania</option>
                  <option>Algeria</option>
                  <option>American Samoa</option>
                  <option>Andorra</option>
                  <option>Angola</option>
                  <option>Anguilla</option>
                  <option>Antarctica</option>
                  <option>Antigua and Barbuda</option>
                  <option>Argentina</option>
                  <option>Armenia</option>
                  <option>Aruba</option>
                  <option>Australia</option>
                  <option>Austria</option>
                  <option>Azerbaijan</option>
                  <option>Bahamas</option>
                  <option>Bahrain</option>
                  <option>Bangladesh</option>
                  <option>Barbados</option>
                  <option>Belarus</option>
                  <option>Belgium</option>
                  <option>Belize</option>
                  <option>Benin</option>
                  <option>Bermuda</option>
                  <option>Bhutan</option>
                  <option>Bolivia, Plurinational State of</option>
                  <option>Bonaire, Sint Eustatius and Saba</option>
                  <option>Bosnia and Herzegovina</option>
                  <option>Botswana</option>
                  <option>Bouvet Island</option>
                  <option>Brazil</option>
                  <option>British Indian Ocean Territory</option>
                  <option>Brunei Darussalam</option>
                  <option>Bulgaria</option>
                  <option>Burkina Faso</option>
                  <option>Burundi</option>
                  <option>Cambodia</option>
                  <option>Cameroon</option>
                  <option>Canada</option>
                  <option>Cape Verde</option>
                  <option>Cayman Islands</option>
                  <option>Central African Republic</option>
                  <option>Chad</option>
                  <option>Chile</option>
                  <option>China</option>
                  <option>Christmas Island</option>
                  <option>Cocos (Keeling) Islands</option>
                  <option>Colombia</option>
                  <option>Comoros</option>
                  <option>Congo</option>
                  <option>Congo, the Democratic Republic of the</option>
                  <option>Cook Islands</option>
                  <option>Costa Rica</option>
                  <option>Côte d Ivoire</option>
                  <option>Croatia</option>
                  <option>Cuba</option>
                  <option>Curaçao</option>
                  <option>Cyprus</option>
                  <option>Czech Republic</option>
                  <option>Denmark</option>
                  <option>Djibouti</option>
                  <option>Dominica</option>
                  <option>Dominican Republic</option>
                  <option>Ecuador</option>
                  <option>Egypt</option>
                  <option>El Salvador</option>
                  <option>Equatorial Guinea</option>
                  <option>Eritrea</option>
                  <option>Estonia</option>
                  <option>Ethiopia</option>
                  <option>Falkland Islands (Malvinas)</option>
                  <option>Faroe Islands</option>
                  <option>Fiji</option>
                  <option>Finland</option>
                  <option>France</option>
                  <option>French Guiana</option>
                  <option>French Polynesia</option>
                  <option>French Southern Territories</option>
                  <option>Gabon</option>
                  <option>Gambia</option>
                  <option>Georgia</option>
                  <option>Ghana</option>
                  <option>Gibraltar</option>
                  <option>Greece</option>
                  <option>Greenland</option>
                  <option>Grenada</option>
                  <option>Guadeloupe</option>
                  <option>Guam</option>
                  <option>Guatemala</option>
                  <option>Guernsey</option>
                  <option>Guinea</option>
                  <option>Guinea-Bissau</option>
                  <option>Guyana</option>
                  <option>Haiti</option>
                  <option>Heard Island and McDonald Islands</option>
                  <option>Holy See (Vatican City State)</option>
                  <option>Honduras</option>
                  <option>Hong Kong</option>
                  <option>Hungary</option>
                  <option>Iceland</option>
                  <option>India</option>
                  <option>Indonesia</option>
                  <option>Iran, Islamic Republic of</option>
                  <option>Iraq</option>
                  <option>Ireland</option>
                  <option>Isle of Man</option>
                  <option>Israel</option>
                  <option>Italy</option>
                  <option>Jamaica</option>
                  <option>Japan</option>
                  <option>Jersey</option>
                  <option>Jordan</option>
                  <option>Kazakhstan</option>
                  <option>Kenya</option>
                  <option>Kiribati</option>
                  <option>Korea, Democratic Peoples Republic of</option>
                  <option>Korea, Republic of</option>
                  <option>Kuwait</option>
                  <option>Kyrgyzstan</option>
                  <option>Lao Peoples Democratic Republic</option>
                  <option>Latvia</option>
                  <option>Lebanon</option>
                  <option>Lesotho</option>
                  <option>Liberia</option>
                  <option>Libya</option>
                  <option>Liechtenstein</option>
                  <option>Lithuania</option>
                  <option>Luxembourg</option>
                  <option>Macao</option>
                  <option>Macedonia, the Former Yugoslav Republic of</option>
                  <option>Madagascar</option>
                  <option>Malawi</option>
                  <option>Malaysia</option>
                  <option>Maldives</option>
                  <option>Mali</option>
                  <option>Malta</option>
                  <option>Marshall Islands</option>
                  <option>Martinique</option>
                  <option>Mauritania</option>
                  <option>Mauritius</option>
                  <option>Mayotte</option>
                  <option>Mexico</option>
                  <option>Micronesia, Federated States of</option>
                  <option>Moldova, Republic of</option>
                  <option>Monaco</option>
                  <option>Mongolia</option>
                  <option>Montenegro</option>
                  <option>Montserrat</option>
                  <option>Morocco</option>
                  <option>Mozambique</option>
                  <option>Myanmar</option>
                  <option>Namibia</option>
                  <option>Nauru</option>
                  <option>Nepal</option>
                  <option>Netherlands</option>
                  <option>New Caledonia</option>
                  <option>New Zealand</option>
                  <option>Nicaragua</option>
                  <option>Niger</option>
                  <option>Nigeria</option>
                  <option>Niue</option>
                  <option>Norfolk Island</option>
                  <option>Northern Mariana Islands</option>
                  <option>Norway</option>
                  <option>Oman</option>
                  <option>Pakistan</option>
                  <option>Palau</option>
                  <option>Palestine, State of</option>
                  <option>Panama</option>
                  <option>Papua New Guinea</option>
                  <option>Paraguay</option>
                  <option>Peru</option>
                  <option>Philippines</option>
                  <option>Pitcairn</option>
                  <option>Poland</option>
                  <option>Portugal</option>
                  <option>Puerto Rico</option>
                  <option>Qatar</option>
                  <option>Réunion</option>
                  <option>Romania</option>
                  <option>Russian Federation</option>
                  <option>Rwanda</option>
                  <option>Saint Barthélemy</option>
                  <option>Saint Helena, Ascension and Tristan da Cunha</option>
                  <option>Saint Kitts and Nevis</option>
                  <option>Saint Lucia</option>
                  <option>Saint Martin (French part)</option>
                  <option>Saint Pierre and Miquelon</option>
                  <option>Saint Vincent and the Grenadines</option>
                  <option>Samoa</option>
                  <option>San Marino</option>
                  <option>Sao Tome and Principe</option>
                  <option>Saudi Arabia</option>
                  <option>Senegal</option>
                  <option>Serbia</option>
                  <option>Seychelles</option>
                  <option>Sierra Leone</option>
                  <option>Singapore</option>
                  <option>Sint Maarten (Dutch part)</option>
                  <option>Slovakia</option>
                  <option>Slovenia</option>
                  <option>Solomon Islands</option>
                  <option>Somalia</option>
                  <option>South Africa</option>
                  <option>South Georgia and the South Sandwich Islands</option>
                  <option>South Sudan</option>
                  <option>Spain</option>
                  <option>Sri Lanka</option>
                  <option>Sudan</option>
                  <option>Suriname</option>
                  <option>Svalbard and Jan Mayen</option>
                  <option>Swaziland</option>
                  <option>Sweden</option>
                  <option>Switzerland</option>
                  <option>Syrian Arab Republic</option>
                  <option>Taiwan, Province of China</option>
                  <option>Tajikistan</option>
                  <option>Tanzania, United Republic of</option>
                  <option>Thailand</option>
                  <option>Timor-Leste</option>
                  <option>Togo</option>
                  <option>Tokelau</option>
                  <option>Tonga</option>
                  <option>Trinidad and Tobago</option>
                  <option>Tunisia</option>
                  <option>Turkey</option>
                  <option>Turkmenistan</option>
                  <option>Turks and Caicos Islands</option>
                  <option>Tuvalu</option>
                  <option>Uganda</option>
                  <option>Ukraine</option>
                  <option>United Arab Emirates</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>United States Minor Outlying Islands</option>
                  <option>Uruguay</option>
                  <option>Uzbekistan</option>
                  <option>Vanuatu</option>
                  <option>Venezuela, Bolivarian Republic of</option>
                  <option>Viet Nam</option>
                  <option>Virgin Islands, British</option>
                  <option>Virgin Islands, U.S.</option>
                  <option>Wallis and Futuna</option>
                  <option>Western Sahara</option>
                  <option>Yemen</option>
                  <option>Zambia</option>
                  <option>Zimbabwe</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="industry"
                className="block text-sm font-medium leading-6 text-white"
              >
                Industry
              </label>
              <div className="mt-2">
                <select
                  id="industry"
                  name="industry"
                  autoComplete="industry-name"
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 [&_*]:text-black"
                >
                  <option>Information Technology (IT)</option>
                  <option>
                    IT-Artificial Intelligence (AI) & Machine Learning
                  </option>
                  <option>
                    IT-Augmented Reality (AR) & Virtual Reality (VR)
                  </option>
                  <option>IT-Big Data & Data Analysis</option>
                  <option>IT-Blockchain & Cryptocurrencies</option>
                  <option>IT-Cloud Computing & Services</option>
                  <option>IT-Cybersecurity</option>
                  <option>IT-E-Commerce & Online Marketplaces</option>
                  <option>IT-Internet of Things (IoT)</option>
                  <option>IT-Network Services & Telecommunication</option>
                  <option>IT-Software Development</option>
                  <option>Advertising & Marketing</option>
                  <option>Aerospace & Aviation</option>
                  <option>Automotive Industry</option>
                  <option>Banking & Financial Services</option>
                  <option>Chemical Industry</option>
                  <option>Construction</option>
                  <option>Education & Research</option>
                  <option>Energy Production & Distribution</option>
                  <option>Fashion & Textile Industry</option>
                  <option>Healthcare & Pharmacy</option>
                  <option>Hospitality & Hotel Industry</option>
                  <option>Law & Taxation</option>
                  <option>Logistics & Transportation</option>
                  <option>Manufacturing & Industry</option>
                  <option>Mechanical Engineering</option>
                  <option>Media & Communication</option>
                  <option>Public Services & Administration</option>
                  <option>Real Estate</option>
                  <option>Retail</option>
                  <option>Telecommunications</option>
                  <option>Tourism & Travel</option>
                  <option>Insurance</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-white">
                Do you have to comply with any of the following regulations/
                standards?
              </legend>
              <div className="mt-4 space-y-4">
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="comments"
                      name="comments"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="comments" className="text-white">
                      Critical infrastructures ( KRITIS )
                    </label>
                  </div>
                </div>
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="candidates"
                      name="candidates"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="candidates" className="text-white">
                      ISO 27001
                    </label>
                  </div>
                </div>
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="offers"
                      name="offers"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="offers" className="text-white">
                      IT-Grundschutz (German Federal Office for Information
                      Security)
                    </label>
                  </div>
                </div>
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="offers"
                      name="offers"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="offers" className="text-white">
                      NIST Cybersecurity Framework
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          Save
        </button>
      </div>
    </form>
  );
}
