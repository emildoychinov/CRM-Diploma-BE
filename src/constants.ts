export const SUPERUSER = 'superuser';
export const CHECK_ABILITY = 'check_ability';
export const UNAUTHORIZED_REQUEST_DECORATOR = 'allowUnauthorizedRequest';
export const SUBJECT_ACTIONS = [
    'read',
    'write',
    'manage',
    'delete',
    'create'
]
export const CHANGE_STATUS_LENGTHS = {
    MINUTE: 60 * 1000, // 1 minute in milliseconds
    TEN_MINUTES: 10 * 60 * 1000, // 10 minutes in milliseconds
    HOUR: 60 * 60 * 1000, // 1 hour in milliseconds
    TEN_HOURS: 10 * 60 * 60 * 1000, // 10 hours in milliseconds
    DAY: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    WEEK: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
    MONTH: 30 * 24 * 60 * 60 * 1000, // 1 month (approximated) in milliseconds
    HALF_YEAR: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months (approximated) in milliseconds
    YEAR: 365 * 24 * 60 * 60 * 1000 // 1 year (approximated) in milliseconds
};