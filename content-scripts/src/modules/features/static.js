/**
 * Static features are UI modifications that only need to be applied:
 * - Once when the extension loads
 * - When user changes related settings
 * These changes persist until the next settings update.
 */

import {
  KeyArticlesButton,
  KeyBookmarksButton,
  KeyCommunitiesButton,
  KeyCreatorStudioButton,
  KeyCustomCss,
  KeyExploreButton,
  KeyFollowCount,
  KeyGrokButton,
  KeyHideComposer,
  KeyHideGrokDrawer,
  KeyHideMessagesDrawer,
  KeyHideViewCount,
  KeyHomeButton,
  KeyInterFont,
  KeyJobsButton,
  KeyLikeCount,
  KeyListsButton,
  KeyMessagesButton,
  KeyNavigationButtonsLabels,
  KeyNavigationCenter,
  KeyNotificationsButton,
  KeyProfileButton,
  KeyRemoveTimelineTabs,
  KeyReplyCount,
  KeyRetweetCount,
  KeySearchBar,
  KeySidebarLogo,
  KeyStickyHeader,
  KeyTimelineWidth,
  KeyTitleNotifications,
  KeyTopicsButton,
  KeyTransparentSearch,
  KeyTrendsHomeTimeline,
  KeyTweetButton,
  KeyTweetButtonPosition,
  KeyUnreadCountBadge,
  KeyVerifiedOrgsButton,
  KeyXPremiumButton,
} from "../../../../storage-keys";
import { changeCustomCss } from "../options/customCss";
import { changeFollowingAndFollowersCounts, changeLikeCount, changeReplyCount, changeRetweetCount } from "../options/hideVanityCounts";
import changeHideViewCounts from "../options/hideViewCount";
import { changeHideSearchBar, changeInterFont, changeTitleNotifications, changeTransparentSearchBar, changeTweetButton, changeTweetButtonPosition } from "../options/interface";
import {
  changeArticlesButton,
  changeBookmarksButton,
  changeCommunitiesButton,
  changeCreatorStudioButton,
  changeExploreButton,
  changeGrokButton,
  changeHomeButton,
  changeJobsButton,
  changeListsButton,
  changeMessagesButton,
  changeNavigationButtonsLabels,
  changeNavigationCenter,
  changeNotificationsButton,
  changeProfileButton,
  changeSidebarLogo,
  changeTopicsButton,
  changeUnreadCountBadge,
  changeVerifiedOrgsButton,
  changeXPremiumButton,
  hideGrokDrawer,
  hideMessagesDrawer,
} from "../options/navigation";
import {
  changeHideComposer,
  changePromotedPosts,
  changeStickyHeader,
  changeTimelineTabs,
  changeTimelineWidth,
  changeTopicsToFollow,
  changeTrendsHomeTimeline,
} from "../options/timeline";

export const staticFeatures = {
  timeline: (data) => {
    changeTimelineWidth(data[KeyTimelineWidth]);
    changeStickyHeader(data[KeyStickyHeader]);
    changeHideViewCounts(data[KeyHideViewCount]);
    changeTrendsHomeTimeline(data[KeyTrendsHomeTimeline]);
    // Promoted posts and Topics-to-Follow are always hidden (no user toggle)
    changePromotedPosts("on");
    changeTopicsToFollow("on");
    changeTimelineTabs(data[KeyRemoveTimelineTabs]);
    changeHideComposer(data[KeyHideComposer]);
    changeFollowingAndFollowersCounts(data[KeyFollowCount]);
    changeReplyCount(data[KeyReplyCount]);
    changeRetweetCount(data[KeyRetweetCount]);
    changeLikeCount(data[KeyLikeCount]);
  },
  navigation: (data) => {
    changeSidebarLogo(data[KeySidebarLogo]);
    changeNavigationButtonsLabels(data[KeyNavigationButtonsLabels]);
    changeNavigationCenter(data[KeyNavigationCenter]);
    changeUnreadCountBadge(data[KeyUnreadCountBadge]);
    hideGrokDrawer(data[KeyHideGrokDrawer]);
    hideMessagesDrawer(data[KeyHideMessagesDrawer]);
  },
  interface: (data) => {
    changeInterFont(data[KeyInterFont]);
    changeHideSearchBar(data[KeySearchBar]);
    changeTransparentSearchBar(data[KeyTransparentSearch]);
    changeTitleNotifications(data[KeyTitleNotifications]);
    changeTweetButton(data[KeyTweetButton]);
    changeTweetButtonPosition(data[KeyTweetButtonPosition]);
  },
  sidebar: (data) => {
    changeHomeButton(data[KeyHomeButton]);
    changeExploreButton(data[KeyExploreButton]);
    changeNotificationsButton(data[KeyNotificationsButton]);
    changeMessagesButton(data[KeyMessagesButton]);
    changeBookmarksButton(data[KeyBookmarksButton]);
    changeCreatorStudioButton(data[KeyCreatorStudioButton]);
    changeJobsButton(data[KeyJobsButton]);
    changeArticlesButton(data[KeyArticlesButton]);
    changeCommunitiesButton(data[KeyCommunitiesButton]);
    changeTopicsButton(data[KeyTopicsButton]);
    changeListsButton(data[KeyListsButton]);
    changeProfileButton(data[KeyProfileButton]);
    changeXPremiumButton(data[KeyXPremiumButton]);
    changeGrokButton(data[KeyGrokButton]);
    changeVerifiedOrgsButton(data[KeyVerifiedOrgsButton]);
  },
  advanced: (data) => {
    changeCustomCss(data[KeyCustomCss]);
  },
};

export const applyStaticFeatures = async (data) => {
  Object.values(staticFeatures).forEach((feature) => feature(data));
};
