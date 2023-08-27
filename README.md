# moemate_doctor_module
Moemate Doctor module based on https://apimedic.com/

The current main function is to let the AI automatically select relevant symptoms through the user's message, and let the AI make suggestions based on the questions derived from the symptoms.

### Usage
Input something like `Hello/Hi doctor` + symptoms, such as `Hello doctor, I feel my nose is blocked and a little dizzy.`

### Example diagnosed issue: Flue
![image](https://github.com/webaverse-studios/moemate_doctor_module/assets/10785634/c08e676a-e2e2-4cda-a705-ca58d6ca478e)
Original issue info from apimedic api:
```
{
    "Description": "Flu, also known as influenza, is a viral infection of the nose, sinuses, throat, and respiratory tract.  It’s seasonal, often occurring in winter, and can spread rapidly, called then flu epidemic.",
    "DescriptionShort": "Flu (often referred as influenza), is a viral infection of the nose, sinuses, throat, and respiratory tract by an influenza or parainfluenza virus.  Swine flu and bird (avian) flu are specific strains of flu.",
    "MedicalCondition": "When the infection occurs in healthy young people, it is usually not dangerous and lasts around one or two weeks.  In some cases a dry cough may develop and last a bit longer.  Elderly and those with pre-existing illnesses have a higher risk for complications.  For this reason it’s recommended that these groups get vaccinated.  Swine and bird flus are caused by slight different influenza viruses, but causing similar symptoms.  Flu typically develops rapidly, with fever (sometimes accompanied with chills), muscle pain, headache, a dry and painful cough,  sore throat, and exhaustion or fatigue.  It’s important to note that the flu is different from the common cold, which is often also caused by a virus, but causes milder symptoms.",
    "Name": "Flu",
    "PossibleSymptoms": "Reduced appetite,Shortness of breath,Eye redness,Sputum,Burning in the throat,Chest pain,Fever,Pain in the limbs,Sore throat,Cough,Headache,Swollen glands on the neck,Swollen glands in the armpits,Tiredness,Runny nose,Sneezing,Chills,Sweating,Stuffy nose",
    "ProfName": "Influenza",
    "Synonyms": null,
    "TreatmentDescription": "Even today flu can have fatal consequences for those with pre-existing conditions and requires a hospital stay with emergency medical measures.  Normally it is self-limited and the body recovers by itself.  A doctor may prescribe medication to help shorten the course of the flu if taken early.  Bed rest and staying hydrated are usually sufficient.  Medications such as Ibuprofen or Aspirin can lower a fever and relieve symptoms, but they will not shorten the course of the illness and should be used in children with caution.  Flu vaccine is recommended for the following groups at risk:  nursing infants, people over 60, people with compromised immune systems, and pregnant women."
}
```

### Example diagnosed issue: Reflux disease
![image](https://github.com/webaverse-studios/moemate_doctor_module/assets/10785634/fb5f8501-a0e3-4763-a206-62194fb84ac7)
Original issue info from apimedic api:
```
{
    "Description": "Reflux disease is very common worldwide.  It is usually due to a backflow of stomach acid through a weakened esophagus.  If this occurs regularly, it will develop into gastroesophageal reflux disease, a burning of the mucous membrane in the esophagus.",
    "DescriptionShort": "Gastroesophageal reflux disease is often referred to as gastric or acid reflux disease, as this is the most common complaint.  The cause of this symptom is a backflow of stomach acid into the esophagus, which then causes a burning sensation (hence the name).",
    "MedicalCondition": "Gastroesophageal reflux disease occurs in about 20% of the population in industrial countries.  The main symptom is a dull burning, or feelings of pain or pressure in the throat and chest areas, which is where it gets the common name heartburn.  It frequently occurs when lying down (at night for example), after copious eating, or after consumption of alcohol and can become noticeable as a chronic cough.",
    "Name": "Reflux disease",
    "PossibleSymptoms": "Burning in the throat,Chest pain,Cough,Early satiety,Heartburn,Hiccups,Pain on swallowing,Sore throat,Abdominal pain,Stomach burning,Vomiting,Vomiting blood",
    "ProfName": "Gastroesophageal reflux disease",
    "Synonyms": "GERD",
    "TreatmentDescription": "In certain cases, damage to the mucous membrane in the throat can become permanent (Barrett’s esophagus) which requires regular check-ups with a specialist, since this damage can degenerate.  For people suffering from this, it’s recommended that they maintain a low-fat diet, avoid eating meals late at night, quit smoking and using alcohol, and in the case of overweight patients a reduction in weight it recommended.  Medications that reduce stomach acid (proton pump inhibitors, for example) have been shown to be effective, but they do not treat the cause of the reflux of acid.  Furthermore, a test to discover if a stomach infection of Helicobacter pylori is at play may be appropriate, since this can cause or intensify heartburn.  In most cases this can be cured with a treatment of antibiotics."
}
```