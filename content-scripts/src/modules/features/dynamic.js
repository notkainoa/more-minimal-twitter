/**
 * Dynamic features that respond to Twitter's DOM updates:
 * - Navigation buttons
 * - Timeline customizations
 * - View counts
 * Applied via MutationObserver on relevant DOM changes
 */

import {
  KeyCommunitiesButton,
  KeyHideComposer,
  KeyHideGrokDrawer,
  KeyHideMessagesDrawer,
  KeyHideViewCount,
  KeyListsButton,
  KeyRemoveTimelineTabs,
  KeyTopicsButton,
  KeyTrendsHomeTimeline,
  KeyXPremiumButton,
  KeyNavigationButtonsLabels
} from "../../../../storage-keys";
import changeHideViewCounts from "../options/hideViewCount";
import { addCommunitiesButton, addListsButton, addTopicsButton, addXPremiumButton, hideGrokDrawer, hideMessagesDrawer, changeNavigationButtonsLabels } from "../options/navigation";
import { changeHideComposer, changeTimelineTabs, changeTrendsHomeTimeline, enableGrokDrawerOnGrokButtonClick } from "../options/timeline";
import hideRightSidebar from "../utilities/hideRightSidebar";
import { updateLeftSidebarPositioning } from "../utilities/leftSidebarPosition";
import { addSmallerSearchBarStyle } from "../utilities/other-styles";
import { getStorage } from "../utilities/storage";
import throttle from "../utilities/throttle";

export const dynamicFeatures = {
  general: async () => {
    const data = await getStorage([KeyHideViewCount, KeyHideGrokDrawer]);

    changeHideViewCounts(data[KeyHideViewCount]);
    hideRightSidebar();
    addSmallerSearchBarStyle();
    updateLeftSidebarPositioning();
    enableGrokDrawerOnGrokButtonClick(data[KeyHideGrokDrawer]);
  },
  navigation: (data) => {
    changeNavigationButtonsLabels(data[KeyNavigationButtonsLabels]);
  },
  timeline: (data) => {
    changeTimelineTabs(data[KeyRemoveTimelineTabs]);
    changeHideComposer(data[KeyHideComposer]);
    changeTrendsHomeTimeline(data[KeyTrendsHomeTimeline]);
  },
  sidebarButtons: async () => {
    const data = await getStorage([KeyListsButton, KeyCommunitiesButton, KeyTopicsButton, KeyXPremiumButton]);

    if (!data) return;

    if (data[KeyListsButton] === "on") addListsButton();
    if (data[KeyCommunitiesButton] === "on") addCommunitiesButton();
    if (data[KeyTopicsButton] === "on") addTopicsButton();
    if (data[KeyXPremiumButton] === "on") addXPremiumButton();
  },
};

export const runDynamicFeatures = throttle(async () => {
  const data = await getStorage([
    KeyTrendsHomeTimeline,
    KeyRemoveTimelineTabs,
    KeyHideComposer,
    KeyHideGrokDrawer,
    KeyHideMessagesDrawer,
    KeyNavigationButtonsLabels
  ]);

  if (data) {
    dynamicFeatures.general();
    await dynamicFeatures.sidebarButtons();
    dynamicFeatures.timeline(data);
    dynamicFeatures.navigation(data);

    // The Grok drawer appears dynamically, so we need to handle it here as well
    // as in the static features module
    hideGrokDrawer(data?.[KeyHideGrokDrawer]);
    hideMessagesDrawer(data?.[KeyHideMessagesDrawer]);
  }
}, 50);
