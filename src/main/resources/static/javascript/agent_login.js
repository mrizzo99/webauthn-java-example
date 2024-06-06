let timeoutId;
let spinnerRound = document.getElementById("spinner-round");
let caui = document.getElementById("caui");
let url = window.location.href;
let forceAuthn = getParameterByName("forceAuthn");

function getParameterByName(name) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function loadAndCustomize() {
  var backgroundColor = getParameterByName("backgroundColor");
  if (backgroundColor) {
    document.body.style.backgroundColor = backgroundColor;
  }
  var logoImage = getParameterByName("logoImage");
  if (logoImage) {
    document.getElementById("logo-image").src = logoImage;
  }
  var applicationName = getParameterByName("applicationName");
  if (applicationName) {
    document.getElementById("application-name").innerHTML = applicationName;
  }
  var responseDomain = getParameterByName("responseDomain");
  var responseResource = getParameterByName("responseResource");
  const domains = ["oidc.idp.sandbox.common", "oidc.idp.dev.common",
    "oidc.idp.integration.common", "oidc.idp.qeint.common", "oidc.idp.staging.common",
    "oidc.idp.cloud", "ws.idp.sandbox.common", "ws.idp.dev.common", "ws.idp.integration.common",
    "ws.idp.qeint.common", "ws.idp.staging.common", "ws.idp.cloud", "idp.sandbox.common",
    "idp.dev.common", "idp.integration.common", "idp.qeint.common", "idp.staging.common", "idp.cloud"];

  if (responseDomain && !domains.includes(responseDomain)) {
    let errorUrl = "/status.html?statusType=error&preLogin=true"
        + "&errorMessage=" + encodeURIComponent("Response domain is not valid")
        + "&message=" + encodeURIComponent("We're unable to log you in. Try again later.")
        + "&backgroundColor=" + encodeURIComponent(backgroundColor)
        + "&logoImage=" + encodeURIComponent(logoImage);
    window.location.href = errorUrl;
    return;
  } else if (responseDomain && responseResource && domains.includes(responseDomain)) {
    var authForm = document.getElementById('auth_form');
    authForm.setAttribute("action", "https://" + responseDomain + '.imprivata.com/' + responseResource);
  }
  show(document.body)

  agentAvailabilityCheck();
}

function agentAvailabilityCheck() {
  let cookie = getCookie("imprivata_extension_installed");
  if (cookie === "1" && forceAuthn !== "true") {
    console.log("Imprivata extension found. Preparing DOM...");
    hide(caui);
    console.log("Waiting for agent response...");
    timeoutId = setTimeout(function () {
      console.log("Waited for agent response for 3 seconds.");
      show(caui);
      hide(spinnerRound);
    }, 3000);
  } else {
    show(caui);
    hide(spinnerRound);
    console.log(
        "No Imprivata extension or agent found. Logging in with Common UI...");
    }
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; ++i) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function on_idp_login_error(error_code, error_desc) {
  console.log("Logging in with Common Login UI");
    hide(spinnerRound);
    show(caui);
}

function on_idp_login_success(auth_token) {
  console.log(
      "Logging in with Imprivata OneSign Agent. Token is " + auth_token);
  document.getElementById("auth_token").value = auth_token.replace("\n", "");
  var agent = document.getElementById("agent");
  if (agent) {
    agent.value = "WindowsAgent";
  }
  document.getElementById("auth_form").submit();
}

function on_idp_script_ready(event) {
  try {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    hide(caui);
    window.initiate_idp_login(on_idp_login_success, on_idp_login_error);
  } catch (e) {
    hide(spinnerRound);
    show(caui);
  }
}

function hide(element) {
  if (element) {
    element.style.display = "none";
  }
}

function show(element) {
  if (element) {
    element.style.display = "block";
  }
}

function deleteDefaultWhiteBackground(element) {
    if (element) {
        element.style.background = ""
    }
}

if (document.addEventListener && forceAuthn !== "true") {
  document.addEventListener("on_idp_script_ready", on_idp_script_ready);
}
