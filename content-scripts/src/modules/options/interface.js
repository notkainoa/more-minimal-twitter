import { KeyNavigationButtonsLabels, KeyTitleNotifications } from "../../../../storage-keys";
import selectors from "../../selectors";
import addStyles, { removeStyles } from "../utilities/addStyles";
import { getStorage } from "../utilities/storage";

const sidebarComposeOriginalHtmlDataKey = "mtOriginalInnerHtml";
const sidebarComposeIconPath =
  "M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z";
const sidebarComposeIconUrl = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${sidebarComposeIconPath}"/></svg>`
)}")`;
const sidebarTweetButtonContentSelector = `${selectors.tweetButton} > div[dir="ltr"]`;
const sidebarNavHoverContainerSelector = `${selectors.leftSidebar} > div > div > div > div:nth-child(2):has(${selectors.leftSidebarLinks}:hover)`;

const getSidebarTweetButtonContent = () => document.querySelector(`${selectors.tweetButton} > div[dir="ltr"]`);

const restoreSidebarTweetButtonContent = () => {
  const content = getSidebarTweetButtonContent();
  if (!content) {
    return;
  }

  const originalHtml = content.dataset[sidebarComposeOriginalHtmlDataKey];
  if (!originalHtml) {
    return;
  }

  content.innerHTML = originalHtml;
  delete content.dataset[sidebarComposeOriginalHtmlDataKey];
};

const getSidebarTweetButtonLabelStyles = (navigationButtonsLabels) => {
  const iconOnlyStyles = `
    ${selectors.tweetButton} {
      width: 52px;
      min-width: 52px;
      height: 52px;
      padding: 0;
      border-radius: 9999px;
    }

    ${sidebarTweetButtonContentSelector}::after {
      opacity: 0;
      width: 0;
      margin-left: 0;
    }
  `;

  const expandedStyles = `
    ${selectors.tweetButton} {
      width: auto;
      min-width: 0;
      height: 52px;
      padding: 0 24px;
      border-radius: 9999px;
    }

    ${sidebarTweetButtonContentSelector}::after {
      opacity: 1;
      width: auto;
      margin-left: 12px;
    }
  `;

  switch (navigationButtonsLabels) {
    case "always":
      return expandedStyles;

    case "hover":
      return `
        ${iconOnlyStyles}

        ${sidebarNavHoverContainerSelector} ${selectors.tweetButton} {
          width: auto;
          min-width: 0;
          padding: 0 24px;
        }

        ${sidebarNavHoverContainerSelector} ${sidebarTweetButtonContentSelector}::after {
          opacity: 1;
          width: auto;
          margin-left: 12px;
        }
      `;

    case "never":
    default:
      return iconOnlyStyles;
  }
};

// Function to change the title notification count
let nt; // Title Notifications timeout
export const changeTitleNotifications = (tf) => {
  const run = async () => {
    let setting = tf;

    if (!tf) {
      setting = await getStorage(KeyTitleNotifications);
    }

    const favicon = document.querySelector('link[rel="shortcut icon"]');

    if (setting === "on") {
      favicon.setAttribute("href", favicon.href.replace("twitter.ico", "twitter-pip.2.ico"));
    } else {
      if (document.title.charAt(0) === "(") {
        document.title = document.title.split(" ").slice(1).join(" ");
      }

      if (document.title.charAt(0) === "(") {
        document.title = document.title.split(" ").slice(1).join(" ");
      }

      clearTimeout(nt);
      nt = setTimeout(() => {
        favicon.setAttribute("href", favicon.href.replace("-pip.2", ""));
      });
    }
  };

  run();

  const observer = new MutationObserver(() => {
    run();
  });
  const config = { subtree: true, characterData: true, childList: true };
  const target = document.querySelector("title");

  if (target) observer.observe(target, config);
};

// Function to change to Inter Font
export const changeInterFont = (interFont) => {
  switch (interFont) {
    case "on":
      addStyles(
        "interFont",
        `
        @font-face {
          font-family: 'Inter';
          src: url('${chrome.runtime.getURL("fonts/inter-subset.woff2")}') format('woff2');
        }

        div, span, input, textarea {
          font-family: Inter, TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
        `
      );
      break;

    case "off":
      removeStyles("interFont");
      break;
  }
};

