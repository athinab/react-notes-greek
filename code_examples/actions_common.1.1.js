// actions/common.js

export function storePayload(type, payload = {}) {
  return {
    type,
    payload,
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

