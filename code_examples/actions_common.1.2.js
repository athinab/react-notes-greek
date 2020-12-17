import { urls } from '../lib/urls';
import {
  CLEAN_MESSAGE,
  STORE_ERROR,
  TOGGLE_LOADING,
  CLEAR_DATA,
  STORE_DONOR_CARD,
  STORE_DONOR_CARDS,
  THERE_ARE_PENDING_CHANGES,
  LOG_OUT,
} from './types';

export function cleanMessage() {
  return {
    type: CLEAN_MESSAGE,
  };
};

export function storePayload(type, payload = {}) {
  return {
    type,
    payload,
  };
};

// Gather the description of all expected errors
export const error_descr = {
  /*
   * unknown: Use only for error responses that we have no content-type and
   * zero content-length. Use for the attribute "original".
   */
  unknown: 'unknown server error',
  generic: {
    title: 'generic error title',
    error: 'generic error msg',
  },
  request: {
    title: 'request error title',
    error: 'request error msg',
  },
  generic_with_resource: {
    title: 'generic error title',
    error: 'generic error msg for specific resource',
  },
  401: {
    title: 'not allowed title',
    error: 'not allowed msg',
  },
};

export function storeError(error) {
  let msg = '',
      title = '',
      // For generic network error
      extra_data,
      original;

  if (typeof error === 'string') {
    msg = error;
    title = error_descr.generic.title;
  }
  else if (typeof error === 'object' && typeof error.error === 'string') {
    msg = error.error;
    title = error.title;
    extra_data = error.extra_data;
    original = error.original;
  }
  else if (typeof error === 'object' && typeof error.error === 'object'){
    msg = JSON.stringify(error.error);
    title = error_descr.generic.title;
  }
  else {
    msg = error_descr.generic.msg;
    title = error_descr.generic.title;
  }

  return {
    type: STORE_ERROR,
    payload: {
      title,
      msg,
      data: extra_data,
      original,
    },
  };
};

export function toggleLoader(what, isLoading) {
  // "what" could take the value "donations" or "captcha" or ...
  let type = TOGGLE_LOADING,
      payload = {};

  // example: payload.donations = true;
  payload[what] = isLoading;

  return {
    type,
    payload,
  };
};

export function clearData(endpoint) {
  let type = CLEAR_DATA;

  return {
    type,
    payload: endpoint,
  };
};

/*
 * Function that helps to set up the headers that are used in the requests that
 * come from this client.
 */
