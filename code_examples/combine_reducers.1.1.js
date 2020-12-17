import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import captchaReducer from './captchaReducer';
import donationsReducer from './donationsReducer';
import coveragesReducer from './coveragesReducer';
import messageReducer from './messageReducer';
import loadersReducer from './loadersReducer';
import userReducer from './userReducer';
import userIdentificationReducer from './userIdentificationReducer';
import alertReducer from './alertReducer';
import nextDonationReducer from './nextDonationReducer';
import donorCardsReducer from './donorCardsReducer';
import previousRecordsReducer from './previousRecordsReducer';

export default combineReducers({
  form: formReducer,
  captcha: captchaReducer,
  donations: donationsReducer,
  coverages: coveragesReducer,
  message: messageReducer,
  loaders: loadersReducer,
  user: userReducer,
  userIdentification: userIdentificationReducer,
  alert: alertReducer,
  nextDonation: nextDonationReducer,
  donorCards: donorCardsReducer,
  previousRecords: previousRecordsReducer,
});
