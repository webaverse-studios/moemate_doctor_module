
// import { symptoms } from '../data/symptoms_live.js';
import { symptoms } from '../data/symptoms.js';

const baseUrl = 'https://sandbox-healthservice.priaid.ch/';
const apiUrls = {
  loadSymptoms: baseUrl + 'symptoms',
  loadIssues: baseUrl + 'issues',
  loadIssueInfo: baseUrl + 'issues',
  loadDiagnosis: baseUrl + 'diagnosis',
  loadSpecialisations: baseUrl + 'diagnosis/specialisations',
  loadBodyLocations: baseUrl + 'body/locations',
  loadBodySublocations: baseUrl + 'body/locations/',
  loadBodySublocationSymptoms: baseUrl + 'symptoms',
  loadProposedSymptoms: baseUrl + 'symptoms/proposed',
  loadRedFlagText: baseUrl + 'redflag',
}
const language = 'en-gb';
const format = 'json';
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Imdvbm5hdmlzQGdtYWlsLmNvbSIsInJvbGUiOiJVc2VyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc2lkIjoiMTI3NzIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3ZlcnNpb24iOiIyMDAiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL2xpbWl0IjoiOTk5OTk5OTk5IiwiaHR0cDovL2V4YW1wbGUub3JnL2NsYWltcy9tZW1iZXJzaGlwIjoiUHJlbWl1bSIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbGFuZ3VhZ2UiOiJlbi1nYiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvZXhwaXJhdGlvbiI6IjIwOTktMTItMzEiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL21lbWJlcnNoaXBzdGFydCI6IjIwMjMtMDgtMjIiLCJpc3MiOiJodHRwczovL3NhbmRib3gtYXV0aHNlcnZpY2UucHJpYWlkLmNoIiwiYXVkIjoiaHR0cHM6Ly9oZWFsdGhzZXJ2aWNlLnByaWFpZC5jaCIsImV4cCI6MTY5MzA3NjkyMywibmJmIjoxNjkzMDY5NzIzfQ.ZDIJtWBOflPX-pgYBS6VlDR1Zhpr2OF7OWrCcHyA3pk';

function makeRequest(ApiObj) {
  ApiObj.url = ApiObj.URL;
  var deffered = $q.defer();
  $http(ApiObj)
    .then(function (data) {
      deffered.resolve(data);
    }, function (data) {
      deffered.reject(data);
    })
  return deffered.promise;
}

async function generic_api_call(url, scope_variable_name, scope_error_variable_name, scope_config_variable_name) {
  var extraArgs = 'token=' + token + '&language=' + language + '&format=' + format;
  url += url.indexOf("?") > 0 ? "&" + extraArgs : "?" + extraArgs;
  return await fetch(url);
  // await makeRequest({
  //   URL: url,
  //   method: 'GET'
  // })
  // .then(function (data) {
  //   vm[scope_variable_name] = data.data != '' ? data.data : 'No results found';
  //   vm[scope_config_variable_name] = data.config;
  //   vm[scope_error_variable_name] = '';
  //   console.log('success', data);
  // }, function (data) {
  //   vm[scope_variable_name] = '';
  //   vm[scope_config_variable_name] = '';
  //   vm[scope_error_variable_name] = data;
  //   console.log('error', data);
  //   return false;
  // });
}

/**
  * [loadDiagnosis Function makes an api call to get diagnosis for given parameters]
  */
async function loadDiagnosis(selectedSymptoms, gender, yearOfBirth) {
  // var symptoms = selectedSymptoms.split(',');
  var url = apiUrls.loadDiagnosis + '?symptoms=' + JSON.stringify(selectedSymptoms) + '&gender=' + gender + '&year_of_birth=' + yearOfBirth;
  return await generic_api_call(url, 'diagnosis', 'diagnosisError', 'diagnosisConfig');
  // https://sandbox-healthservice.priaid.ch/diagnosis?
  // symptoms=[%2213%22] // ["13"] // symptoms=[%2213%22,%2214%22,%22%2015%22] // ["13","14"," 15"]
  // &gender=male
  // &year_of_birth=1988
  // &token=
  // &language=en-gb
  // &format=json
}

async function getSymptoms(lastMessageContent) {
  const extractModel = window.models.CreateModel("GPT 3.5 Turbo");
  window.models.ApplyContextObject(extractModel, { lastMessageContent: lastMessageContent, symptiomsJson: JSON.stringify(symptoms) });
  const response = await window.models.CallModel(extractModel, { prompts: "get_symptoms" }, { timeout: 10000 });
  window.models.DestroyModel(extractModel);
  console.log('--- getSymptoms response:', response)
  // return;
  const responseSymptoms = JSON.parse(response);
  console.log('--- getSymptoms responseSymptoms:', responseSymptoms)
  return responseSymptoms;
}

async function _handleAskDoctor(event) {
  console.log('--- _handleAskDoctor event:', event)
  // {
  //   "name": "Spark",
  //   "value": "Based on the user's statement, the probable symptoms are dry eyes, difficulty keeping eyes open, stiff neck, and inability to lift head."
  //   // The value is the resposne of "hack_usage": "What are the probable symptoms?" but not used. Using response from "get_symptoms.hbs" instead.
  // }

  const name = await window.companion.GetCharacterAttribute('name');
  // window.hooks.emit('moemate_core:handle_skill_text', { name: name, value: `Triggered ASK_DOCTOR Skill (in js).` });
  const lastMessage = await window.companion.GetChatLog()
  const lastMessageContent = lastMessage[lastMessage.length - 1].data.value;
  const responseSymptoms = await getSymptoms(lastMessageContent);
  const selectedSymptoms = responseSymptoms.map(symptom => symptom.ID.toString()); // ["13","14"," 15"]
  console.log('--- _handleAskDoctor selectedSymptoms:', selectedSymptoms)
  const gender = 'male';
  const yearOfBirth = '1988';
  selectedSymptoms.splice(1); // test: keep only the first symptom, for testing with sandbox api (without live api)
  const responseDiagnosis = await loadDiagnosis(selectedSymptoms, gender, yearOfBirth)
  window.responseDiagnosis = responseDiagnosis // test
  const diagnosis = await responseDiagnosis.json();
  console.log('--- _handleAskDoctor diagnosis:', diagnosis)
  // []
  // [{"Issue":{"ID":431,"Name":"Drug side effect","Accuracy":90,"Icd":"T88.7","IcdName":"Unspecified adverse effect of drug or medicament","ProfName":"Adverse drug reaction","Ranking":1},"Specialisation":[{"ID":15,"Name":"General practice","SpecialistID":0},{"ID":19,"Name":"Internal medicine","SpecialistID":0}]}]
}

function _handleSetPrompts(model, type) {
  if (type === "get_symptoms") {
    window.prompts_llm.ClearPrompts(model);
    window.prompts_llm.SetPrompt(model, "doctor:get_symptoms", { role: "system" });
    window.models.ApplyContextObject(model, { 'style_parser': 'None' });
    return true;
  }
}

export function init() {
  window.hooks.on("set_prompts", ({ model, type }) => _handleSetPrompts(model, type));
  window.hooks.on("doctor:handle_skill_ask_doctor", (event) => _handleAskDoctor(event));
}