export function setRequestHeaders(requestType, token) {
  const headers = new Headers();

  headers.append('accept', 'application/json');
  headers.append('accept', 'text/plain');
  headers.append('accept', '*/*');
  switch(requestType) {
    case 'login':
      headers.append('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');

      return headers;
    case 'logout':
      headers.append('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
      headers.append('x-auth-token', token);

      return headers;
    case 'captcha':
    case 'contact':
      headers.append('content-type', 'application/json;charset=UTF-8');

      return headers;
    case 'sendEmailValidateToken':
    case 'sendSMSValidateToken':
    case 'validateEmailValidateToken':
    case 'validateSMSValidateToken':
      headers.append('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
      headers.append('x-auth-token', token);
      headers.append('accept-encoding', 'gzip');
      headers.append('accept-encoding', 'deflate');
      headers.append('accept-encoding', 'br');

      return headers;
    case 'verifyEmailSMS':
      headers.append('content-type', 'application/json;charset=UTF-8');
      headers.append('x-auth-token', token);
      headers.append('accept-encoding', 'gzip');
      headers.append('accept-encoding', 'deflate');
      headers.append('accept-encoding', 'br');

      return headers;
    default:
      headers.append('x-auth-token', token);
      headers.append('content-type', 'application/json;charset=UTF-8');

      return headers;
  }
};

export function constructURL(endpoint, id, cardID) {
  let base_url = urls[endpoint];

  switch (endpoint) {
    case 'login':
    case 'logout':
    case 'contact':
    case 'captcha':
    case 'sendSMSValidateToken':
    case 'sendEmailValidateToken':
    case 'validateEmailValidateToken':
    case 'validateSMSValidateToken':
    case 'verifyEmailSMS':
      return base_url;
    case 'user':
      return `${base_url}/${id}`;
    case 'donations':
      return `${base_url}/${id}/donation/history`;
    case 'coverages':
      return `${base_url}/${id}/coverageDonation/history`;
    case 'previousRecords':
      return `${base_url}/${id}/oldcards`;
    case 'alert':
      return `${base_url}/${id}/donation/alert`;
    case 'alertPendingRequest':
      return `${base_url}/${id}/donation/alert/request`;
    case 'nextDonation':
      return `${base_url}/${id}/donation/next`;
    case 'donorCards':
      return `${base_url}/${id}/donorcards`;
    case 'donorCard':
      return `${base_url}/${id}/donorcard/${cardID}`;
    case 'donorCardsPendingRequest':
      return `${base_url}/${id}/donorcard/request`;
    case 'userPendingRequest':
      return `${base_url}/${id}/request`;
    default:
      return 'Error';
  };
};

// This function throws a time out error after a few msec (const timeout)
const fetchTimeOut = async (url, options) => {
  const timeout = 7000;

  try {
    return Promise.race([
      fetch(url, options),
      new Promise((resolve, reject) => {
        setTimeout(function(){ resolve({ timeout: true }); }, timeout);
      }),
    ]);
  } catch (err) {
    // TODO: Replace console.warn
    console.warn(err);
  }
};

export async function execRequest(method, url, requestHeaders, body) {
  let response, payload = {}, isOK, status, responseHeaders, output, isResponseHTML, hasZeroContent;

  response = await fetchTimeOut(
    url,
    {
      method,
      headers: requestHeaders,
      body,
    });
  if(response.timeout) {
    isOK = false,
    payload = { error: 'No Network' },
    responseHeaders = {};
    status = 0;
  }
  else {
    status = await response.status;
    responseHeaders = response.headers;
    isResponseHTML = responseHeaders.get('content-type') && responseHeaders.get('content-type').includes('html');
    hasZeroContent = responseHeaders.get('content-length') === '0';
    isOK = response.ok;

    if (hasZeroContent) {
      // Example that has no content with status 200 is logout (DELETE request)
      if(isOK) {
        payload = {};
      }
      // Errors with code 404 or 500 may have no content
      else if (status) {
        payload = { error: { status } };
      }
      else {
        payload = { error: error_descr.unknown };
      }
    }
    else if (isResponseHTML) {
      // TODO: Include in translation
      var text = await response.text();
      // Remove html tags, then multiple white spaces and trim the string.
      var text_formatted = text.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/ +/g, ' ').trim();

      payload = `Server responded with code ${status}:\n ${text_formatted}.`;
    }
    // If the response is a json (error or success) assign its value to payload
    else {
      payload = await response.json();
    }
  }
  output = { isOK, payload, status, headers: responseHeaders };

  return output;
};

export function fetchDonorCard(token, userID, cardID, checkPendingRequest, checkWithID) {
  /*
   * If the card is in PENDING state maybe there is a pending request from the
   * user to change/add data . If there is a pending request, we should
   * display the data that the endpoint /request sends to the client.
   *
   * The card that is received from the /request endpoint initially doesn't have
   * an ID. It gets it later.
   *
   */
  return async (dispatch) => {
    let pending_request_endpoint = 'donorCardsPendingRequest',
        request_headers = setRequestHeaders(pending_request_endpoint, token),
        request_url = constructURL(pending_request_endpoint, userID),
        resource,
        request,
        donor_card_endpoint = 'donorCard',
        resource_headers = setRequestHeaders(donor_card_endpoint, token),
        resource_url = constructURL(donor_card_endpoint, userID, cardID),
        payload,
        error;

    try {
      if(checkPendingRequest && checkWithID) {
        request = await execRequest('GET', request_url, request_headers);
        // if the request has data, we will keep them
        if(request.isOK) {
          payload = JSON.parse(request.payload.requestData);
        }
        // if the request wasn't ok (404), we will get data from the donor_card_endpoint
        // TODO: If not OK check status...
        else {
          if(checkWithID) {
            resource = await execRequest('GET', resource_url, resource_headers);

            if(resource.isOK) {
              payload = resource.payload;
            }
            else {
              error = {
                ...error_descr.request,
                ...{
                  extra_data: donor_card_endpoint,
                  original: resource.payload,
                },
              };
            }
          }
          // TODO: Reconsider the if clause
          else {
            error = {
              ...error_descr.generic_with_resource,
              ...{
                extra_data: 'checkWithID',
                original: resource.payload,
              },
            };
          }
        }
      }
      else if(checkWithID && !checkPendingRequest) {
        resource = await execRequest('GET', resource_url, resource_headers);
        if(resource.isOK) {
          payload = resource.payload;
        }
        else {
          if(resource.status === 401) {
            dispatch(storePayload(LOG_OUT));
            error = {
              ...error_descr['401'],
              ...{
                extra_data: donor_card_endpoint,
                original: resource.payload,
              },
            };
          }
          else {
            error = {
              ...error_descr.request,
              ...{
                extra_data: donor_card_endpoint,
                original: resource.payload,
              },
            };
          }
        }
      }
      else if(!checkWithID && checkPendingRequest) {
        request = await execRequest('GET', request_url, request_headers);
        if(request.isOK) {
          payload = JSON.parse(request.payload.requestData);
        }
        else {
          if(request.status === 401) {
            error = {
              ...error_descr['401'],
              ...{
                extra_data: donor_card_endpoint,
                original: request.payload,
              },
            };
          }
          else {
            error = {
              ...error_descr.request,
              ...{
                extra_data: donor_card_endpoint,
                original: request.payload,
              },
            };
          }
        }
      }
      else {
        error = error_descr.generic;
      }

      if (payload !== undefined) {
        dispatch(storePayload(STORE_DONOR_CARD, payload));
      }
      else if (error !== undefined) {
        dispatch(storeError(error));
      }
      else {
        error = error_descr.generic;
        dispatch(storeError(error));
      }
      dispatch(toggleLoader('donorCards', false));
    } catch(err) {
      error = {
        ...error_descr.request,
        ...{
          extra_data: donor_card_endpoint,
          original: { error: err },
        },
      };
      dispatch(storeError(error));
    }
  };
};

export function fetchDonorCards(token, userID) {
  /*
   * Get full list of donor cards:
   * 1. GET from /donorcards to get the list
   * 2. GET from /donorcard/request to get card that may not be included in the
   *    above list (because backend hasn't finalize its store)
   */
  return async (dispatch) => {
    let pending_request_endpoint = 'donorCardsPendingRequest',
        request_response,
        request_headers = setRequestHeaders(pending_request_endpoint, token),
        request_url = constructURL(pending_request_endpoint, userID),
        resource_response,
        donor_cards_endpoint = 'donorCards',
        resource_headers = setRequestHeaders(donor_cards_endpoint, token),
        resource_url = constructURL(donor_cards_endpoint, userID),
        request_payload,
        resource_payload,
        error;

    try {
      resource_response = await execRequest('GET', resource_url, resource_headers);
      if(resource_response.isOK) {
        resource_payload = resource_response.payload;
        dispatch(storePayload(STORE_DONOR_CARDS, resource_payload));
        request_response = await execRequest('GET', request_url, request_headers);
        if(request_response.isOK) {
          request_payload = JSON.parse(request_response.payload.requestData);
          dispatch(storePayload(STORE_DONOR_CARD, request_payload));
        }
      }
      else {
        if(resource_response.status === 401) {
          dispatch(storePayload(LOG_OUT));
          error = {
            ...error_descr['401'],
            ...{
              extra_data: donor_cards_endpoint,
              original: resource_response.payload,
            },
          };
        }
        else {
          error = {
            ...error_descr.request,
            ...{
              extra_data: donor_cards_endpoint,
              original: resource_response.payload,
            },
          };
        }
        dispatch(storeError(error));
      }
      dispatch(toggleLoader(donor_cards_endpoint, false));
    } catch(err) {
      dispatch(toggleLoader(donor_cards_endpoint, false));
      error = {
        ...error_descr.request,
        extra_data: donor_cards_endpoint,
        original: err,
      };
      dispatch(storeError(error));
    }
  };
};

export function fetchAlert(nextAction, token, id) {
  /*
   * STATUS OF ALERT:
   * To determine what is the status of the alert should do the following
   * requests.
   * If the response of a request is 200 (ok) get the status from the attribute
   * that is mentioned below.
   * If the response of a request is 404 (not found) go to the next step.
   *
   *  1. GET /alert/request -> status: requestData.status
   *  2. GET /alert -> status: status (in response body)
   *  3. If both of the requests respond with 404 -> status: DISABLED
   */

  return async (dispatch) => {
    let pending_request_endpoint = 'alertPendingRequest',
        request_response,
        request_headers,
        request_url,
        alert_endpoint = 'alert',
        alert_response,
        alert_headers,
        alert_url,
        payload,
        error;

    try {
      request_headers = setRequestHeaders(pending_request_endpoint, token);
      request_url = constructURL(pending_request_endpoint, id);

      request_response = await execRequest('GET', request_url, request_headers);
      if(request_response.isOK) {
        payload = request_response.payload;
        dispatch(storePayload(nextAction, JSON.parse(payload.requestData)));
      }
      else if(request_response.status === 404) {
        alert_headers = setRequestHeaders(alert_endpoint, token);
        alert_url = constructURL(alert_endpoint, id);
        alert_response = await execRequest('GET', alert_url, alert_headers);
        if(alert_response.isOK) {
          payload = alert_response.payload;
          dispatch(storePayload(nextAction, payload));
        }
        else if(alert_response.status === 404) {
          dispatch(storePayload(nextAction));
        }
        else {
          if(alert_response.status === 401) {
            dispatch(storePayload(LOG_OUT));
            error = {
              ...error_descr['401'],
              ...{
                extra_data: alert_endpoint,
                original: alert_response.payload,
              },
            };
          }
          else {
            error = {
              ...error_descr.request,
              ...{
                extra_data: alert_endpoint,
                original: alert_response.payload,
              },
            };
          }
          dispatch(storeError(error));
        }
      }
      else {
        if(request_response.status === 401) {
          dispatch(storePayload(LOG_OUT));
          error = {
            ...error_descr['401'],
            ...{
              extra_data: pending_request_endpoint,
              original: request_response.payload,
            },
          };
        }
        else {
          error = {
            ...error_descr.request,
            ...{
              extra_data: pending_request_endpoint,
              original: request_response.payloa,
            },
          };
        }
        dispatch(storeError(error));
      }
      dispatch(toggleLoader(alert_endpoint, false));
    } catch(err) {
      error = {
        ...error_descr.request,
        ...{
          extra_data: alert_endpoint,
          original: { error: err },
        },
      };
      dispatch(storeError(error));
    }
  };
};

export function fetchData(endpoint, nextAction, token, id) {
  return async (dispatch) => {
    let response,
        headers = setRequestHeaders(endpoint, token), url,
        error;

    try {
      url = constructURL(endpoint, id);
      response = await execRequest('GET', url, headers);
      let payload = response.payload;

      if(response.isOK) {
        dispatch(storePayload(nextAction, payload));
      }
      else {
        if(response.status === 401) {
          dispatch(storePayload(LOG_OUT));
          error = {
            ...error_descr['401'],
            ...{
              extra_data: endpoint,
              original: response.payload,
            },
          };
        }
        else {
          error = {
            ...error_descr.request,
            ...{
              extra_data: endpoint,
              original: response.payload,
            },
          };
        }
        dispatch(storeError(error));
      }
      dispatch(toggleLoader(endpoint, false));
    } catch(err) {
      error = {
        ...error_descr.request,
        ...{
          extra_data: endpoint,
          original: { error: err },
        },
      };
      dispatch(storeError(error));
    }
  };
};

export function fetchPendingProfileChanges(token, id) {
  return async (dispatch) => {
    let response,
        endpoint = 'userPendingRequest',
        nextAction = THERE_ARE_PENDING_CHANGES,
        headers = setRequestHeaders(endpoint, token),
        url = constructURL(endpoint, id),
        error;

    try {
      response = await execRequest('GET', url, headers);

      if(response.isOK) {
        dispatch(storePayload(nextAction, true));
      }
      else if (response.status === 404) {
        dispatch(storePayload(nextAction, false));
      }
      else {
        if(response.status === 401) {
          dispatch(storePayload[LOG_OUT]);
          error = {
            ...error_descr['401'],
            ...{
              extra_data: endpoint,
              original: response.payload,
            },
          };
        }
        else {
          error = {
            ...error_descr.request,
            ...{
              extra_data: endpoint,
              original: { error: response.payload },
            },
          };
        }
        dispatch(storeError(error));
      }
      dispatch(toggleLoader(endpoint, false));
    } catch(err) {
      error = {
        ...error_descr.request,
        ...{
          extra_data: endpoint,
          original: { error: err },
        },
      };
      dispatch(storeError(error));
    }
  };
};

export function postData(endpoint, nextAction, data) {
  return async (dispatch) => {
    let response,
        headers = setRequestHeaders(endpoint),
        body = JSON.stringify(data),
        url = constructURL(endpoint),
        payload,
        error;

    try {
      response = await execRequest('POST', url, headers, body);
      payload = response.payload;
      if(response.isOK) {
        dispatch(storePayload(nextAction, payload));
      }
      else {
        error = {
          title: error_descr.request.title,
          error: error_descr.generic_with_resource.error,
          extra_data: `request: /${endpoint}`,
          original: payload,
        };
        dispatch(storeError(error));
      }
      dispatch(toggleLoader(endpoint, false));
    } catch(err) {
      error = {
        title: error_descr.request.title,
        error: error_descr.generic_with_resource.error,
        extra_data: `actions: ${endpoint}`,
        original: { error: err },
      };
      dispatch(storeError(error));
    }
  };
};

export function objectToQueryString(obj) {
  let outputString = '';

  outputString = Object.keys(obj).reduce((acc, key, index) => {
    let str = `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`,
        output = index === 0 ? str : `${acc}&${str}`;

    return output;
  }, '');

  return outputString;
};

