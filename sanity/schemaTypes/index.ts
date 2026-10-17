import { authorType } from "./documents/authorType";
import { categoryType } from "./documents/categoryType";
import { postType } from "./documents/postType";
import { servicePageType } from "./documents/servicePageType";
import { siteSettingsType } from "./documents/siteSettingsType";
import { staffType } from "./documents/staffType";
import { tagType } from "./documents/tagType";
import { codeBlockType } from "./objects/codeBlockType";
import { imageWithAltType } from "./objects/imageWithAltType";
import { socialLinkType } from "./objects/socialLinkType";

export const schemaTypes = [
  postType,
  categoryType,
  staffType,
  servicePageType,
  tagType,
  authorType,
  siteSettingsType,
  codeBlockType,
  imageWithAltType,
  socialLinkType,
];
