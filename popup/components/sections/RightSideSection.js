import { useEffect, useState } from "react";
import { KeyHideGrokDrawer, KeyHideMessagesDrawer, KeySearchBar, KeyTransparentSearch, KeyTrendsHomeTimeline, KeyTweetButton, KeyTweetButtonPosition, defaultPreferences } from "../../../storage-keys";
import { getStorage } from "../../utilities/chromeStorage";
import SectionLabel from "../ui/SectionLabel";
import { SegmentedControl } from "../ui/SegmentedControl";
import SwitchControl from "../ui/SwitchControl";

const RightSideSection = () => {
  // Mirrors the Tweet Button switch (via onChange + initial storage read) so the
  // position row stays in sync without waiting for a popup remount.
  const [tweetButtonOn, setTweetButtonOn] = useState(defaultPreferences[KeyTweetButton] === "on");

  useEffect(() => {
    getStorage(KeyTweetButton).then((storedValue) => {
      if (storedValue !== undefined) setTweetButtonOn(storedValue === "on");
    });
  }, []);

  return (
    <section className="flex flex-col gap-y-2">
      <SectionLabel htmlFor="user-control-right-side">Right Side</SectionLabel>
      <div id="user-control-right-side">
        <form className="flex flex-col items-center justify-between px-4 dark:bg-x-bgTwoDark bg-x-bgTwo rounded-2xl">
          <div className="w-full py-4">
            <div className="flex flex-col gap-y-4">
              <SwitchControl label="Search Bar" storageKey={KeySearchBar} />
              <SwitchControl label="Transparent Search Bar" storageKey={KeyTransparentSearch} />
              <SwitchControl label="Trends" storageKey={KeyTrendsHomeTimeline} />
              <SwitchControl label="Tweet Button" storageKey={KeyTweetButton} onChange={setTweetButtonOn} />
              <div className={`flex items-center gap-x-4${tweetButtonOn ? "" : " opacity-40 pointer-events-none"}`} aria-disabled={!tweetButtonOn}>
                <span className="text-[15px] font-medium whitespace-nowrap">Tweet Button Position</span>
                <SegmentedControl
                  storageKey={KeyTweetButtonPosition}
                  disabled={!tweetButtonOn}
                  segments={[
                    {
                      value: "floating",
                      label: "Floating"
                    },
                    {
                      value: "sidebar",
                      label: "Sidebar"
                    }
                  ]}
                />
              </div>
              <SwitchControl label="Hide Grok Drawer" storageKey={KeyHideGrokDrawer} />
              <SwitchControl label="Hide DMs Drawer" storageKey={KeyHideMessagesDrawer} />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RightSideSection;
