
import { symptoms } from '../data/symptoms_live.js';
// import { symptoms } from '../data/symptoms.js';
// import { symptoms } from '../data/symptoms_test.js';

import { issues } from '../data/issues_live.js';
window.issues = issues; // test

// import CryptoJS from '../lib/CryptoJS/es6/enc-base64-min.js';

// var uri = "https://authservice.priaid.ch/login";
// var secret_key = "mysecretkey";
// var computedHash = CryptoJS.HmacMD5(uri, secret_key);
// var computedHashString = computedHash.toString(CryptoJS.enc.Base64);
// console.log('--- computedHashString', computedHashString);
const computedHashString = `TwxObyXL/N9LNlsDaodqUA==`; // sandbox api, not live api, https://apimedic.com/apikeys
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

async function generic_api_call(url) {
  var extraArgs = 'token=' + token + '&language=' + language + '&format=' + format;
  url += url.indexOf("?") > 0 ? "&" + extraArgs : "?" + extraArgs;
  return await fetch(url);
}

async function loadDiagnosis(selectedSymptoms, gender, yearOfBirth) {
  var url = apiUrls.loadDiagnosis + '?symptoms=' + JSON.stringify(selectedSymptoms) + '&gender=' + gender + '&year_of_birth=' + yearOfBirth;
  return await generic_api_call(url);
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
  return await generic_api_call(url);
  // https://sandbox-healthservice.priaid.ch/issues/237/info?
  // token=
  // &language=en-gb
  // &format=json
}

async function downLoadAllIssueInfos() {
  const issueInfos = {};
  window.issueInfos = issueInfos; // test
  for (let i = 0; i < issues.length; i++) {
    // if (i >= 10) break; // test
    const issue = issues[i];
    console.log(i, issue.ID, issue.Name)
    const responseIssueInfo = await loadIssueInfo(issue.ID);
    // if not found the issue id, will get 404 error and "Issue not found!" text response
    if (responseIssueInfo.status === 404) continue;
    const issueInfo = await responseIssueInfo.json();
    issueInfos[issue.ID] = issueInfo;
  }
  // console.log('--- downLoadAllIssueInfos issueInfos:', issueInfos)
  return issueInfos;
}
window.downLoadAllIssueInfos = downLoadAllIssueInfos; // test

async function getSymptoms(lastMessageContent) {
  const extractModel = window.models.CreateModel("GPT 3.5 Turbo");
  window.models.ApplyContextObject(extractModel, { lastMessageContent: lastMessageContent, symptiomsJson: JSON.stringify(symptoms) });
  const response = await window.models.CallModel(extractModel, { prompts: "get_symptoms" }, { timeout: 10000 });
  window.models.DestroyModel(extractModel);
  console.log('--- getSymptoms response:', response)
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

  const lastMessage = await window.companion.GetChatLog()
  const lastMessageContent = lastMessage[lastMessage.length - 1].data.value;

  // have to send skill message after got lastMessage
  const name = await window.companion.GetCharacterAttribute('name');
  window.companion.SendMessage({ type: "ASK_DOCTOR", user: name, value: `Triggered Doctor Skill`, timestamp: Date.now(), alt: 'alt' });

  // let the AI automatically select relevant symptoms through the user's message
  const responseSymptoms = await getSymptoms(lastMessageContent);
  const selectedSymptoms = responseSymptoms.map(symptom => symptom.ID.toString()); // ["13","14"," 15"]
  console.log('--- _handleAskDoctor selectedSymptoms:', selectedSymptoms)
  const gender = 'male'; // todo: don't hard code
  const yearOfBirth = '1988'; // todo: don't hard code
  selectedSymptoms.splice(1); // test: keep only the first symptom, for testing with sandbox api (without live api), to prevent diagnosis.length === 0

  // call diagnosis api
  const responseDiagnosis = await loadDiagnosis(selectedSymptoms, gender, yearOfBirth)
  window.responseDiagnosis = responseDiagnosis // test
  const diagnosis = await responseDiagnosis.json();
  console.log('--- _handleAskDoctor diagnosis:', diagnosis)
  // []
  // [{"Issue":{"ID":431,"Name":"Drug side effect","Accuracy":90,"Icd":"T88.7","IcdName":"Unspecified adverse effect of drug or medicament","ProfName":"Adverse drug reaction","Ranking":1},"Specialisation":[{"ID":15,"Name":"General practice","SpecialistID":0},{"ID":19,"Name":"Internal medicine","SpecialistID":0}]}]
  if (diagnosis.length === 0) {
    window.companion.SendMessage({ type: "ASK_DOCTOR", user: name, value: `Failed to get diagnosis info, reply with original LLM. Please use live api to get more diagnosis info.`, timestamp: Date.now(), alt: 'alt' });
    return; // will reply and make suggestions purely based on LLM, without issue info from apimedic
  }

  // call (detailed) issue info api
  const responseIssueInfo = await loadIssueInfo(diagnosis[0].Issue.ID);
  console.log('--- _handleAskDoctor responseIssueInfo:', responseIssueInfo)
  const issueInfo = await responseIssueInfo.json();
  console.log('--- _handleAskDoctor issueInfo:', issueInfo)

  setTimeout(async () => { // ensure the triggering of hack_delay. // todo: Prmoise.all // todo: don't await above
    // window.hooks.emit("hack_delay", `You are now role-playing as a professional doctor, the issue you diagnosed is "${diagnosis[0].Issue.Name}", you must tell the user his/her diagnosed issue, and give advice based on this issue, and based on the following infos about this issue(must use following infos with high percentage in your reply): ${JSON.stringify(issueInfo)}.`);
    window.hooks.emit("hack_delay", `As a professional doctor, the issue you diagnosed is "${diagnosis[0].Issue.Name}", you must tell the user what his/her diagnosed issue, and give advice ONLY based on the following JSON infos about this issue: ${JSON.stringify(issueInfo)}.`);

    window.companion.SendMessage({ type: "ASK_DOCTOR", user: name, value: `Got diagnosis info`, timestamp: Date.now(), alt: 'alt' });
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