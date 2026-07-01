const LISTINGS = {
  VIEW: 'Portfolio:Listing:View',
  EXPORT: 'Portfolio:Listing:Export',
  CREATE: 'Portfolio:Listing:Create',
  UPDATE: 'Portfolio:Listing:Update',
  UPDATE_SENSITIVE: 'Portfolio:Listing:Update:Sensitive',
  DELETE: 'Portfolio:Listing:Delete',
  ACTIVATE: 'Portfolio:Listing:Activate',
  WITHDRAW: 'Portfolio:Listing:Withdraw',
  RESERVE: 'Portfolio:Listing:Reserve',
  CLOSE: 'Portfolio:Listing:Close',
} as const;

const CUSTOMERS = {
  VIEW: 'People:Customer:View',
  EXPORT: 'People:Customer:Export',
  CREATE: 'People:Customer:Create',
  UPDATE: 'People:Customer:Update',
  UPDATE_SENSITIVE: 'People:Customer:Update:Sensitive',
  DELETE: 'People:Customer:Delete',
} as const;

const PROPERTIES = {
  UPDATE: 'Portfolio:Property:Update',
  UPDATE_CORE: 'Portfolio:Property:Update:Core',
  UPDATE_SENSITIVE: 'Portfolio:Property:Update:Core:Sensitive',
} as const;

const PROPERTY_OWNER = {
  UPDATE: 'Portfolio:Property:Update:Owner',
} as const;

const PROPERTY_MEDIA = {
  UPDATE: 'Portfolio:Property:Update:Media',
} as const;

const DEALS = {
  VIEW: 'Conversion:Deal:View',
  CREATE: 'Conversion:Deal:Create',
  UPDATE: 'Conversion:Deal:Update',
  REVIEW: 'Conversion:Deal:Review',
  ADMINISTRATE: 'Conversion:Deal:Administrate',
  EXPORT: 'Conversion:Deal:Export',
  CREATE_INVOICE: 'Conversion:Deal:Invoice:Create',
  CREATE_RECEIPT: 'Conversion:Deal:Receipt:Create'
} as const;
const ACTIVITIES = {
  UPDATE_PRICE_CHANGE: 'Pipeline:Activity:PriceChange:Update',
  CREATE_PRICE_CHANGE: 'Pipeline:Activity:PriceChange:Create',
  APPROVE_PRICE_CHANGE: 'Pipeline:Activity:PriceChange:Approve'
} as const;
const LEADS = {
  VIEW: 'Pipeline:Lead:View',
  CREATE: 'Pipeline:Lead:Create',
  UPDATE: 'Pipeline:Lead:Update',
  QUALIFY: 'Pipeline:Lead:Qualify',
  DELETE: 'Pipeline:Lead:Delete',
  VALUATE: 'Pipeline:Lead:Valuate',
  EXPORT: 'Pipeline:Lead:Export',
} as const;

export {
  LISTINGS,
  CUSTOMERS,
  PROPERTIES,
  PROPERTY_OWNER,
  PROPERTY_MEDIA,
  DEALS,
  ACTIVITIES,
  LEADS,
};

export type ListingPermission = (typeof LISTINGS)[keyof typeof LISTINGS];
export type CustomerPermission = (typeof CUSTOMERS)[keyof typeof CUSTOMERS];
export type PropertiesPermission = (typeof PROPERTIES)[keyof typeof PROPERTIES];
export type PropertiesOwnerPermission = (typeof PROPERTY_OWNER)[keyof typeof PROPERTY_OWNER];
export type PropertiesMediaPermission = (typeof PROPERTY_MEDIA)[keyof typeof PROPERTY_MEDIA];
export type DealPermission = (typeof DEALS)[keyof typeof DEALS];
export type ActivitiesPermissions = (typeof ACTIVITIES)[keyof typeof ACTIVITIES];
export type LeadsPermissions = (typeof LEADS)[keyof typeof LEADS];

export type Permissions =
  | ListingPermission
  | CustomerPermission
  | PropertiesPermission
  | PropertiesOwnerPermission
  | PropertiesMediaPermission
  | DealPermission
  | ActivitiesPermissions
  | LeadsPermissions;
