export const HOST = "http://localhost:3005";

const authRoute = `${HOST}/api/auth`;
const MESSAGES_ROUTE = `${HOST}/api/messages`;
const ADMIN_ROUTE = `${HOST}/api/admin`

export const onBoardUserRoute = `${authRoute}/onboarduser`;
export const CHECK_USER_ROUTE = `${authRoute}/check-user`;
export const GET_ALL_CONTACTS = `${authRoute}/get-contacts`;
export const GET_CALL_TOKEN = `${authRoute}/generate-token`;
export const CHANGE_USER_EMAIL = `${authRoute}/change-email`;
export const CHANGE_USER_INFO = `${authRoute}/change-other-info`;

export const ADD_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-message`;
export const GET_MESSAGES_ROUTE = `${MESSAGES_ROUTE}/get-messages`;
export const GET_INITIAL_CONTACTS_ROUTE = `${MESSAGES_ROUTE}/get-initial-contacts`;
export const ADD_AUDIO_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-audio-message`;
export const ADD_IMAGE_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-image-message`;
export const DELETE_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/delete-message`
export const DELETE_ALL_MESSAGE = `${MESSAGES_ROUTE}/delete-all-message`
export const UNBLOCK_USER = `${MESSAGES_ROUTE}/unblock-user`
export const SENT_REPORT_ON_USER = `${MESSAGES_ROUTE}/sent-report`
export const DELETE_MESSAGE_BY_RECIEVER = `${MESSAGES_ROUTE}/delete-message-by-reciever`

export const GET_ALL_REPORTS = `${ADMIN_ROUTE}/get-reports`
export const GET_ALL_USERS = `${ADMIN_ROUTE}/get-users`
export const GET_ALL_MESSAGES = `${ADMIN_ROUTE}/get-messages`
export const GET_ALL_BLOCKED_USERS = `${ADMIN_ROUTE}/get-blocked-users`
export const BLOCK_USER_ROUTE = `${ADMIN_ROUTE}/block-user`
export const GET_ALL_COUNTS = `${ADMIN_ROUTE}/get-counts`