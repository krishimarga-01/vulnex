// Indian States, Districts, and Nearest Police Station Directory
export interface StateData {
  state: string;
  districts: {
    district: string;
    policeStations: string[];
  }[];
}

export const INDIA_POLICE_DIRECTORY: StateData[] = [
  {
    state: 'Karnataka',
    districts: [
      {
        district: 'Kodagu',
        policeStations: [
          'Madikeri Town Police Station',
          'Madikeri Rural Police Station',
          'Kushalnagar Police Station',
          'Somwarpet Police Station',
          'Virajpet Police Station',
          'Gonikoppal Police Station',
          'Siddapur Police Station',
          'Bhagamandala Police Station',
          'Shanivarasanthe Police Station',
        ],
      },
      {
        district: 'Uttara Kannada',
        policeStations: [
          'Karwar Town Police Station',
          'Chitakula Police Station',
          'Ankola Police Station',
          'Kumta Police Station',
          'Honnavar Police Station',
          'Bhatkal Town Police Station',
          'Sirsi Town Police Station',
          'Sirsi Rural Police Station',
          'Dandeli Town Police Station',
          'Yellapur Police Station',
        ],
      },
      {
        district: 'Bengaluru Urban',
        policeStations: [
          'Cubbon Park Police Station',
          'Vidhana Soudha Police Station',
          'Indiranagar Police Station',
          'Koramangala Police Station',
          'Whitefield Police Station',
          'HSR Layout Police Station',
          'Jayanagar Police Station',
          'Malleswaram Police Station',
          'Yelahanka Police Station',
          'Electronic City Police Station',
          'Hebbal Police Station',
          'BTM Layout Police Station',
        ],
      },
      {
        district: 'Dakshina Kannada',
        policeStations: [
          'Mangaluru North Police Station (Bunder)',
          'Mangaluru South Police Station (Pandeshwar)',
          'Mangaluru East Police Station (Kadri)',
          'Panambur Police Station',
          'Surathkal Police Station',
          'Bantwal Town Police Station',
          'Puttur Town Police Station',
          'Belthangady Police Station',
          'Sullia Police Station',
        ],
      },
      {
        district: 'Mysuru',
        policeStations: [
          'Devaraja Police Station',
          'Lashkar Police Station',
          'Nazarbad Police Station',
          'Saraswathipuram Police Station',
          'Krishnaraja Police Station',
          'V.V. Puram Police Station',
          'Hunsur Town Police Station',
          'Nanjangud Town Police Station',
        ],
      },
      {
        district: 'Kalaburagi',
        policeStations: [
          'Kalaburagi City Police Station',
          'Station Bazar Police Station',
          'Brahampur Police Station',
          'Chowk Police Station',
          'University Police Station',
          'Sedam Police Station',
          'Aland Police Station',
        ],
      },
    ],
  },
  {
    state: 'Tamil Nadu',
    districts: [
      {
        district: 'Chennai',
        policeStations: [
          'Anna Square Police Station',
          'Marina Police Station',
          'Mylapore Police Station',
          'T. Nagar Police Station',
          'Adyar Police Station',
          'Royapettah Police Station',
          'Guindy Police Station',
          'Velachery Police Station',
          'Thiruvanmiyur Police Station',
          'Perambur Police Station',
        ],
      },
      {
        district: 'Nilgiris',
        policeStations: [
          'Ooty Town Police Station',
          'Ooty Rural Police Station',
          'Coonoor Town Police Station',
          'Kotagiri Police Station',
          'Gudalur Police Station',
          'Devala Police Station',
        ],
      },
      {
        district: 'Cuddalore',
        policeStations: [
          'Cuddalore Old Town Police Station',
          'Cuddalore Port Police Station',
          'Chidambaram Town Police Station',
          'Panruti Police Station',
          'Nellikuppam Police Station',
          'Vridhachalam Police Station',
        ],
      },
      {
        district: 'Coimbatore',
        policeStations: [
          'Race Course Police Station',
          'R.S. Puram Police Station',
          'Gandhipuram Police Station',
          'Singanallur Police Station',
          'Peelamedu Police Station',
          'Saibaba Colony Police Station',
        ],
      },
    ],
  },
  {
    state: 'Kerala',
    districts: [
      {
        district: 'Wayanad',
        policeStations: [
          'Meppadi Police Station (Chooralmala / Mundakkai Area)',
          'Kalpetta Police Station',
          'Mananthavady Police Station',
          'Sulthan Bathery Police Station',
          'Vythiri Police Station',
          'Ambalavayal Police Station',
          'Kenichira Police Station',
        ],
      },
      {
        district: 'Idukki',
        policeStations: [
          'Munnar Police Station',
          'Devikulam Police Station',
          'Adimali Police Station',
          'Nedumkandam Police Station',
          'Kattappana Police Station',
          'Peermade Police Station',
          'Thodupuzha Police Station',
        ],
      },
      {
        district: 'Ernakulam',
        policeStations: [
          'Central Police Station Ernakulam',
          'Marine Drive Police Station',
          'Fort Kochi Police Station',
          'Kakkanad Police Station',
          'Aluva Town Police Station',
          'Angamaly Police Station',
        ],
      },
    ],
  },
  {
    state: 'Maharashtra',
    districts: [
      {
        district: 'Mumbai',
        policeStations: [
          'Colaba Police Station',
          'Marine Drive Police Station',
          'Cuffe Parade Police Station',
          'Bandra Police Station',
          'Andheri Police Station',
          'Dadar Police Station',
          'Juhu Police Station',
          'Worli Police Station',
          'Kurla Police Station',
          'Borivali Police Station',
        ],
      },
      {
        district: 'Raigad',
        policeStations: [
          'Alibag Police Station',
          'Mahad Police Station',
          'Roha Police Station',
          'Panvel City Police Station',
          'Mangaon Police Station',
          'Murud Police Station',
        ],
      },
      {
        district: 'Ratnagiri',
        policeStations: [
          'Ratnagiri City Police Station',
          'Chiplun Police Station',
          'Guhagar Police Station',
          'Khed Police Station',
          'Rajapur Police Station',
        ],
      },
    ],
  },
  {
    state: 'Assam',
    districts: [
      {
        district: 'Dhubri',
        policeStations: [
          'Dhubri Town Police Station',
          'Gauripur Police Station',
          'Bilasipara Police Station',
          'Golakganj Police Station',
          'Chapar Police Station',
        ],
      },
      {
        district: 'Kamrup Metropolitan (Guwahati)',
        policeStations: [
          'Panbazar Police Station',
          'Paltan Bazar Police Station',
          'Dispur Police Station',
          'Chandmari Police Station',
          'Jalukbari Police Station',
          'Bharalumukh Police Station',
        ],
      },
    ],
  },
  {
    state: 'Odisha',
    districts: [
      {
        district: 'Puri',
        policeStations: [
          'Sea Beach Police Station',
          'Town Police Station Puri',
          'Kumbharpada Police Station',
          'Sadar Police Station Puri',
          'Konark Police Station',
          'Brahmagiri Police Station',
        ],
      },
      {
        district: 'Balasore',
        policeStations: [
          'Balasore Town Police Station',
          'Sahadevkhunta Police Station',
          'Chandipur Police Station',
          'Basta Police Station',
          'Jaleswar Police Station',
        ],
      },
    ],
  },
  {
    state: 'Delhi',
    districts: [
      {
        district: 'Central Delhi',
        policeStations: [
          'Connaught Place Police Station',
          'Parliament Street Police Station',
          'Daryaganj Police Station',
          'Pahar Ganj Police Station',
          'Kamla Market Police Station',
          'Karol Bagh Police Station',
        ],
      },
      {
        district: 'New Delhi',
        policeStations: [
          'Tughlak Road Police Station',
          'Tilak Marg Police Station',
          'Chanakyapuri Police Station',
          'Barakhamba Road Police Station',
        ],
      },
    ],
  },
  {
    state: 'Gujarat',
    districts: [
      {
        district: 'Kutch',
        policeStations: [
          'Bhuj Town Police Station',
          "Gandhidham 'A' Division Police Station",
          'Mandvi Police Station',
          'Anjar Police Station',
          'Mundra Police Station',
        ],
      },
      {
        district: 'Ahmedabad',
        policeStations: [
          'Navrangpura Police Station',
          'Ellisbridge Police Station',
          'Vastrapur Police Station',
          'Satellite Police Station',
          'Sabarmati Police Station',
        ],
      },
    ],
  },
  {
    state: 'Andhra Pradesh',
    districts: [
      {
        district: 'Visakhapatnam',
        policeStations: [
          'One Town Police Station (Vizag Port)',
          'Two Town Police Station',
          'Three Town Police Station',
          'MVP Colony Police Station',
          'Gajuwaka Police Station',
          'Bheemunipatnam Police Station',
        ],
      },
    ],
  },
];
