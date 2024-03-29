
// The diagnosis is the core function of the symptom-checker to compute the potential health issues based on a set of symptoms, gender and age.
// _ Symptom IDs _ Age _ Gender
export const diagnosis = {
  _209_1985_Male: [
    {
      "Issue": {
        "ID": 140,
        "Name": "Pink eye",
        "Accuracy": 90,
        "Icd": "H10",
        "IcdName": "Conjunctivitis",
        "ProfName": "Conjunctivitis",
        "Ranking": 1
      },
      "Specialisation": [
        {
          "ID": 15,
          "Name": "General practice",
          "SpecialistID": 3
        },
        {
          "ID": 30,
          "Name": "Ophthalmology",
          "SpecialistID": 8
        }
      ]
    },
    {
      "Issue": {
        "ID": 139,
        "Name": "Eyelid inflammation",
        "Accuracy": 81,
        "Icd": "H01.0",
        "IcdName": "Blepharitis",
        "ProfName": "Blepharitis",
        "Ranking": 2
      },
      "Specialisation": [
        {
          "ID": 11,
          "Name": "Dermatology",
          "SpecialistID": 22
        },
        {
          "ID": 15,
          "Name": "General practice",
          "SpecialistID": 3
        },
        {
          "ID": 30,
          "Name": "Ophthalmology",
          "SpecialistID": 8
        }
      ]
    },
    {
      "Issue": {
        "ID": 450,
        "Name": "Stye",
        "Accuracy": 72,
        "Icd": "H00.0",
        "IcdName": "Hordeolum and other deep inflammation of eyelid",
        "ProfName": "Hordeolum",
        "Ranking": 3
      },
      "Specialisation": [
        {
          "ID": 11,
          "Name": "Dermatology",
          "SpecialistID": 22
        },
        {
          "ID": 15,
          "Name": "General practice",
          "SpecialistID": 3
        }
      ]
    },
    {
      "Issue": {
        "ID": 214,
        "Name": "Lacrimal gland inflammation",
        "Accuracy": 36,
        "Icd": "H04.3;H04.4",
        "IcdName": "Acute and unspecified inflammation of lacrimal passages;Chronic inflammation of lacrimal passages",
        "ProfName": "Dacrocystitis",
        "Ranking": 4
      },
      "Specialisation": [
        {
          "ID": 11,
          "Name": "Dermatology",
          "SpecialistID": 22
        },
        {
          "ID": 15,
          "Name": "General practice",
          "SpecialistID": 3
        },
        {
          "ID": 30,
          "Name": "Ophthalmology",
          "SpecialistID": 8
        }
      ]
    }
  ],
}