import { KeyInterFont, KeySearchBar, KeyTitleNotifications, KeyTransparentSearch, KeyTweetButton, KeyTweetButtonPosition } from "../../../storage-keys";
import SectionLabel from "../ui/SectionLabel";
import { SegmentedControl } from "../ui/SegmentedControl";
import SwitchControl from "../ui/SwitchControl";

const InterfaceSection = () => (
  <section className="flex flex-col gap-y-2">
    <SectionLabel htmlFor="user-control-interface">Interface</SectionLabel>
    <div id="user-control-interface">
      <form className="flex flex-col items-center justify-between px-4 dark:bg-x-bgTwoDark bg-x-bgTwo rounded-2xl">
        <div className="w-full py-4">
          <div className="flex flex-col gap-y-4">
            <SwitchControl label="Inter Font" storageKey={KeyInterFont} />
            <SwitchControl label="Search Bar" storageKey={KeySearchBar} />
            <SwitchControl label="Transparent Search Bar" storageKey={KeyTransparentSearch} />
            <SwitchControl label="Tweet Button" storageKey={KeyTweetButton} />
            <div className="flex items-center gap-x-4">
              <span className="text-[15px] font-medium whitespace-nowrap">Tweet Button Position</span>
              <SegmentedControl
                storageKey={KeyTweetButtonPosition}
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
            <SwitchControl label="Notifications in Title" storageKey={KeyTitleNotifications} />
          </div>
        </div>
      </form>
    </div>
  </section>
);

export default InterfaceSection;