// Function to change Tweet Button
export const changeTweetButton = (tweetButton) => {
  switch (tweetButton) {
    case "off":
      addStyles(
        "tweetButton",
        `
        ${selectors.tweetButton} {
          visibility: hidden;
        }
        `
      );
      break;

    case "on":
      removeStyles("tweetButton");
      break;
  }
};

export const changeTweetButtonPosition = async (tweetButtonPosition, navigationButtonsLabels) => {
  const labelsSetting = navigationButtonsLabels ?? (await getStorage(KeyNavigationButtonsLabels));

  switch (tweetButtonPosition) {
    case "sidebar":
      restoreSidebarTweetButtonContent();
      addStyles(
        "tweetButtonPosition",
        `
        @media only screen and (min-width: 1000px) {
          ${selectors.tweetButton} {
            position: static;
            right: auto;
            bottom: auto;
            align-self: flex-start;
          }

          ${sidebarTweetButtonContentSelector} {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0;
          }

          ${sidebarTweetButtonContentSelector} > * {
            display: none !important;
          }

          ${sidebarTweetButtonContentSelector}::before {
            content: "";
            display: block;
            width: 24px;
            height: 24px;
            flex: none;
            background-color: currentColor;
            -webkit-mask-image: ${sidebarComposeIconUrl};
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
            -webkit-mask-size: contain;
            mask-image: ${sidebarComposeIconUrl};
            mask-repeat: no-repeat;
            mask-position: center;
            mask-size: contain;
          }

          ${sidebarTweetButtonContentSelector}::after {
            content: "Post";
            display: inline;
            opacity: 0;
            width: 0;
            overflow: hidden;
            margin-left: 0;
            white-space: nowrap;
            font: inherit;
            font-size: 15px;
          }

          ${getSidebarTweetButtonLabelStyles(labelsSetting)}
        }

        @media only screen and (min-width: 1000px) and (max-width: 1264px) {
          ${selectors.tweetButton} {
            align-self: center;
          }
        }
        `
      );
      break;

    case "floating":
      restoreSidebarTweetButtonContent();
      addStyles(
        "tweetButtonPosition",
        `
        @media only screen and (min-width: 1000px) {
          ${selectors.accountSwitcherButton} {
            bottom: 12px;
          }

          ${selectors.tweetButton} {
            position: fixed;
            right: 16px;
            bottom: 24px;
          }

          ${selectors.leftSidebar} > div > div > div {
            overflow: visible; /* Safari overflow issue: https://bugs.webkit.org/show_bug.cgi?id=160953 */
          }
        }
        `
      );
      break;
  }
};

export const changeHideSearchBar = (searchBar) => {
  switch (searchBar) {
    case "off":
      addStyles(
        "searchBar",
        `${selectors.searchBox} {
          display: none;
          visibility: hidden;
        }`
      );
      addStyles(
        "trendsHomeTimeline-more",
        `@media only screen and (min-width: 1265px) {
          ${selectors.rightSidebar} section[aria-labelledby^="accessible-list-"] {
            top: 12px !important;
          }
          .mt-recentMedia-photoGrid {
            top: 12px !important;
          }
        }`
      );
      break;

    case "on":
      removeStyles("searchBar");
      addStyles(
        "trendsHomeTimeline-more",
        `@media only screen and (min-width: 1265px) {
          ${selectors.rightSidebar} section[aria-labelledby^="accessible-list-"] {
            top: unset;
          }
          .mt-recentMedia-photoGrid {
            top: unset !important;
          }
        }`
      );
      break;
  }
};

export const changeTransparentSearchBar = (transparentSearch) => {
  switch (transparentSearch) {
    case "on":
      addStyles(
        "transparentSearch",
        `
        ${selectors.searchBox} > div:nth-child(1) > div {
          background-color: transparent;
        }
        ${selectors.searchBoxInput} {
          transform: translateX(2ch);
          margin-left: -2.5ch;
        }
        `
      );
      break;

    case "off":
      removeStyles("transparentSearch");
      break;
  }
};
