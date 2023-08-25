
async function _handleAskDoctor(event) {
  console.log('--- _handleAskDoctor event:', event)
}

export function init() {
  window.hooks.on("doctor:handle_skill_ask_doctor", (event) => _handleAskDoctor(event));
}