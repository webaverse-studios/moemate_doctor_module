
async function getSymptoms(lastMessageContent) {
  const extractModel = window.models.CreateModel("GPT 3.5 Turbo");
  window.models.ApplyContextObject(extractModel, {lastMessageContent: lastMessageContent});
  const response = await window.models.CallModel(extractModel, {prompts: "get_symptoms"}, {timeout: 10000});
  window.models.DestroyModel(extractModel);
  console.log('--- getSymptoms response:', response)
  return response;
}

async function _handleAskDoctor(event) {
  console.log('--- _handleAskDoctor event:', event)
  /*
    {
        "name": "Spark",
        "value": "Based on the user's statement, the probable symptoms are dry eyes, difficulty keeping eyes open, stiff neck, and inability to lift head."
        // The value is the resposne of "hack_usage": "What are the probable symptoms?" but not used. Using response from "get_symptoms.hbs" instead.
    }
  */

    
  const lastMessage = await window.companion.GetChatLog()
  const lastMessageContent = lastMessage[lastMessage.length - 1].data.value;
  const response = await getSymptoms(lastMessageContent);
}

function _handleSetPrompts(model, type) {
  if (type === "get_symptoms") {
      window.prompts_llm.ClearPrompts(model);
      window.prompts_llm.SetPrompt(model, "doctor:get_symptoms", {role: "system"});
      window.models.ApplyContextObject(model, {'style_parser': 'None'});
      return true;
  }
}

export function init() {
  window.hooks.on("set_prompts", ({model, type}) => _handleSetPrompts(model, type));
  window.hooks.on("doctor:handle_skill_ask_doctor", (event) => _handleAskDoctor(event));
}