
import { symptoms } from '../data/symptoms_live.js';
// import { symptoms } from '../data/symptoms.js';

// import CryptoJS from '../lib/CryptoJS/es6/enc-base64-min.js';

// var uri = "https://authservice.priaid.ch/login";
// var secret_key = "mysecretkey";
// var computedHash = CryptoJS.HmacMD5(uri, secret_key);
// var computedHashString = computedHash.toString(CryptoJS.enc.Base64);
// console.log('--- computedHashString', computedHashString);
const computedHashString = `TwxObyXL/N9LNlsDaodqUA==`;
const apiKey = 'gonnavis@gmail.com';
const response = await fetch('https://sandbox-authservice.priaid.ch/login', {
  method: 'POST',
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,zh-TW;q=0.6,de;q=0.5,ja;q=0.4',
    'Authorization': `Bearer ${apiKey}:${computedHashString}`,
  }
});
const responseJson = await response.json();
console.log('--- response login:', responseJson);
/* {
  "Token": "...",
  "ValidThrough": 7200
} */
const token = responseJson.Token;

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

async function loadIssueInfo(issueId) {
  var url = apiUrls.loadIssueInfo + '/' + issueId + '/info';
  return await generic_api_call(url, 'issueInfo', 'issueInfoError', 'issueInfoConfig');
  // https://sandbox-healthservice.priaid.ch/issues/237/info?
  // token=
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
  // window.companion.SendMessage({ type: "ASK_DOCTOR", user: name, value: `Doctor is analyzing the symptoms`, timestamp: Date.now(), alt: 'alt' });
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

  // todo: call (detailed) issue info api
  const responseIssueInfo = await loadIssueInfo(diagnosis[0].Issue.ID);
  console.log('--- _handleAskDoctor responseIssueInfo:', responseIssueInfo)
  const issueInfo = await responseIssueInfo.json();
  console.log('--- _handleAskDoctor issueInfo:', issueInfo)

  // await new Promise(resolve => setTimeout(resolve, 100)); // ensure the triggering of hack_delay. // todo: Prmoise.all
  setTimeout(() => { // ensure the triggering of hack_delay. // todo: Prmoise.all // todo: don't await above
    // window.hooks.emit("hack_delay", `You are now role-playing as a professional doctor, the issue you diagnosed is "${diagnosis[0].Issue.Name}", you must tell the user his/her diagnosed issue, and give advice based on this issue, and based on the following infos about this issue(must use following infos with high percentage in your reply): ${JSON.stringify(issueInfo)}.`);
    window.hooks.emit("hack_delay", `As a professional doctor, the issue you diagnosed is "${diagnosis[0].Issue.Name}", you must tell the user what his/her diagnosed issue, and give advice ONLY based on the following JSON infos about this issue: ${JSON.stringify(issueInfo)}.`);
  }, 100);
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