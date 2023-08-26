
import { symptoms } from '../data/symptoms_live.js';

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
  var extraArgs = 'token=' + tokenFactory.storeToken() + '&language=' + languageFactory.storeLanguage() + '&format=' + formatFactory.storeFormat()
  url += url.indexOf("?") > 0 ? "&" + extraArgs : "?" + extraArgs;
  await fetch(url);
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
  var symptoms = selectedSymptoms.split(',');
  var url = apiUrls.loadDiagnosis + '?symptoms=' + JSON.stringify(symptoms) + '&gender=' + gender.value + '&year_of_birth=' + yearOfBirth;
  await generic_api_call(url, 'diagnosis', 'diagnosisError', 'diagnosisConfig');
}

async function getSymptoms(lastMessageContent) {
  const extractModel = window.models.CreateModel("GPT 3.5 Turbo");
  window.models.ApplyContextObject(extractModel, { lastMessageContent: lastMessageContent, symptiomsJson: JSON.stringify(symptoms) });
  const response = await window.models.CallModel(extractModel, { prompts: "get_symptoms" }, { timeout: 10000 });
  window.models.DestroyModel(extractModel);
  console.log('--- getSymptoms response:', response)
  return;
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
  const selectedSymptoms = responseSymptoms.map(symptom => symptom.ID);
  console.log('--- _handleAskDoctor selectedSymptoms:', selectedSymptoms)
  const gender = 'male';
  const yearOfBirth = '1988';
  const diagnosis = await loadDiagnosis(selectedSymptoms, gender, yearOfBirth)
  console.log('--- _handleAskDoctor diagnosis:', diagnosis)
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