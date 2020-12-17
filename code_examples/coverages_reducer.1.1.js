// coverages reducer
// @flow
import _collection from 'lodash/collection';
import {
  STORE_COVERAGES,
  LOG_OUT,
} from '../actions/types';
import { formatDate } from '../lib/commonHelpers';

type Coverage = {
  id: string,
  numOfBags: number,
  reservedAt: string,
  reservedAtReceived: string,
  hospitalName: string,
};
type CoveragesList = Array<Coverage>;
type CoveragesInitial = {};
type CoveragesEmpty = [];
type Coverages = CoveragesList | CoveragesInitial | CoveragesEmpty;


const parseServerResponse = (serverPayload): CoveragesList => {
  ...
  return coverages;
};

export default function coveragesReducer(state = {}, action: any): Coverages {
  switch (action.type) {
  case STORE_COVERAGES:
    const data = parseServerResponse(action.payload);

    return _collection.orderBy(data, ['reservedAtReceived'], ['desc']);
  case LOG_OUT:
      return {};
  default:
    return state;
  }
};
