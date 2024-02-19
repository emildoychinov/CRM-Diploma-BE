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
    MINUTE: 60 * 1000, 
    TEN_MINUTES: 10 * 60 * 1000, 
    HOUR: 60 * 60 * 1000, 
    TEN_HOURS: 10 * 60 * 60 * 1000, 
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000, 
    MONTH: 30 * 24 * 60 * 60 * 1000,
    HALF_YEAR: 6 * 30 * 24 * 60 * 60 * 1000,
    YEAR: 365 * 24 * 60 * 60 * 1000
};
export const DURATION_WORD_KEYS = {
    MINUTE: '1 minute',
    TEN_MINUTES: '10 minutes',
    HOUR: '1 hour',
    TEN_HOURS: '10 hours',
    DAY: '1 day',
    WEEK: '1 week',
    MONTH: '1 month',
    HALF_YEAR: '6 months',
    YEAR: '1 year'
};